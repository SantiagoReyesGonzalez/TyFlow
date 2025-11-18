// Lógica principal del sistema

// Seleccionar elementos del DOM
const ticketForm = document.getElementById('ticket-form');
const ticketNumberInput = document.getElementById('ticket-number');
const logList = document.getElementById('log-list');

// Manejar el envío del formulario
ticketForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Obtener el número de ticket
    const ticketNumber = ticketNumberInput.value.trim();
    if (!ticketNumber) {
        alert('Por favor, ingresa un número de ticket.');
        return;
    }

    // Asignar el ticket aleatoriamente
    const assignedUser = assignTicket(ticketNumber);

    // Mostrar el registro en la interfaz
    const logItem = document.createElement('li');
    logItem.textContent = `Ticket #${ticketNumber} asignado a ${assignedUser}`;
    logList.appendChild(logItem);

    // Limpiar el campo de entrada
    ticketNumberInput.value = '';
});

// Función para asignar un ticket aleatoriamente
function assignTicket(ticketNumber) {
    const users = ['Usuario1', 'Usuario2', 'Usuario3']; // Lista de usuarios disponibles
    const randomIndex = Math.floor(Math.random() * users.length);
    return users[randomIndex];
}