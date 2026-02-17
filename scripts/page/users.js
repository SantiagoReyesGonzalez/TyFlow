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
    // NUEVA FUNCIÓN: CARGAR AREAS COMO CHECKBOXES
    // ==========================================
    async function loadFormOptions() {
        try {
            // 1. Cargar ROLES (Select normal)
            const { data: roles } = await window.supabaseClient.from('roles').select('id, nombreRol');
            const selectRol = document.getElementById('rol');
            if (selectRol && roles) {
                selectRol.innerHTML = '<option value="" disabled selected>Seleccione...</option>';
                roles.forEach(r => selectRol.innerHTML += `<option value="${r.id}">${r.nombreRol}</option>`);
            }

            // 2. Cargar ÁREAS (Checkboxes)
            const { data: areas } = await window.supabaseClient.from('areas').select('id, nombreArea').order('nombreArea');
            const container = document.getElementById('areas-container');
            
            if (container && areas) {
                container.innerHTML = ''; // Limpiar
                areas.forEach(a => {
                    const html = `
                        <label class="checkbox-item">
                            <input type="checkbox" name="area-check" value="${a.id}">
                            ${a.nombreArea}
                        </label>
                    `;
                    container.insertAdjacentHTML('beforeend', html);
                });
            }
        } catch (error) {
            console.error('Error cargando opciones:', error);
        }
    }

    // ==========================================
    // 1. GESTIÓN DEL MODAL (MODIFICADO)
    // ==========================================
    const openModal = async (mode = 'create', userData = null) => {
        modal.classList.add('modal--show');
        
        // Limpiamos los checkboxes primero
        document.querySelectorAll('input[name="area-check"]').forEach(cb => cb.checked = false);

        if (mode === 'edit' && userData) {
            editingUserId = userData.id; 
            modalTitle.textContent = "Editar Usuario";
            btnSubmitModal.textContent = "Actualizar Datos";

            // Llenar campos de texto
            formCreateUser.primerNombre.value = userData.primerNombre;
            formCreateUser.segundoNombre.value = userData.segundoNombre || '';
            formCreateUser.primerApellido.value = userData.primerApellido;
            formCreateUser.segundoApellido.value = userData.segundoApellido || '';
            formCreateUser.numeroDocumento.value = userData.numeroDocumento || '';
            formCreateUser.email.value = userData.email; 
            
            // Llenar Rol (Necesitamos saber el ID del rol, si la vista solo trae nombre, puede fallar si no coincide value)
            // Asumimos que userData.rol_id viene en la vista o intentamos buscar por texto si es necesario.
            // *Nota:* Si tu vista no trae 'rol_id', el select no se seleccionará solo.
            
            // --- LOGICA PARA MARCAR AREAS CHECKBOXES ---
            try {
                // Consultamos a la base de datos qué áreas tiene este usuario
                const { data: relaciones } = await window.supabaseClient
                    .from('usuarioArea')
                    .select('areaID')
                    .eq('usuarioID', userData.id);

                if (relaciones) {
                    const areasDelUsuario = relaciones.map(r => r.areaID);
                    // Marcamos los checkboxes correspondientes
                    document.querySelectorAll('input[name="area-check"]').forEach(cb => {
                        if (areasDelUsuario.includes(parseInt(cb.value))) {
                            cb.checked = true;
                        }
                    });
                }
            } catch (err) {
                console.error("Error cargando relaciones de área", err);
            }

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
    // 2. CARGAR DATOS (TABLA)
    // ==========================================
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

            let actionButton;
            if (isActive) {
                actionButton = `
                    <button class="btn-icon-small btn-delete" title="Desactivar Usuario" style="border-color: #fee2e2; color: #dc2626;">
                        <i class='bx bx-trash'></i>
                    </button>`;
            } else {
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

            row.querySelector('.btn-edit').addEventListener('click', () => openModal('edit', user));

            const btnAction = row.querySelector('.btn-delete') || row.querySelector('.btn-restore');
            if (btnAction) {
                btnAction.addEventListener('click', async () => {
                    const esBorrar = isActive;
                    const verbo = esBorrar ? 'desactivar' : 'reactivar';
                    const metodo = esBorrar ? 'DELETE' : 'PUT';
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
                            btnAction.innerHTML = esBorrar ? `<i class='bx bx-trash'></i>` : `<i class='bx bx-redo'></i>`;
                        }
                    }
                });
            }
            tableBody.appendChild(row);
        });
    }

    // ==========================================
    // 3. SUBMIT (LÓGICA ACTUALIZADA PARA AREAS)
    // ==========================================
    formCreateUser.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const originalText = btnSubmitModal.textContent;
        btnSubmitModal.textContent = 'Guardando...';
        btnSubmitModal.disabled = true;

        try {
            const formData = new FormData(formCreateUser);
            
            // 1. Recopilar ÁREAS seleccionadas
            const checkboxes = document.querySelectorAll('input[name="area-check"]:checked');
            const areasSeleccionadas = Array.from(checkboxes).map(cb => parseInt(cb.value));

            if (areasSeleccionadas.length === 0) {
                throw new Error("Debes seleccionar al menos un área.");
            }

            // 2. Guardar USUARIO (Datos básicos) vía Edge Function
            const payload = {
                id: editingUserId,
                email: formData.get('email'),
                primerNombre: formData.get('primerNombre'),
                segundoNombre: formData.get('segundoNombre'),
                primerApellido: formData.get('primerApellido'),
                segundoApellido: formData.get('segundoApellido'),
                numeroDocumento: formData.get('numeroDocumento'),
                rolID: formData.get('rol')
                // NOTA: No mandamos 'areaID' aquí porque la function podría esperar uno solo.
                // Manejaremos las áreas por separado abajo.
            };

            const method = editingUserId ? 'PUT' : 'POST';

            const { data, error } = await window.supabaseClient.functions.invoke('admin-crud', {
                method: method,
                body: payload
            });

            if (error) throw new Error(error.message || 'Error de conexión');
            if (data && data.error) throw new Error(data.error);

            // 3. GESTIONAR ÁREAS (Estrategia Frontend: Wipe & Write)
            // Obtenemos el ID del usuario (si editamos es editingUserId, si creamos viene en data)
            // *Asumimos que tu Edge Function devuelve el objeto user o su ID en 'data'*
            const targetUserId = editingUserId || (data.user ? data.user.id : data.id); 

            if (targetUserId) {
                // A. Borrar relaciones anteriores
                await window.supabaseClient.from('usuarioArea').delete().eq('usuarioID', targetUserId);

                // B. Insertar nuevas relaciones
                const insertData = areasSeleccionadas.map(areaId => ({
                    usuarioID: targetUserId,
                    areaID: areaId
                }));
                
                const { error: areaError } = await window.supabaseClient.from('usuarioArea').insert(insertData);
                if (areaError) throw new Error("Usuario guardado, pero error asignando áreas: " + areaError.message);
            }

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