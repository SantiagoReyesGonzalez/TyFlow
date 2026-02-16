// scripts/pages/users.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificamos que Supabase esté listo
    if (!window.supabaseClient) return;

    const tableBody = document.getElementById('users-table-body');
    
    // --- FUNCIÓN PRINCIPAL: Cargar Usuarios ---
    async function loadUsers() {
        try {
            // Mostramos un mensaje de carga mientras esperamos
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem;">Cargando usuarios...</td></tr>';

            // 🚀 LA MAGIA: Consultamos la VISTA, no las tablas sueltas.
            // Esto trae nombre, email, rol y área en un solo viaje.
            const { data: users, error } = await window.supabaseClient
                .from('vista_usuarios_dashboard') 
                .select('*')
                .order('creadoEn', { ascending: false }); // Los más nuevos primero

            if (error) throw error;

            // Si todo salió bien, pintamos la tabla
            renderTable(users);

        } catch (err) {
            console.error('Error cargando usuarios:', err);
            tableBody.innerHTML = `<tr><td colspan="7" style="color: var(--error-500); text-align:center; padding: 1rem;">Error: ${err.message}</td></tr>`;
        }
    }

// --- FUNCIÓN DE RENDERIZADO (Actualizada) ---
    function renderTable(users) {
        tableBody.innerHTML = ''; 

        if (!users || users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem;">No se encontraron usuarios registrados.</td></tr>';
            return;
        }

        users.forEach(user => {
            // AHORA: Usamos el campo real de la base de datos
            // La base de datos devuelve 'ACTIVO' o 'INACTIVO'
            const isActive = user.estado === 'ACTIVO';
            
            // Creamos el badge dependiendo del estado
            const statusBadge = isActive 
                ? '<span class="status-badge status-badge--active">Activo</span>' 
                : '<span class="status-badge status-badge--inactive">Inactivo</span>';

            const row = `
                <tr class="datatable__row">
                    <td>${statusBadge}</td>
                    <td class="datatable__cell--bold">
                        ${user.primerNombre} ${user.primerApellido}
                    </td>
                    <td>${user.numeroDocumento || 'N/A'}</td> 
                    <td>${user.email}</td>
                    <td>
                        <span class="role-tag">${user.nombreRol || 'Sin Asignar'}</span>
                    </td>
                    <td>${user.nombreArea || 'Sin Asignar'}</td>
                    <td>
                        <button class="btn-icon-small" title="Editar usuario">
                            <i class='bx bx-edit-alt'></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    // --- INICIALIZACIÓN ---
    loadUsers();

    // (Opcional) Listener para el botón de refrescar o buscar
    // document.getElementById('filter-name').addEventListener('input', ...);
});