document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Referencias al DOM
    const modalPass = document.getElementById('modal-change-password');
    const btnOpenPass = document.getElementById('btn-open-change-pass');
    const btnClosePass = document.getElementById('btn-close-pass-modal');
    const btnCancelPass = document.getElementById('btn-cancel-pass');
    const formPass = document.getElementById('form-change-password');
    const errorMsg = document.getElementById('pass-error-msg');

    // Si no existe el botón en esta página, no hacemos nada (evita errores)
    if (!btnOpenPass) return;

    // 2. Funciones de Abrir/Cerrar
    const openPassModal = () => {
        modalPass.classList.add('modal--show');
        formPass.reset();
        errorMsg.style.display = 'none';
    };

    const closePassModal = () => {
        modalPass.classList.remove('modal--show');
        formPass.reset();
    };

    btnOpenPass.addEventListener('click', openPassModal);
    if(btnClosePass) btnClosePass.addEventListener('click', closePassModal);
    if(btnCancelPass) btnCancelPass.addEventListener('click', closePassModal);

    // Cerrar si clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === modalPass) closePassModal();
    });

    // 3. Lógica de Cambio de Contraseña (CON SEGURIDAD EXTRA)
    formPass.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSubmit = formPass.querySelector('button[type="submit"]');
        const originalText = btnSubmit.textContent;
        const errorMsg = document.getElementById('pass-error-msg');
        
        // Limpiamos estados anteriores
        btnSubmit.textContent = 'Verificando...';
        btnSubmit.disabled = true;
        errorMsg.style.display = 'none';
        errorMsg.textContent = '';

        const currentPass = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-password').value;

        try {
            // A. Validaciones básicas
            if (newPass !== confirmPass) {
                throw new Error("Las contraseñas nuevas no coinciden.");
            }
            if (newPass.length < 6) {
                throw new Error("La nueva contraseña es muy corta (mínimo 6).");
            }
            if (currentPass === newPass) {
                throw new Error("La nueva contraseña no puede ser igual a la actual.");
            }

            // B. OBTENER EL EMAIL DEL USUARIO ACTUAL
            // Necesitamos el email para verificar la contraseña antigua
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            if (!user || !user.email) {
                throw new Error("No se pudo identificar al usuario. Recarga la página.");
            }

            // C. 🕵️‍♂️ VERIFICACIÓN DE SEGURIDAD (RE-AUTENTICACIÓN)
            // Intentamos iniciar sesión con la clave actual. Si falla, es que la clave está mal.
            const { error: loginError } = await window.supabaseClient.auth.signInWithPassword({
                email: user.email,
                password: currentPass
            });

            if (loginError) {
                // Si Supabase dice que no, es que la contraseña actual es incorrecta
                throw new Error("La contraseña actual es incorrecta.");
            }

            // D. Si pasamos el filtro anterior, procedemos al cambio
            btnSubmit.textContent = 'Actualizando...';
            
            const { error: updateError } = await window.supabaseClient.auth.updateUser({
                password: newPass
            });

            if (updateError) throw updateError;

            // E. Éxito Total
            alert("¡Contraseña actualizada correctamente!");
            closePassModal();

        } catch (error) {
            console.error(error);
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
            
            // Efecto visual de "temblor" si hay error (opcional, pero se ve pro)
            formPass.classList.add('shake-animation'); 
            setTimeout(() => formPass.classList.remove('shake-animation'), 500);

        } finally {
            btnSubmit.textContent = originalText;
            btnSubmit.disabled = false;
        }
    });
});