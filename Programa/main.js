/**
 * Sistema de Gestión de Reservaciones para Restaurante
 * 
 * Este archivo contiene la lógica principal para la gestión de reservaciones,
 * incluyendo validación, comunicación con la base de datos y manipulación del DOM.
 * 
 * @author Juan Coohaz
 * @version 1.0
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const form = document.getElementById('reservation-form');
    const confirmationModal = document.getElementById('confirmation-modal');
    const cancelModal = document.getElementById('cancel-modal');
    const reservationsList = document.getElementById('reservations-list');
    const filterSelect = document.getElementById('filter-status');
    const refreshButton = document.getElementById('refresh-list');

    // Estado de la aplicación
    const appState = {
        currentReservations: [],
        selectedReservation: null,
        filterStatus: 'all'
    };

    /**
     * Inicializa la aplicación
     */
    function init() {
        setMinDateToday();
        loadReservations();
        attachEventListeners();
    }

    /**
     * Configura la fecha mínima del selector de fecha como hoy
     */
    function setMinDateToday() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('reservation-date').min = today;
    }

    /**
     * Adjunta todos los event listeners necesarios
     */
    function attachEventListeners() {
        // Formulario de reservación
        form.addEventListener('submit', handleReservationSubmit);
        
        // Botones de confirmación de reservación
        document.getElementById('confirm-reservation').addEventListener('click', confirmReservation);
        document.getElementById('cancel-confirmation').addEventListener('click', closeConfirmationModal);
        
        // Botones de cancelación de reservación
        document.getElementById('confirm-cancellation').addEventListener('click', processCancellation);
        document.getElementById('abort-cancellation').addEventListener('click', closeCancelModal);
        
        // Filtro y actualización de lista
        filterSelect.addEventListener('change', handleFilterChange);
        refreshButton.addEventListener('click', loadReservations);
    }

    /**
     * Maneja el envío del formulario de reservación
     * @param {Event} event - Evento del formulario
     */
    function handleReservationSubmit(event) {
        event.preventDefault();
        
        // Obtener y validar los datos del formulario
        const formData = {
            clientName: document.getElementById('client-name').value.trim(),
            contactNumber: document.getElementById('contact-number').value.trim(),
            partySize: parseInt(document.getElementById('party-size').value),
            date: document.getElementById('reservation-date').value,
            time: document.getElementById('reservation-time').value
        };
        
        if (!validateReservationData(formData)) {
            return;
        }
        
        // Verificar disponibilidad
        checkAvailability(formData)
            .then(isAvailable => {
                if (isAvailable) {
                    showConfirmationModal(formData);
                } else {
                    showNotification('No hay disponibilidad para esa fecha y hora. Por favor seleccione otro horario.', 'error');
                }
            })
            .catch(error => {
                console.error('Error al verificar disponibilidad:', error);
                showNotification('Ocurrió un error al verificar disponibilidad. Intente nuevamente.', 'error');
            });
    }

    /**
     * Valida los datos de la reservación
     * @param {Object} data - Datos de la reservación
     * @returns {boolean} - Verdadero si los datos son válidos
     */
    function validateReservationData(data) {
        // Validar nombre (debe tener al menos 3 caracteres)
        if (data.clientName.length < 3) {
            showNotification('El nombre del cliente debe tener al menos 3 caracteres', 'error');
            return false;
        }
        
        // Validar número de contacto (debe tener al menos 8 dígitos)
        if (!(/^\d{8,15}$/).test(data.contactNumber.replace(/[\s-]/g, ''))) {
            showNotification('Ingrese un número de contacto válido', 'error');
            return false;
        }
        
        // Validar número de personas
        if (isNaN(data.partySize) || data.partySize < 1 || data.partySize > 20) {
            showNotification('El número de personas debe estar entre 1 y 20', 'error');
            return false;
        }
        
        // Validar fecha (no debe ser anterior a hoy)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reservationDate = new Date(data.date);
        if (reservationDate < today) {
            showNotification('La fecha de reservación no puede ser anterior a hoy', 'error');
            return false;
        }
        
        // Validar hora (debe estar entre las horas de apertura y cierre)
        const time = data.time;
        if (time < "10:00" || time > "21:30") {
            showNotification('El horario de reservaciones es de 10:00 AM a 9:30 PM', 'error');
            return false;
        }
        
        return true;
    }

    /**
     * Verifica la disponibilidad para una reservación
     * @param {Object} data - Datos de la reservación
     * @returns {Promise<boolean>} - Promesa que resuelve a verdadero si hay disponibilidad
     */
    function checkAvailability(data) {
        // En un sistema real, esto verificaría con la base de datos
        // Por ahora, simulamos una respuesta asíncrona
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular verificación de disponibilidad
                // Verificamos si ya hay demasiadas reservaciones en ese horario
                const sameTimeReservations = appState.currentReservations.filter(reservation => {
                    return reservation.status === 'active' && 
                           reservation.date === data.date && 
                           Math.abs(new Date('1970/01/01 ' + reservation.time) - new Date('1970/01/01 ' + data.time)) < 1000 * 60 * 30;
                });
                
                // Si hay menos de 5 reservaciones en ese rango de 30 minutos, hay disponibilidad
                resolve(sameTimeReservations.length < 5);
            }, 500);
        });
    }

    /**
     * Muestra el modal de confirmación de reservación
     * @param {Object} data - Datos de la reservación
     */
    function showConfirmationModal(data) {
        const detailsContainer = document.getElementById('confirmation-details');
        detailsContainer.innerHTML = `
            <p><strong>Cliente:</strong> ${data.clientName}</p>
            <p><strong>Contacto:</strong> ${data.contactNumber}</p>
            <p><strong>Personas:</strong> ${data.partySize}</p>
            <p><strong>Fecha:</strong> ${formatDate(data.date)}</p>
            <p><strong>Hora:</strong> ${formatTime(data.time)}</p>
        `;
        
        appState.selectedReservation = data;
        confirmationModal.classList.remove('hidden');
    }

    /**
     * Cierra el modal de confirmación
     */
    function closeConfirmationModal() {
        confirmationModal.classList.add('hidden');
        appState.selectedReservation = null;
    }

    /**
     * Confirma y guarda la reservación
     */
    function confirmReservation() {
        if (!appState.selectedReservation) {
            closeConfirmationModal();
            return;
        }
        
        // En un sistema real, esto enviaría los datos a la base de datos
        saveReservation(appState.selectedReservation)
            .then(success => {
                if (success) {
                    form.reset();
                    closeConfirmationModal();
                    showNotification('Reservación creada exitosamente', 'success');
                    loadReservations();
                } else {
                    showNotification('Error al guardar la reservación', 'error');
                }
            })
            .catch(error => {
                console.error('Error al guardar reservación:', error);
                showNotification('Ocurrió un error al procesar la reservación', 'error');
            });
    }

    /**
     * Guarda una reservación en la base de datos
     * @param {Object} data - Datos de la reservación
     * @returns {Promise<boolean>} - Promesa que resuelve a verdadero si se guardó correctamente
     */
    function saveReservation(data) {
        // En un sistema real, esto enviaría los datos a la base de datos mediante una API
        // Por ahora, simulamos una respuesta asíncrona y guardamos en localStorage
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    // Obtenemos las reservaciones existentes
                    const savedReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                    
                    // Creamos una nueva reservación
                    const newReservation = {
                        id: Date.now(), // Usamos timestamp como ID único
                        clientName: data.clientName,
                        contactNumber: data.contactNumber,
                        partySize: data.partySize,
                        date: data.date,
                        time: data.time,
                        status: 'active',
                        createdAt: new Date().toISOString()
                    };
                    
                    // Agregamos la nueva reservación
                    savedReservations.push(newReservation);
                    
                    // Guardamos en localStorage
                    localStorage.setItem('reservations', JSON.stringify(savedReservations));
                    
                    resolve(true);
                } catch (error) {
                    console.error('Error al guardar en localStorage:', error);
                    resolve(false);
                }
            }, 800);
        });
    }

    /**
     * Carga las reservaciones existentes
     */
    function loadReservations() {
        // En un sistema real, esto cargaría desde la base de datos
        // Por ahora, cargamos desde localStorage
        getReservations()
            .then(reservations => {
                appState.currentReservations = reservations;
                displayReservations();
            })
            .catch(error => {
                console.error('Error al cargar reservaciones:', error);
                showNotification('Error al cargar las reservaciones', 'error');
            });
    }

    /**
     * Obtiene las reservaciones de la base de datos
     * @returns {Promise<Array>} - Promesa que resuelve a un array de reservaciones
     */
    function getReservations() {
        // Simulamos una respuesta asíncrona desde localStorage
        return new Promise((resolve) => {
            setTimeout(() => {
                const savedReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                resolve(savedReservations);
            }, 500);
        });
    }

    /**
     * Muestra las reservaciones en la interfaz
     */
    function displayReservations() {
        // Filtrar según el estado seleccionado
        const filteredReservations = appState.currentReservations.filter(reservation => {
            if (appState.filterStatus === 'all') return true;
            return reservation.status === appState.filterStatus;
        });
        
        // Ordenar por fecha y hora
        filteredReservations.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });
        
        // Limpiar la lista existente
        reservationsList.innerHTML = '';
        
        if (filteredReservations.length === 0) {
            reservationsList.innerHTML = `
                <tr class="text-gray-400 italic">
                    <td colspan="5" class="py-4 px-3 text-center">No hay reservaciones</td>
                </tr>
            `;
            return;
        }
        
        // Agregar cada reservación a la lista
        filteredReservations.forEach(reservation => {
            const row = document.createElement('tr');
            if (reservation.status === 'cancelled') {
                row.classList.add('cancelled-reservation');
            }
            
            row.innerHTML = `
                <td class="py-3 px-3">${reservation.clientName}</td>
                <td class="py-3 px-3">${reservation.partySize}</td>
                <td class="py-3 px-3">${formatDate(reservation.date)}</td>
                <td class="py-3 px-3">${formatTime(reservation.time)}</td>
                <td class="py-3 px-3">
                    ${reservation.status === 'active' ? `
                        <button class="cancel-btn bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600" 
                            data-id="${reservation.id}">
                            Cancelar
                        </button>
                    ` : 
                        '<span class="text-xs text-gray-500">Cancelada</span>'
                    }
                </td>
            `;
            
            reservationsList.appendChild(row);
        });
        
        // Agregar event listeners a los botones de cancelar
        document.querySelectorAll('.cancel-btn').forEach(button => {
            button.addEventListener('click', () => showCancelModal(button.getAttribute('data-id')));
        });
    }

    /**
     * Maneja el cambio en el filtro de estado
     */
    function handleFilterChange() {
        appState.filterStatus = filterSelect.value;
        displayReservations();
    }

    /**
     * Muestra el modal para cancelar una reservación
     * @param {string} id - ID de la reservación
     */
    function showCancelModal(id) {
        const reservation = appState.currentReservations.find(r => r.id.toString() === id);
        if (!reservation) return;
        
        appState.selectedReservation = reservation;
        
        const detailsContainer = document.getElementById('cancel-details');
        detailsContainer.innerHTML = `
            <p><strong>Cliente:</strong> ${reservation.clientName}</p>
            <p><strong>Contacto:</strong> ${reservation.contactNumber}</p>
            <p><strong>Personas:</strong> ${reservation.partySize}</p>
            <p><strong>Fecha:</strong> ${formatDate(reservation.date)}</p>
            <p><strong>Hora:</strong> ${formatTime(reservation.time)}</p>
        `;
        
        document.getElementById('confirm-cancellation').setAttribute('data-id', id);
        cancelModal.classList.remove('hidden');
    }

    /**
     * Cierra el modal de cancelación
     */
    function closeCancelModal() {
        cancelModal.classList.add('hidden');
        appState.selectedReservation = null;
    }

    /**
     * Procesa la cancelación de una reservación
     */
    function processCancellation() {
        const id = document.getElementById('confirm-cancellation').getAttribute('data-id');
        if (!id) {
            closeCancelModal();
            return;
        }
        
        cancelReservation(id)
            .then(success => {
                if (success) {
                    closeCancelModal();
                    showNotification('Reservación cancelada exitosamente', 'success');
                    loadReservations();
                } else {
                    showNotification('Error al cancelar la reservación', 'error');
                }
            })
            .catch(error => {
                console.error('Error al cancelar reservación:', error);
                showNotification('Ocurrió un error al cancelar la reservación', 'error');
            });
    }

    /**
     * Cancela una reservación en la base de datos
     * @param {string} id - ID de la reservación
     * @returns {Promise<boolean>} - Promesa que resuelve a verdadero si se canceló correctamente
     */
    function cancelReservation(id) {
        // En un sistema real, esto actualizaría el estado en la base de datos
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    // Obtenemos las reservaciones existentes
                    const savedReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                    
                    // Encontramos y actualizamos la reservación
                    const updatedReservations = savedReservations.map(reservation => {
                        if (reservation.id.toString() === id) {
                            return { ...reservation, status: 'cancelled' };
                        }
                        return reservation;
                    });
                    
                    // Guardamos en localStorage
                    localStorage.setItem('reservations', JSON.stringify(updatedReservations));
                    
                    resolve(true);
                } catch (error) {
                    console.error('Error al actualizar en localStorage:', error);
                    resolve(false);
                }
            }, 800);
        });
    }

    /**
     * Muestra una notificación temporal
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, info)
     */
    function showNotification(message, type = 'info') {
        // Eliminar notificaciones existentes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.classList.add('notification', 'alert-animation', 'fixed', 'top-4', 'right-4', 'p-4', 'rounded-md', 'shadow-lg', 'z-50');
        
        // Aplicar estilos según el tipo
        if (type === 'success') {
            notification.classList.add('bg-green-500', 'text-white');
        } else if (type === 'error') {
            notification.classList.add('bg-red-500', 'text-white');
        } else {
            notification.classList.add('bg-blue-500', 'text-white');
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Formatea una fecha para mostrar
     * @param {string} dateStr - Fecha en formato ISO
     * @returns {string} - Fecha formateada
     */
    function formatDate(dateStr) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('es-ES', options);
    }

    /**
     * Formatea una hora para mostrar
     * @param {string} timeStr - Hora en formato HH:MM
     * @returns {string} - Hora formateada
     */
    function formatTime(timeStr) {
        return timeStr;
    }

    // Inicializar la aplicación
    init();
});