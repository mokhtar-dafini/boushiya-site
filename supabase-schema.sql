-- ==============================================================================
-- حفل البوشية - هيبة الذهب
-- سكريبت إنشاء جدول الزوار وتفعيل الصلاحيات في Supabase
-- انسخ هذا الكود بالكامل والصقه في SQL Editor داخل Supabase واضغط RUN
-- ==============================================================================

-- 1. تفعيل الامتداد الخاص بتوليد UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. إنشاء جدول الزوار والحجوزات (visitors)
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  
  ticket_category TEXT DEFAULT 'عادية' NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  estimated_total NUMERIC DEFAULT 150 NOT NULL,
  
  status TEXT DEFAULT 'pending' NOT NULL,
  notes TEXT,
  
  user_agent TEXT,
  ip_address TEXT
);

-- 3. منح الصلاحيات الكاملة لمستخدمي API (حل مشكلة permission denied)
GRANT ALL ON TABLE public.visitors TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 4. الفهارس
CREATE INDEX IF NOT EXISTS idx_visitors_phone ON public.visitors(phone);
CREATE INDEX IF NOT EXISTS idx_visitors_email ON public.visitors(email);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON public.visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON public.visitors(status);

-- 5. تفعيل أمان مستوى الصفوف (RLS) وسياسات الوصول
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public visitors insert" ON public.visitors;
CREATE POLICY "Allow public visitors insert"
  ON public.visitors
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read" ON public.visitors;
CREATE POLICY "Allow authenticated read"
  ON public.visitors
  FOR SELECT
  TO authenticated, service_role
  USING (true);

DROP POLICY IF EXISTS "Allow update for service role" ON public.visitors;
CREATE POLICY "Allow update for service role"
  ON public.visitors
  FOR UPDATE
  TO authenticated, service_role
  USING (true);

DROP POLICY IF EXISTS "Allow delete for service role" ON public.visitors;
CREATE POLICY "Allow delete for service role"
  ON public.visitors
  FOR DELETE
  TO authenticated, service_role
  USING (true);
