document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Verificamos Supabase (Rutina estándar)
    if (!window.supabaseClient) {
        console.error('Supabase no inicializado');
        return;
    }

    console.log("Iniciando Dashboard...");

    // ----------------------------------------------------
    // AQUÍ CARGARÁS TUS GRÁFICAS O KPIS EN EL FUTURO
    // Por ahora, simulamos una carga rápida de 300ms 
    // para que no sea un parpadeo demasiado brusco.
    // ----------------------------------------------------
    // await cargarMetricas(); // (Futuro)
    
    // Pequeña pausa estética (opcional, puedes quitarla si quieres velocidad pura)
    await new Promise(resolve => setTimeout(resolve, 300));

    // 2. ¡ORDEN MANUAL! Quitar el loader YA.
    if (window.hideLoader) {
        window.hideLoader();
    }
});