import type { APIRoute } from 'astro';
import { TASK_SOLUTIONS } from '../../../lib/solutions';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

const isProd = import.meta.env.PROD || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production');

// Allowed admin emails list or environment variable
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || import.meta.env.ADMIN_EMAILS || 'iputuagus.wahyu@gmail.com')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

// Pastikan di produksi wajib disetel lewat environment variable tanpa fallback bernilai tebak
const configuredPasskey = process.env.ADMIN_PASSKEY || import.meta.env.ADMIN_PASSKEY || '';
const ADMIN_PASSKEY = configuredPasskey || (!isProd ? 'awd-course-admin-dev' : '');

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.taskId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Parameter taskId wajib disertakan.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { taskId, token, passkey } = body;
    const taskSolution = TASK_SOLUTIONS[taskId];

    if (!taskSolution) {
      return new Response(
        JSON.stringify({ success: false, message: 'Kunci jawaban untuk tugas ini tidak ditemukan.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let isAuthorized = false;
    let adminName = '';

    // Check 1: Admin Passkey verification (hanya aktif jika ADMIN_PASSKEY terkonfigurasi)
    if (ADMIN_PASSKEY && passkey && typeof passkey === 'string' && passkey === ADMIN_PASSKEY) {
      isAuthorized = true;
      adminName = 'Pemateri (Kunci Akses)';
    }

    // Check 2: Supabase OAuth token verification
    if (!isAuthorized && token && typeof token === 'string' && supabase) {
      try {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
          const userEmail = (data.user.email || '').toLowerCase();
          const userRole = data.user.user_metadata?.role || '';

          if (userRole === 'admin' || (userEmail && ADMIN_EMAILS.includes(userEmail))) {
            isAuthorized = true;
            adminName = data.user.user_metadata?.full_name || data.user.email || 'Admin Terverifikasi';
          }
        }
      } catch (authErr) {
        console.warn('Supabase token verification error in solution API:', authErr);
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Akses ditolak: Autentikasi akun Pengajar atau Admin diperlukan untuk melihat kunci jawaban.',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        authorizedAs: adminName,
        solution: taskSolution,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, message: err?.message || 'Terjadi kesalahan server internal.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
