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
    // 1) Buscar campo booleano `is_admin` en la tabla `usuarios` (si existe)
    const { data: userRow, error: userRowError } = await window.supabaseClient
      .from('usuarios')
      .select('id,is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (userRowError) console.debug('Comprueba tabla usuarios:', userRowError);
    if (userRow && userRow.is_admin) {
      // es admin -> permitir acceso
      return;
    }

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

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout');

  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    await window.supabaseClient.auth.signOut();
    window.location.href = '/TyFlow/index.html';
  });
});
