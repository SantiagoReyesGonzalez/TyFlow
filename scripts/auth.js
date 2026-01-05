const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');

if (!form) {
    console.error('Formulario de login no encontrado (id="loginForm").');
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!window.supabaseClient) {
        msg.textContent = 'Error: Supabase no inicializado.';
        console.error('Supabase client no encontrado en window.supabase');
        return;
    }

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    msg.textContent = 'Validando información...';
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email,
        password
        });
        console.log('signInWithPassword result:', { data, error });

        if (error) {
            msg.textContent = error.message || 'Error al iniciar sesión.';
            console.error('Supabase auth error:', error);
            if (submitBtn) submitBtn.disabled = false;
            return;
        }

        window.location.href = 'pages/dashboard.html';
    } catch (err) {
        msg.textContent = 'Error en la conexión. Revisa la consola.';
        console.error('Error al iniciar sesión:', err);
        if (submitBtn) submitBtn.disabled = false;
    }
});