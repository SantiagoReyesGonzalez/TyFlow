// scripts/pages/users.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificamos que Supabase esté listo
    if (!window.supabaseClient) return;

    const tableBody = document.getElementById('users-table-body');
    
    // --- FUNCIÓN PRINCIPAL: Cargar Usuarios ---
    async function loadUsers() {
        try {
            // Mensaje de carga
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem;">Cargando usuarios...</td></tr>';

            // Consultamos la VISTA (que ahora agrupa roles y áreas)
            const { data: users, error } = await window.supabaseClient
                .from('vista_usuarios_dashboard') 
                .select('*')
                .order('creadoEn', { ascending: false });

            if (error) throw error;

            // Pintamos la tabla
            renderTable(users);

        } catch (err) {
            console.error('Error cargando usuarios:', err);
            tableBody.innerHTML = `<tr><td colspan="7" style="color: var(--error-500); text-align:center; padding: 1rem;">Error: ${err.message}</td></tr>`;
        }
    }

    // --- FUNCIÓN AUXILIAR: Crear Etiquetas (Badges) ---
    // Convierte "Admin, User" -> <span...>Admin</span> <span...>User</span>
    function createTags(textStr, cssClass) {
        if (!textStr) return '<span style="opacity:0.5; font-size:0.8rem">Sin Asignar</span>';
        
        return textStr.split(', ').map(tag => 
            `<span class="${cssClass}">${tag}</span>`
        ).join(' ');
    }

    // --- FUNCIÓN DE RENDERIZADO (Pintar HTML) ---
    function renderTable(users) {
        tableBody.innerHTML = ''; 

        if (!users || users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem;">No se encontraron usuarios registrados.</td></tr>';
            return;
        }

        users.forEach(user => {
            // 1. Estado (Ahora viene directo de la BD)
            const isActive = user.estado === 'ACTIVO';
            
            const statusBadge = isActive 
                ? '<span class="status-badge status-badge--active">Activo</span>' 
                : '<span class="status-badge status-badge--inactive">Inactivo</span>';

            // 2. Construcción de la fila
            // En scripts/pages/users.js - Dentro de la función renderTable

            const row = `
                <tr class="datatable__row">
                    <td>${statusBadge}</td>
                    
                    <td class="datatable__cell--bold">
                        ${user.primerNombre} ${user.primerApellido}
                    </td>
                    
                    <td>${user.numeroDocumento || 'N/A'}</td> 
                    
                    <td>${user.email}</td>
                    
                    <td>
                        <div class="tags-wrapper">
                            ${createTags(user.nombreRol, 'role-tag')}
                        </div>
                    </td>
                    
                    <td>
                        <div class="tags-wrapper">
                            ${createTags(user.nombreArea, 'role-tag')}
                        </div>
                    </td>
                    
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

    // Listener para filtros (Opcional por ahora)
    // const searchInput = document.getElementById('filter-name');
    // if(searchInput) { ... lógica de búsqueda ... }
});