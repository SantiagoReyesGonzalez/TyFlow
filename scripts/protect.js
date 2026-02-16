(async () => {
  // 1. Verificamos si Supabase está cargado
  if (!window.supabaseClient) {
    console.error('Supabase no inicializado');
    window.location.href = '../index.html';
    return;
  }

  // 2. Obtenemos la sesión actual
  const { data, error } = await window.supabaseClient.auth.getSession();

  // 3. Si hay error o NO hay sesión, lo sacamos
  if (error || !data.session) {
    console.warn('No hay sesión activa o hubo error:', error);
    window.location.href = '../index.html';
    return;
  }

  // 4. Si llega aquí, significa que tiene sesión. 
  // ¡No hacemos nada más! El usuario puede ver la página.
  console.log('Sesión válida. Acceso permitido.');

})();
