-- ==============================================================================
-- SKEMA DATABASE SUPABASE UNTUK Awd COURSE
-- Jalankan skrip SQL ini di menu: Supabase Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Tabel Profil Pengguna (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Mengaktifkan Row Level Security (RLS) pada tabel profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Setiap pengguna bisa melihat profil sendiri
CREATE POLICY "Pengguna bisa melihat profil sendiri"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Pengguna bisa memperbarui profil sendiri
CREATE POLICY "Pengguna bisa memperbarui profil sendiri"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger Otomatis: Membuat baris profil saat user baru mendaftar di auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Tabel Progres Belajar Siswa (Course Progress)
CREATE TABLE IF NOT EXISTS public.course_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, course_id, lesson_id)
);

-- Mengaktifkan Row Level Security (RLS) pada tabel course_progress
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Pengguna hanya dapat membaca data progres belajarnya sendiri
CREATE POLICY "Pengguna bisa membaca progres sendiri"
  ON public.course_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Pengguna bisa menambahkan materi yang diselesaikan
CREATE POLICY "Pengguna bisa mencatat progres selesai"
  ON public.course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Pengguna bisa membatalkan/menghapus tanda selesai materi sendiri
CREATE POLICY "Pengguna bisa menghapus status progres sendiri"
  ON public.course_progress FOR DELETE
  USING (auth.uid() = user_id);
