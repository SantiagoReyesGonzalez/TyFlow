document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('testConnBtn');
    const out = document.getElementById('testResult');

    async function showUserHeader() {
        if (!window.supabaseClient) return;
        try {
            const { data: sessionData } = await window.supabaseClient.auth.getSession();
            const user = sessionData?.session?.user;
            if (!user) return;

            // obtener datos de usuario
            const { data: usuarioRows, error: usuarioErr } = await window.supabaseClient
                .from('usuarios')
                .select('primerNombre,primerApellido')
                .eq('id', user.id)
                .maybeSingle();

            if (usuarioErr) {
                console.debug('Error fetching usuario row:', usuarioErr);
            }

            // obtener rol
            const { data: urRows, error: urErr } = await window.supabaseClient
                .from('usuarioRol')
                .select('rolID')
                .eq('usuarioID', user.id);

            if (urErr) console.debug('Error fetching usuarioRol:', urErr);

            let rolName = '-';
            if (urRows && urRows.length > 0) {
                const rolIds = urRows.map(r => r.rolID).filter(Boolean);
                if (rolIds.length) {
                    const { data: roles } = await window.supabaseClient
                        .from('roles')
                        .select('nombreRol')
                        .in('id', rolIds)
                        .limit(1);
                    if (roles && roles.length) rolName = roles[0].nombreRol || '-';
                }
            }

            const ui = document.getElementById('userInfo');
            const uNombre = document.getElementById('ui-nombre');
            const uApellido = document.getElementById('ui-apellido');
            const uRol = document.getElementById('ui-rol');

            if (usuarioRows) {
                uNombre.textContent = usuarioRows.primerNombre || '-';
                uApellido.textContent = usuarioRows.primerApellido || '-';
            } else {
                uNombre.textContent = user.user_metadata?.full_name || user.email || '-';
                uApellido.textContent = '';
            }
            uRol.textContent = rolName;
            ui.style.display = 'block';
        } catch (e) {
            console.error('showUserHeader error', e);
        }
    }

    // inicializar header
    showUserHeader();

    // Mostrar/ocultar elementos para administradores
    function setAdminVisibility() {
        try {
            const roleFromBody = document?.body?.dataset?.role;
            const isAdmin = Boolean(window.currentUserIsAdmin) || roleFromBody === 'admin';
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = isAdmin ? '' : 'none';
            });
            // permitir refrescar manualmente desde la consola si se necesita
            window.refreshAdminUI = setAdminVisibility;
        } catch (e) {
            console.debug('setAdminVisibility error', e);
        }
    }

    // aplicar visibilidad inmediatamente y también tras cambios de auth
    setAdminVisibility();
    if (window.supabaseClient?.auth?.onAuthStateChange) {
        window.supabaseClient.auth.onAuthStateChange(() => setTimeout(setAdminVisibility, 50));
    }

    if (btn) btn.addEventListener('click', async () => {
        out.textContent = 'Probando conexión...';
        if (!window.supabaseClient) {
            out.textContent = 'Supabase no inicializado en window.supabaseClient.';
            return;
        }

        try {
            const { data: sessionData, error: sessionError } = await window.supabaseClient.auth.getSession();
            if (sessionError) console.debug('sessionError', sessionError);
            const userInfo = sessionData?.session?.user ?? null;

            const { data, error } = await window.supabaseClient
                .from('usuarios')
                .select('id,creadoEn,segundoNombre,segundoApellido,numeroDocumento,primerApellido,primerNombre')
                .limit(10);

            if (error) {
                out.textContent = 'Error al consultar usuarios: ' + (error.message || JSON.stringify(error));
                return;
            }

            out.textContent = 'Session user:\n' + JSON.stringify(userInfo, null, 2) + '\n\nUsuarios:\n' + JSON.stringify(data, null, 2);
        } catch (err) {
            out.textContent = 'Excepción: ' + (err.message || String(err));
        }
    });
});
