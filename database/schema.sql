-- Crear base de datos
CREATE DATABASE IF NOT EXISTS lennin_sorteos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lennin_sorteos;

-- Tabla de tickets
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  dni VARCHAR(8) NOT NULL,
  whatsapp VARCHAR(9) NOT NULL,
  region VARCHAR(100) NOT NULL,
  comprobante_url TEXT NOT NULL,
  monto_detectado DECIMAL(10,2) DEFAULT NULL,
  estado ENUM('aprobado','rechazado','revision') DEFAULT 'revision',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_dni (dni),
  INDEX idx_ticket_id (ticket_id),
  INDEX idx_estado (estado),
  INDEX idx_fecha (fecha_registro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
