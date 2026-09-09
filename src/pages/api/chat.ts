import type { APIRoute } from 'astro';
import { sendCloudflareAIChatMessage } from '../../lib/cloudflareAI';
import { sendMistralChatMessage, type ChatMessage } from '../../lib/mistral';

export const prerender = false;

// In-memory sliding window rate limiter (15 requests per 60s per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientIp: string, maxRequests = 15, windowMs = 60000): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  if (rateLimitMap.size > 1000) {
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) rateLimitMap.delete(ip);
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const rateCheck = checkRateLimit(clientIp, 15, 60000);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Terlalu banyak pesan dalam waktu singkat. Mohon tunggu ${rateCheck.retryAfter || 30} detik sebelum mengirim kembali.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateCheck.retryAfter || 30),
          },
        }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Content-Type harus application/json',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();
    const { messages, model } = body as {
      messages: ChatMessage[];
      model?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Parameter "messages" wajib disertakan dan berupa array.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validasi panjang pesan terakhir
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || !lastMsg.content || typeof lastMsg.content !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Pesan pengguna tidak valid.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (lastMsg.content.trim().length > 2000) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Pesan terlalu panjang (maksimal 2000 karakter).',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const cfAccountId =
      process.env.CLOUDFLARE_ACCOUNT_ID ||
      import.meta.env.CLOUDFLARE_ACCOUNT_ID;
    const cfToken =
      process.env.CLOUDFLARE_API_TOKEN ||
      import.meta.env.CLOUDFLARE_API_TOKEN;
    const mistralKey =
      process.env.MISTRAL_API_KEY ||
      import.meta.env.MISTRAL_API_KEY;

    let reply = '';
    let selectedModel = '';

    // 1. Prioritaskan Cloudflare Workers AI jika akun & token terisi
    if (cfAccountId && cfToken) {
      selectedModel =
        model ||
        process.env.CLOUDFLARE_AI_MODEL ||
        import.meta.env.CLOUDFLARE_AI_MODEL ||
        '@cf/meta/llama-3.1-8b-instruct';

      try {
        reply = await sendCloudflareAIChatMessage(
          messages,
          cfAccountId,
          cfToken,
          selectedModel
        );
      } catch (cfErr: any) {
        console.warn('Cloudflare Workers AI mengalami kendala:', cfErr?.message || cfErr);

        // Jika kredensial Mistral juga tersedia, otomatis failover ke Mistral AI!
        if (mistralKey) {
          console.info('Otomatis mengalihkan pesan ke Mistral AI sebagai cadangan...');
          selectedModel =
            process.env.MISTRAL_MODEL ||
            import.meta.env.MISTRAL_MODEL ||
            'mistral-small-latest';
          reply = await sendMistralChatMessage(
            messages,
            mistralKey,
            selectedModel
          );
        } else {
          throw cfErr;
        }
      }
    } else if (mistralKey) {
      // 2. Gunakan Mistral AI jika hanya Mistral yang dikonfigurasi
      selectedModel =
        model ||
        process.env.MISTRAL_MODEL ||
        import.meta.env.MISTRAL_MODEL ||
        'mistral-small-latest';
      reply = await sendMistralChatMessage(
        messages,
        mistralKey,
        selectedModel
      );
    } else {
      throw new Error(
        'CONFIG_MISSING: Kredensial AI (Cloudflare Workers AI atau Mistral) belum dikonfigurasi di file .env.'
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        reply,
        model: selectedModel,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('API /api/chat error:', err);
    console.error('API /api/chat STACK:', err?.stack);

    // Filter pesan error agar tidak membocorkan teknis/stack trace ke user
    let friendlyMessage =
      'Mohon maaf, asisten AI sedang mengalami kendala koneksi sementara. Silakan coba kirim ulang pertanyaan Anda beberapa saat lagi.';

    const errString = String(err?.message || err || '').toLowerCase();
    if (
      errString.includes('429') ||
      errString.includes('rate') ||
      errString.includes('quota') ||
      errString.includes('limit')
    ) {
      friendlyMessage =
        'Layanan asisten AI sedang menerima banyak pesan saat ini. Mohon tunggu sekitar 1–2 menit sebelum mengirim pertanyaan kembali.';
    } else if (
      errString.includes('api_key') ||
      errString.includes('unauthorized') ||
      errString.includes('401') ||
      errString.includes('konfigurasi')
    ) {
      friendlyMessage =
        'Layanan asisten AI sedang dalam pemeliharaan konfigurasi server. Silakan hubungi pengelola kursus atau coba beberapa saat lagi.';
    } else if (
      errString.includes('timeout') ||
      errString.includes('network') ||
      errString.includes('econnrefused') ||
      errString.includes('fetch failed')
    ) {
      friendlyMessage =
        'Koneksi ke server AI terputus sementara. Silakan pastikan koneksi internet stabil lalu coba kirim kembali.';
    } else if (
      errString.includes('503') ||
      errString.includes('502') ||
      errString.includes('overloaded') ||
      errString.includes('capacity')
    ) {
      friendlyMessage =
        'Server AI saat ini sedang penuh kapasitas. Silakan coba kembali dalam 1–2 menit.';
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: friendlyMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

