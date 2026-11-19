import { createClient } from '@supabase/supabase-js';

function cleanSupabaseUrl(url: string): string {
  if (!url) return '';
  return url.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseUrl = cleanSupabaseUrl(rawUrl);
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

// التحقق من أن القيم حقيقية وليست قيماً افتراضية تجريبية
const isPlaceholder = (val: string) => {
  return (
    !val ||
    val.includes('your-project-id') ||
    val.includes('your-project-ref') ||
    val.includes('your-anon-public-key') ||
    val.includes('your-service-role-secret-key')
  );
};

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  !isPlaceholder(supabaseUrl) &&
  ((supabaseServiceRoleKey && !isPlaceholder(supabaseServiceRoleKey)) ||
   (supabaseAnonKey && !isPlaceholder(supabaseAnonKey)))
);

// عميل الخادم (Server Client)
export function getServiceSupabase() {
  if (!isSupabaseConfigured) {
    return null;
  }
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// عميل المتصفح (Client-side Supabase)
export const supabase = isSupabaseConfigured && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
