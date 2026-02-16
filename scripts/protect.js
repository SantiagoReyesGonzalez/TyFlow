(async () => {
    // 1. Verificamos si Supabase está cargado
    if (!window.supabaseClient) {
        console.error('Supabase no inicializado');
        window.location.href = '../index.html';
        return;
    }

    // 2. Obtenemos la sesión actual de autenticación
    const { data, error } = await window.supabaseClient.auth.getSession();

    // Si no hay sesión, pa' fuera
    if (error || !data.session) {
        window.location.href = '../index.html';
        return;
    }

    const user = data.session.user;

    // ==========================================
    // 3. NUEVO: Verificación de Estado (ACTIVO/INACTIVO)
    // ==========================================
    try {
        const { data: perfil, error: errorPerfil } = await window.supabaseClient
            .from('usuarios')
            .select('estado')
            .eq('id', user.id)
            .single();

        // Si hay error (no existe el perfil) o el estado NO es ACTIVO
        if (errorPerfil || perfil?.estado !== 'ACTIVO') {
            console.warn('Acceso denegado: Usuario Inactivo o No Encontrado');
            
            // Le avisamos (opcional, pero buena UX)
            alert('Tu cuenta está inactiva o suspendida. Contacta al administrador.');

            // Forzamos el cierre de sesión de Supabase para matar la cookie
            await window.supabaseClient.auth.signOut();

            // Lo mandamos al login
            window.location.href = '../index.html';
            return;
        }

    } catch (err) {
        console.error('Error verificando estado del usuario:', err);
        // Por seguridad, si falla la verificación, mejor no dejarlo pasar
        window.location.href = '../index.html'; 
        return;
    }

    // 4. Si llega aquí, tiene sesión Y está ACTIVO.
    console.log('Sesión válida y usuario ACTIVO. Acceso permitido.');

})();