import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gfpvkkroxjxpyfinhopi.supabase.co'
const supabaseAnonKey = 'sb_publishable_6P_NC8lrMoWciQ-5YPMELw_JOMMHqM2'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)