(async () => {
  if (!window.supabaseClient) {
    console.error('Supabase no inicializado');
    window.location.href = '../index.html';
    return;
  }

  // obtener sesión
  const { data, error } = await window.supabaseClient.auth.getSession();

  if (error || !data.session) {
    console.warn('No hay sesión activa o hubo error:', error);
    window.location.href = '../index.html';
    return;
  }

  const user = data.session.user;

  // Verificar si el usuario es administrador.
  // Intentaremos varias comprobaciones comunes según esquemas posibles.
  try {
    // Nota: no se asume columna `is_admin` en la tabla `usuarios`.
    // Se comprueba el rol a través de `usuarioRol` y `roles`.

    // 2) Comprobar roles a través de `usuarioRol` (usuarioID, rolID) y `roles` (nombreRol)
    const { data: usuarioRoles, error: usuarioRolesError } = await window.supabaseClient
      .from('usuarioRol')
      .select('*')
      .eq('usuarioID', user.id);

    if (usuarioRolesError) console.debug('Comprueba tabla usuarioRol:', usuarioRolesError);

    if (usuarioRoles && usuarioRoles.length > 0) {
      // obtener los rolID (son bigint en tu esquema)
      const roleIds = usuarioRoles.map(r => r.rolID).filter(Boolean);
      if (roleIds.length > 0) {
        const { data: roles } = await window.supabaseClient
          .from('roles')
          .select('id,nombreRol')
          .in('id', roleIds);

        if (roles && roles.some(r => (r.nombreRol || '').toLowerCase() === 'admin')) {
          return; // es admin
        }
      }
    }

    // Si no se detectó admin, redirigir
    console.warn('Acceso denegado: usuario no administrador');
    window.location.href = '../index.html';
    return;
  } catch (err) {
    console.error('Error comprobando rol de administrador:', err);
    window.location.href = '../index.html';
    return;
  }
})();

// Si la sesión cambia (p. ej. refresh token falla), redirigir. Añadimos listener para depuración.
window.supabaseClient?.auth.onAuthStateChange((event, session) => {
  console.log('protect.js onAuthStateChange:', event, session);
  // si la sesión se pierde explícitamente, redirigir al login
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED' || (event === 'TOKEN_REFRESH_FAILED')) {
    try {
      window.location.href = '../index.html';
    } catch (e) {
      console.error('Error redirigiendo tras cambio de auth:', e);
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout');

  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    await window.supabaseClient.auth.signOut();
    window.location.href = '/TyFlow/index.html';
  });
});
