// scripts/loader.js

/**
 * Función Global para ocultar el Loader.
 * Cualquier página puede llamarla usando window.hideLoader()
 */
window.hideLoader = function() {
    const loader = document.getElementById('global-loader');
    
    if (loader && !loader.classList.contains('loader-hidden')) {
        // 1. Desvanecer
        loader.classList.add('loader-hidden');
        
        // 2. Eliminar del DOM tras la animación (0.5s) para liberar memoria
        setTimeout(() => {
            if(loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 500);
    }
};

/**
 * RED DE SEGURIDAD (Safety Net)
 * Si por alguna razón la página falla y nunca llama a hideLoader(),
 * lo quitamos a la fuerza después de 5 segundos para no bloquear al usuario.
 */
window.addEventListener('load', () => {
    setTimeout(() => {
        window.hideLoader();
    }, 5000); // 5 segundos máximo de espera
});