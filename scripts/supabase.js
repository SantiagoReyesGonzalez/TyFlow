const SUPABASE_URL = 'https://iryiobhmmvdnvwfovuye.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__ebSt_oeNFqErCtk1ZUfSg_P0V6vNt7';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// expón SOLO el cliente
window.supabaseClient = supabaseClient;

console.log('Supabase inicializado correctamente');