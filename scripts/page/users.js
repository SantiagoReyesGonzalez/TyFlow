document.addEventListener('DOMContentLoaded', async () => {
    // Verificamos si Supabase está listo
    if (!window.supabaseClient) {
        console.error('Supabase no inicializado');
        return;
    }

    const tableBody = document.getElementById('users-table-body');
    const modal = document.getElementById('modal-create-user');
    const formCreateUser = document.getElementById('form-create-user');
    const modalTitle = document.querySelector('.modal__title');
    const btnSubmitModal = formCreateUser.querySelector('button[type="submit"]');

    let editingUserId = null; 

    // ==========================================
    // 1. GESTIÓN DEL MODAL
    // ==========================================
    const openModal = (mode = 'create', userData = null) => {
        modal.classList.add('modal--show');
        
        if (mode === 'edit' && userData) {
            editingUserId = userData.id; 
            modalTitle.textContent = "Editar Usuario";
            btnSubmitModal.textContent = "Actualizar Datos";

            formCreateUser.primerNombre.value = userData.primerNombre;
            formCreateUser.segundoNombre.value = userData.segundoNombre || '';
            formCreateUser.primerApellido.value = userData.primerApellido;
            formCreateUser.segundoApellido.value = userData.segundoApellido || '';
            formCreateUser.numeroDocumento.value = userData.numeroDocumento || '';
            formCreateUser.email.value = userData.email; 
        } else {
            editingUserId = null;
            modalTitle.textContent = "Crear nuevo usuario";
            btnSubmitModal.textContent = "Crear Usuario";
            formCreateUser.reset();
            formCreateUser.email.disabled = false;
        }
    };

    const closeModal = () => {
        modal.classList.remove('modal--show');
        formCreateUser.reset();
        editingUserId = null;
    };

    const btnOpen = document.getElementById('btn-create-user');
    if(btnOpen) btnOpen.addEventListener('click', () => openModal('create'));
    
    const btnClose = document.getElementById('btn-close-modal');
    if(btnClose) btnClose.addEventListener('click', closeModal);
    
    const btnCancel = document.getElementById('btn-cancel-modal');
    if(btnCancel) btnCancel.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // ==========================================
    // 2. CARGAR DATOS
    // ==========================================
    async function loadFormOptions() {
        try {
            const { data: roles } = await window.supabaseClient.from('roles').select('id, nombreRol');
            const selectRol = document.getElementById('rol');
            if (selectRol && roles) {
                selectRol.innerHTML = '<option value="" disabled selected>Seleccione...</option>';
                roles.forEach(r => selectRol.innerHTML += `<option value="${r.id}">${r.nombreRol}</option>`);
            }

            const { data: areas } = await window.supabaseClient.from('areas').select('id, nombreArea');
            const selectArea = document.getElementById('area');
            if (selectArea && areas) {
                selectArea.innerHTML = '<option value="" disabled selected>Seleccione...</option>';
                areas.forEach(a => selectArea.innerHTML += `<option value="${a.id}">${a.nombreArea}</option>`);
            }
        } catch (error) {
            console.error('Error cargando opciones:', error);
        }
    }

    function createTags(textStr, cssClass) {
        if (!textStr) return '<span style="opacity:0.5; font-size:0.8rem">Sin Asignar</span>';
        return textStr.split(', ').map(tag => `<span class="${cssClass}">${tag}</span>`).join('');
    }

    async function loadUsers() {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem;">Cargando usuarios...</td></tr>';
        
        const { data: users, error } = await window.supabaseClient
            .from('vista_usuarios_dashboard')
            .select('*')
            .order('creadoEn', { ascending: false });

        if (error) {
            tableBody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">Error: ${error.message}</td></tr>`;
            return;
        }

        renderTable(users);
    }

    function renderTable(users) {
        tableBody.innerHTML = '';
        if (!users || users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem;">No hay usuarios registrados.</td></tr>';
            return;
        }

        users.forEach(user => {
            const isActive = user.estado === 'ACTIVO';
            
            const statusBadge = isActive 
                ? '<span class="status-badge status-badge--active">Activo</span>' 
                : '<span class="status-badge status-badge--inactive">Inactivo</span>';

            // --- AQUÍ ESTÁ LA LÓGICA DEL BOTÓN CAMBIANTE ---
            let actionButton;
            if (isActive) {
                // Si está ACTIVO -> Botón ROJO (Borrar)
                actionButton = `
                    <button class="btn-icon-small btn-delete" title="Desactivar Usuario" style="border-color: #fee2e2; color: #dc2626;">
                        <i class='bx bx-trash'></i>
                    </button>`;
            } else {
                // Si está INACTIVO -> Botón VERDE (Restaurar)
                actionButton = `
                    <button class="btn-icon-small btn-restore" title="Reactivar Usuario" style="border-color: #dcfce7; color: #166534;">
                        <i class='bx bx-redo'></i>
                    </button>`;
            }

            const row = document.createElement('tr');
            row.className = 'datatable__row';
            if (!isActive) row.style.opacity = "0.75"; 

            row.innerHTML = `
                <td>${statusBadge}</td>
                <td class="datatable__cell--bold">${user.primerNombre} ${user.primerApellido}</td>
                <td>${user.numeroDocumento || 'N/A'}</td> 
                <td>${user.email}</td>
                <td><div class="tags-wrapper">${createTags(user.nombreRol, 'role-tag')}</div></td>
                <td><div class="tags-wrapper">${createTags(user.nombreArea, 'role-tag')}</div></td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-icon-small btn-edit" title="Editar">
                            <i class='bx bx-edit-alt'></i>
                        </button>
                        ${actionButton}
                    </div>
                </td>
            `;

            // EVENTO EDITAR
            row.querySelector('.btn-edit').addEventListener('click', () => openModal('edit', user));

            // EVENTO ACCIÓN (BORRAR O RESTAURAR)
            const btnAction = row.querySelector('.btn-delete') || row.querySelector('.btn-restore');
            
            if (btnAction) {
                btnAction.addEventListener('click', async () => {
                    const esBorrar = isActive;
                    const verbo = esBorrar ? 'desactivar' : 'reactivar';
                    const metodo = esBorrar ? 'DELETE' : 'PUT';
                    
                    // Si borramos, mandamos solo ID. Si activamos, mandamos ID y nuevo estado.
                    const bodyPayload = esBorrar ? { id: user.id } : { id: user.id, estado: 'ACTIVO' };

                    if(confirm(`¿Seguro que deseas ${verbo} a ${user.primerNombre}?`)) {
                        try {
                            btnAction.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i>`;
                            
                            const { data, error } = await window.supabaseClient.functions.invoke('admin-crud', {
                                method: metodo,
                                body: bodyPayload
                            });

                            if (error) throw new Error(error.message);
                            if (data && data.error) throw new Error(data.error);

                            alert(`Usuario ${verbo}do correctamente.`);
                            loadUsers(); 

                        } catch (err) {
                            alert('Error: ' + err.message);
                            // Restauramos el icono correcto si falló
                            btnAction.innerHTML = esBorrar ? `<i class='bx bx-trash'></i>` : `<i class='bx bx-redo'></i>`;
                        }
                    }
                });
            }

            tableBody.appendChild(row);
        });
    }

    // ==========================================
    // 3. SUBMIT (CREAR/EDITAR)
    // ==========================================
    formCreateUser.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const originalText = btnSubmitModal.textContent;
        btnSubmitModal.textContent = 'Procesando...';
        btnSubmitModal.disabled = true;

        try {
            const formData = new FormData(formCreateUser);
            
            const payload = {
                id: editingUserId,
                email: formData.get('email'),
                primerNombre: formData.get('primerNombre'),
                segundoNombre: formData.get('segundoNombre'),
                primerApellido: formData.get('primerApellido'),
                segundoApellido: formData.get('segundoApellido'),
                numeroDocumento: formData.get('numeroDocumento'),
                rolID: formData.get('rol'),
                areaID: formData.get('area')
            };

            const method = editingUserId ? 'PUT' : 'POST';

            const { data, error } = await window.supabaseClient.functions.invoke('admin-crud', {
                method: method,
                body: payload
            });

            if (error) throw new Error(error.message || 'Error de conexión');
            if (data && data.error) throw new Error(data.error);

            alert(editingUserId ? 'Usuario actualizado.' : 'Usuario creado.');
            closeModal();
            loadUsers(); 

        } catch (error) {
            console.error(error);
            alert('❌ Error: ' + error.message);
        } finally {
            btnSubmitModal.textContent = originalText;
            btnSubmitModal.disabled = false;
        }
    });

    loadFormOptions();
    loadUsers();
});