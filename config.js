/**
 * ZYVEX.ID - Central Configuration
 * Project ID: tluaokgtlxpqjiwxskvw
 */

const CONFIG = {
    SUPABASE_URL: 'https://tluaokgtlxpqjiwxskvw.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_GT-vawRXDpejjYYW7So9Hg_cdsKVCCY',
    WHATSAPP_ADMIN: '6283800103797'
};

// Inisialisasi Supabase Client Global
const { createClient } = supabase;
const _supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_PUBLISHABLE_KEY);
