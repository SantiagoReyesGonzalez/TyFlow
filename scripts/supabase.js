const SUPABASE_URL = 'https://iryiobhmmvdnvwfovuye.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__ebSt_oeNFqErCtk1ZUfSg_P0V6vNt7';

// Crear cliente y forzar persistencia de sesión en el navegador
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
    }
  }
);

// expón SOLO el cliente
window.supabaseClient = supabaseClient;

console.log('Supabase inicializado correctamente');

// Listener para cambios de estado de autenticación (útil para depuración)
window.supabaseClient.auth.onAuthStateChange((event, session) => {
  console.log('onAuthStateChange event:', event, 'session:', session);
});