document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar que Supabase esté listo
    if (!window.supabaseClient) {
        console.error('Supabase no está inicializado.');
        return;
    }

    const tableBody = document.getElementById('users-table-body');

    // ==========================================
    // 🟢 LÓGICA DEL MODAL (Abrir y Cerrar)
    // ==========================================
    const modal = document.getElementById('modal-create-user');
    const btnOpenModal = document.getElementById('btn-create-user'); // Botón verde
    const btnCloseModal = document.getElementById('btn-close-modal'); // La X
    const btnCancelModal = document.getElementById('btn-cancel-modal'); // Botón Cancelar

    // Función para ABRIR
    if (btnOpenModal) {
        btnOpenModal.addEventListener('click', () => {
            modal.classList.add('modal--show');
        });
    }

    // Función para CERRAR
    const closeModal = () => {
        modal.classList.remove('modal--show');
        document.getElementById('form-create-user').reset(); // Limpia el formulario
    };

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    // Cerrar si hacen clic fuera de la cajita blanca
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // ==========================================
    // 🟢 CARGAR SELECTS (Roles y Áreas)
    // ==========================================
    async function loadFormOptions() {
        try {
            // Cargar Roles
            const { data: roles } = await window.supabaseClient
                .from('roles')
                .select('id, nombreRol');
            
            if (roles) {
                const selectRol = document.getElementById('rol');
                // Guardamos la primera opción
                selectRol.innerHTML = '<option value="" disabled selected>Seleccione...</option>';
                roles.forEach(rol => {
                    selectRol.innerHTML += `<option value="${rol.id}">${rol.nombreRol}</option>`;
                });
            }

            // Cargar Áreas
            const { data: areas } = await window.supabaseClient
                .from('areas')
                .select('id, nombreArea');

            if (areas) {
                const selectArea = document.getElementById('area');
                selectArea.innerHTML = '<option value="" disabled selected>Seleccione...</option>';
                areas.forEach(area => {
                    selectArea.innerHTML += `<option value="${area.id}">${area.nombreArea}</option>`;
                });
            }
        } catch (error) {
            console.error('Error cargando opciones:', error);
        }
    }

    // ==========================================
    // 🟢 CARGAR TABLA DE USUARIOS
    // ==========================================
    
    // Función auxiliar para crear etiquetas bonitas
    function createTags(textStr, cssClass) {
        if (!textStr) return '<span style="opacity:0.5; font-size:0.8rem">Sin Asignar</span>';
        return textStr.split(', ').map(tag => 
            `<span class="${cssClass}">${tag}</span>`
        ).join(''); // Quitamos el espacio porque usamos flexbox gap
    }

    async function loadUsers() {
        try {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem;">Cargando usuarios...</td></tr>';

            const { data: users, error } = await window.supabaseClient
                .from('vista_usuarios_dashboard') 
                .select('*')
                .order('creadoEn', { ascending: false });

            if (error) throw error;
            renderTable(users);

        } catch (err) {
            console.error('Error cargando usuarios:', err);
            tableBody.innerHTML = `<tr><td colspan="7" style="color: var(--error-500); text-align:center;">Error: ${err.message}</td></tr>`;
        }
    }

    function renderTable(users) {
        tableBody.innerHTML = ''; 

        if (!users || users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem;">No se encontraron usuarios.</td></tr>';
            return;
        }

        users.forEach(user => {
            const isActive = user.estado === 'ACTIVO';
            const statusBadge = isActive 
                ? '<span class="status-badge status-badge--active">Activo</span>' 
                : '<span class="status-badge status-badge--inactive">Inactivo</span>';

            const row = `
                <tr class="datatable__row">
                    <td>${statusBadge}</td>
                    <td class="datatable__cell--bold">${user.primerNombre} ${user.primerApellido}</td>
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
                        <button class="btn-icon-small" title="Editar">
                            <i class='bx bx-edit-alt'></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    // ==========================================
    // 🚀 INICIALIZACIÓN
    // ==========================================
    loadUsers();       // 1. Pintar la tabla
    loadFormOptions(); // 2. Llenar los selects del modal
});