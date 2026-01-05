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

  // Comprobamos roles para determinar si es administrador, pero NO redirigimos
  // a usuarios no-admin: todos deben poder ver el dashboard; solo mostramos
  // opciones adicionales para admins en el cliente (y siempre verificar en backend).
  try {
    let isAdmin = false;

    // Intentamos obtener roles desde `usuarioRol` -> `roles` (si existen)
    const { data: usuarioRoles, error: usuarioRolesError } = await window.supabaseClient
      .from('usuarioRol')
      .select('*')
      .eq('usuarioID', user.id);

    if (usuarioRolesError) console.debug('Comprueba tabla usuarioRol:', usuarioRolesError);

    if (usuarioRoles && usuarioRoles.length > 0) {
      const roleIds = usuarioRoles.map(r => r.rolID).filter(Boolean);
      if (roleIds.length > 0) {
        const { data: roles } = await window.supabaseClient
          .from('roles')
          .select('id,nombreRol')
          .in('id', roleIds);

        if (roles && roles.some(r => (r.nombreRol || '').toLowerCase().includes('administr'))) {
          isAdmin = true;
        }
      }
    }

    // Exponer información mínima y el rol para uso en el cliente
    window.currentUser = { id: user.id, email: user.email };
    window.currentUserIsAdmin = isAdmin;

    // Añadir atributo dataset al body para control visual en CSS/JS
    const applyRoleToBody = () => {
      try {
        if (document && document.body) {
          document.body.dataset.role = isAdmin ? 'admin' : 'user';
          if (isAdmin) document.body.classList.add('is-admin');
        }
      } catch (e) {
        console.debug('No se pudo aplicar role al body:', e);
      }
    };

    if (document?.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyRoleToBody);
    } else {
      applyRoleToBody();
    }

    console.log('Usuario autenticado:', window.currentUser, 'isAdmin=', isAdmin);
    // No redirigimos: permitimos que tanto usuarios como admins sigan al dashboard
    return;
  } catch (err) {
    console.error('Error comprobando rol de administrador:', err);
    // En caso de error de comprobación, exponer usuario como no-admin (seguro por defecto)
    window.currentUser = { id: user.id, email: user.email };
    window.currentUserIsAdmin = false;
    try {
      if (document?.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          if (document && document.body) document.body.dataset.role = 'user';
        });
      } else {
        if (document && document.body) document.body.dataset.role = 'user';
      }
    } catch (e) {
      console.debug('No se pudo aplicar role por fallback:', e);
    }
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
