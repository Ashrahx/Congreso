/**
 * Módulo de Base de Datos para Sistema de Reservaciones
 * 
 * Este archivo contiene funciones para interactuar con la base de datos.
 * En un entorno de producción, estas funciones se conectarían a una base
 * de datos real mediante una API o servicios backend.
 * 
 * Para esta implementación, utilizamos localStorage como simulación.
 * 
 * @author Juan Coohaz
 * @version 1.0
 */

// Clase para manejar las operaciones de la base de datos
class ReservationDB {
    /**
     * Constructor de la clase
     */
    constructor() {
        // Inicializar la base de datos si no existe
        this.initDatabase();
    }
    
    /**
     * Inicializa la estructura de la base de datos
     */
    initDatabase() {
        if (!localStorage.getItem('reservations')) {
            localStorage.setItem('reservations', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('restaurant_config')) {
            const defaultConfig = {
                openingTime: '10:00',
                closingTime: '22:00',
                maxCapacity: 50,
                tablesAvailable: 10
            };
            localStorage.setItem('restaurant_config', JSON.stringify(defaultConfig));
        }
    }
    
    /**
     * Obtiene todas las reservaciones
     * @returns {Promise<Array>} - Promesa que resuelve a un array de reservaciones
     */
    async getAllReservations() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                resolve(reservations);
            }, 300);
        });
    }
    
    /**
     * Obtiene una reservación por su ID
     * @param {string|number} id - ID de la reservación
     * @returns {Promise<Object|null>} - Promesa que resuelve a la reservación o null si no existe
     */
    async getReservationById(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                const reservation = reservations.find(r => r.id.toString() === id.toString());
                resolve(reservation || null);
            }, 200);
        });
    }
    
    /**
     * Crea una nueva reservación
     * @param {Object} reservationData - Datos de la reservación
     * @returns {Promise<Object>} - Promesa que resuelve a la reservación creada
     */
    async createReservation(reservationData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                
                const newReservation = {
                    id: Date.now(),
                    clientName: reservationData.clientName,
                    contactNumber: reservationData.contactNumber,
                    partySize: parseInt(reservationData.partySize),
                    date: reservationData.date,
                    time: reservationData.time,
                    status: 'active',
                    createdAt: new Date().toISOString()
                };
                
                reservations.push(newReservation);
                localStorage.setItem('reservations', JSON.stringify(reservations));
                
                resolve(newReservation);
            }, 500);
        });
    }
    
    /**
     * Actualiza una reservación existente
     * @param {string|number} id - ID de la reservación
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Object|null>} - Promesa que resuelve a la reservación actualizada o null si no existe
     */
    async updateReservation(id, updateData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                
                let updatedReservation = null;
                const updatedReservations = reservations.map(reservation => {
                    if (reservation.id.toString() === id.toString()) {
                        updatedReservation = { ...reservation, ...updateData };
                        return updatedReservation;
                    }
                    return reservation;
                });
                
                localStorage.setItem('reservations', JSON.stringify(updatedReservations));
                
                resolve(updatedReservation);
            }, 500);
        });
    }
    
    /**
     * Cancela una reservación
     * @param {string|number} id - ID de la reservación
     * @returns {Promise<boolean>} - Promesa que resuelve a true si se canceló correctamente
     */
    async cancelReservation(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                
                let found = false;
                const updatedReservations = reservations.map(reservation => {
                    if (reservation.id.toString() === id.toString()) {
                        found = true;
                        return { ...reservation, status: 'cancelled' };
                    }
                    return reservation;
                });
                
                if (found) {
                    localStorage.setItem('reservations', JSON.stringify(updatedReservations));
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 500);
        });
    }
    
    /**
     * Verifica disponibilidad para una reservación
     * @param {Object} reservationData - Datos de la reservación
     * @returns {Promise<boolean>} - Promesa que resuelve a true si hay disponibilidad
     */
    async checkAvailability(reservationData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                const config = JSON.parse(localStorage.getItem('restaurant_config') || '{}');
                
                // Filtrar reservaciones activas para la misma fecha
                const sameDate = reservations.filter(r => 
                    r.status === 'active' && 
                    r.date === reservationData.date
                );
                
                // Convertir tiempo de reservación a objeto Date para comparaciones
                const reservationTime = new Date(`1970-01-01T${reservationData.time}:00`);
                
                // Contar reservaciones en el mismo horario (±30 minutos)
                const sameTimeCount = sameDate.filter(r => {
                    const rTime = new Date(`1970-01-01T${r.time}:00`);
                    const diffMinutes = Math.abs((reservationTime - rTime) / (1000 * 60));
                    return diffMinutes < 30;
                }).reduce((total, r) => total + r.partySize, 0);
                
                // Verificar si hay capacidad disponible
                const maxCapacity = config.maxCapacity || 50;
                const available = (sameTimeCount + parseInt(reservationData.partySize)) <= maxCapacity;
                
                resolve(available);
            }, 400);
        });
    }
    
    /**
     * Obtiene la configuración del restaurante
     * @returns {Promise<Object>} - Promesa que resuelve a la configuración
     */
    async getRestaurantConfig() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const config = JSON.parse(localStorage.getItem('restaurant_config') || '{}');
                resolve(config);
            }, 200);
        });
    }
    
    /**
     * Actualiza la configuración del restaurante
     * @param {Object} configData - Datos de configuración
     * @returns {Promise<Object>} - Promesa que resuelve a la configuración actualizada
     */
    async updateRestaurantConfig(configData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const currentConfig = JSON.parse(localStorage.getItem('restaurant_config') || '{}');
                const updatedConfig = { ...currentConfig, ...configData };
                
                localStorage.setItem('restaurant_config', JSON.stringify(updatedConfig));
                
                resolve(updatedConfig);
            }, 300);
        });
    }
}

// Crear una instancia global de la base de datos
const reservationDB = new ReservationDB();