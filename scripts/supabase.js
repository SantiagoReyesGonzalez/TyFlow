// Configuración de Supabase
const SUPABASE_URL = 'https://iryiobhmmvdnvwfovuye.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__ebSt_oeNFqErCtk1ZUfSg_P0V6vNt7';

(function initSupabase() {
  if (!window.supabase) {
    console.error('Supabase JS library no está cargada. Asegúrate de incluir el CDN antes de este script.');
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Faltan credenciales de Supabase. Revisa SUPABASE_URL y SUPABASE_ANON_KEY.');
    return;
  }

  if (typeof SUPABASE_ANON_KEY === 'string' && SUPABASE_ANON_KEY.includes('service_role')) {
    console.warn('Parece que estás usando una clave `service_role`. No la expongas en el cliente. Usa la clave anon/public.');
  }

  try {
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // Mantener compatibilidad con código existente que usa `supabase`
    window.supabase = client;
    console.log('Supabase inicializado correctamente.');
  } catch (err) {
    console.error('Error inicializando Supabase:', err);
  }
})();

