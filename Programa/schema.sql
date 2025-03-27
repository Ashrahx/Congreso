-- Schema para la base de datos de reservaciones
CREATE DATABASE IF NOT EXISTS restaurant_reservations;
USE restaurant_reservations;

-- Tabla principal de reservaciones
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    party_size INT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'cancelled') DEFAULT 'active'
);

-- Tabla para configuración del restaurante
CREATE TABLE IF NOT EXISTS restaurant_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    max_capacity INT NOT NULL DEFAULT 50,
    tables_available INT NOT NULL DEFAULT 10
);

-- Insertar configuración inicial del restaurante
INSERT INTO restaurant_config (opening_time, closing_time, max_capacity, tables_available)
VALUES ('10:00:00', '22:00:00', 50, 10);

-- Índices para optimizar búsquedas
CREATE INDEX idx_reservation_datetime ON reservations(reservation_date, reservation_time);
CREATE INDEX idx_reservation_status ON reservations(status);