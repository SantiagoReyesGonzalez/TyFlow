document.addEventListener('DOMContentLoaded', () => {
  if (!window.supabaseClient) return;

  // ===== Helpers UI =====
  function setAdminVisibility() {
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = window.currentUserIsAdmin ? '' : 'none';
    });
  }

  // ===== Main =====
  async function loadUser() {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      // ---- Datos básicos usuario ----
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('primerNombre, primerApellido')
        .eq('id', user.id)
        .maybeSingle();

      document.getElementById('ui-nombre').textContent =
        usuario?.primerNombre || user.user_metadata?.full_name || user.email;

      document.getElementById('ui-apellido').textContent =
        usuario?.primerApellido || '';

      // ---- Rol ----
      let rolName = '-';
      window.currentUserIsAdmin = false;

      const { data: usuarioRol } = await supabase
        .from('usuarioRol')
        .select('rolID')
        .eq('usuarioID', user.id)
        .maybeSingle();

      if (usuarioRol?.rolID) {
        const { data: rol } = await supabase
          .from('roles')
          .select('nombreRol')
          .eq('id', usuarioRol.rolID)
          .maybeSingle();

        if (rol?.nombreRol) {
          rolName = rol.nombreRol;
          window.currentUserIsAdmin = rolName === 'Administrador';
        }
      }

      document.getElementById('ui-rol').textContent = rolName;

      // ---- Mostrar UI ----
      document.getElementById('userInfo').style.display = 'block';
      setAdminVisibility();

    } catch (err) {
      console.error('Error cargando usuario:', err);
    }
  }

  // ===== Logout =====
  document.getElementById('logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '../index.html';
  });

  loadUser();
});
