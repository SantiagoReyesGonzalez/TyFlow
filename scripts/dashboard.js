document.addEventListener('DOMContentLoaded', async () => {
  if (!window.supabaseClient) {
    console.error('Supabase no inicializado');
    return;
  }

  // =========================
  // Helpers UI
  // =========================
  function setAdminVisibility(isAdmin) {
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = isAdmin ? 'block' : 'none';
    });
  }

  // =========================
  // Cargar usuario + rol
  // =========================
  async function loadUserAndRole() {
    try {
      // 1️⃣ Sesión
      const { data: sessionData } = await window.supabaseClient.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        window.location.href = '../index.html';
        return;
      }

      // 2️⃣ Datos del usuario
      const { data: usuario } = await window.supabaseClient
        .from('usuarios')
        .select('primerNombre, primerApellido')
        .eq('id', user.id)
        .maybeSingle();

      document.getElementById('ui-nombre').textContent =
        usuario?.primerNombre || user.user_metadata?.full_name || user.email;

      document.getElementById('ui-apellido').textContent =
        usuario?.primerApellido || '';

      // 3️⃣ Rol (flujo simple y claro)
      let rolName = 'Usuario';
      let isAdmin = false;

      const { data: usuarioRol } = await window.supabaseClient
        .from('usuarioRol')
        .select(`
          roles (
            nombreRol
          )
        `)
        .eq('usuarioID', user.id)
        .maybeSingle();

      if (usuarioRol?.roles?.nombreRol) {
        rolName = usuarioRol.roles.nombreRol;
        isAdmin = rolName === 'Administrador';
      }

      // 4️⃣ Pintar UI
      document.getElementById('ui-rol').textContent = rolName;
      document.getElementById('userInfo').style.display = 'block';
      setAdminVisibility(isAdmin);

    } catch (err) {
      console.error('Error cargando usuario:', err);
    }
  }

  // =========================
  // Logout
  // =========================
  document.getElementById('logout').addEventListener('click', async () => {
    await window.supabaseClient.auth.signOut();
    window.location.href = '../index.html';
  });

  // =========================
  // Init
  // =========================
  loadUserAndRole();
});
