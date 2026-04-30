import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // localStorage에 세션 유지
    autoRefreshToken: true,    // 만료 전 자동 갱신
    detectSessionInUrl: true,  // OTP 콜백 URL 자동 감지
  },
})
