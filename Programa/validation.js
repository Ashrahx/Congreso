/**
 * Módulo de Validación para Sistema de Reservaciones
 * 
 * Este archivo contiene funciones de validación específicas
 * para asegurar que los datos ingresados cumplan con los
 * requisitos necesarios.
 * 
 * @author Juan Coohaz
 * @version 1.0
 */

/**
 * Valida que un campo de texto tenga un mínimo de caracteres
 * @param {string} value - El valor a validar
 * @param {number} minLength - Longitud mínima requerida
 * @returns {boolean} - Verdadero si el valor es válido
 */
function validateMinLength(value, minLength) {
    return value.trim().length >= minLength;
}

/**
 * Valida que un número de teléfono tenga un formato válido
 * @param {string} phone - El número de teléfono a validar
 * @returns {boolean} - Verdadero si el número es válido
 */
function validatePhone(phone) {
    // Eliminar espacios, guiones y paréntesis
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Validar que solo contenga dígitos y tenga entre 8 y 15 caracteres
    return /^\d{8,15}$/.test(cleanPhone);
}

/**
 * Valida que una fecha no sea anterior a la fecha actual
 * @param {string} date - La fecha a validar en formato YYYY-MM-DD
 * @returns {boolean} - Verdadero si la fecha es válida
 */
function validateFutureDate(date) {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today;
}

/**
 * Valida que una hora esté dentro del horario de operación
 * @param {string} time - La hora a validar en formato HH:MM
 * @param {string} openingTime - Hora de apertura en formato HH:MM
 * @param {string} closingTime - Hora de cierre en formato HH:MM
 * @returns {boolean} - Verdadero si la hora es válida
 */
function validateBusinessHours(time, openingTime = '10:00', closingTime = '22:00') {
    return time >= openingTime && time <= closingTime;
}

/**
 * Valida el número de personas para una reservación
 * @param {number} count - Número de personas
 * @param {number} min - Mínimo permitido
 * @param {number} max - Máximo permitido
 * @returns {boolean} - Verdadero si el número es válido
 */
function validatePartySize(count, min = 1, max = 20) {
    const partySize = parseInt(count);
    return !isNaN(partySize) && partySize >= min && partySize <= max;
}

/**
 * Valida un formulario completo de reservación
 * @param {Object} formData - Datos del formulario
 * @returns {Object} - Resultado de la validación con errores si existen
 */
function validateReservationForm(formData) {
    const errors = {};
    
    // Validar nombre del cliente
    if (!validateMinLength(formData.clientName, 3)) {
        errors.clientName = 'El nombre debe tener al menos 3 caracteres';
    }
    
    // Validar número de contacto
    if (!validatePhone(formData.contactNumber)) {
        errors.contactNumber = 'Ingrese un número de teléfono válido';
    }
    
    // Validar número de personas
    if (!validatePartySize(formData.partySize)) {
        errors.partySize = 'El número de personas debe estar entre 1 y 20';
    }
    
    // Validar fecha
    if (!validateFutureDate(formData.date)) {
        errors.date = 'La fecha no puede ser anterior a hoy';
    }
    
    // Validar hora
    if (!validateBusinessHours(formData.time)) {
        errors.time = 'La hora debe estar dentro del horario de operación (10:00 - 22:00)';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}