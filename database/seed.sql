USE lennin_sorteos;

INSERT INTO tickets (ticket_id, nombre, dni, whatsapp, region, comprobante_url, monto_detectado, estado) VALUES
('TK1234567890', 'Juan Pérez García', '12345678', '987654321', 'Lima', '/uploads/test1.jpg', 10.00, 'aprobado'),
('TK0987654321', 'María López Torres', '87654321', '912345678', 'Arequipa', '/uploads/test2.jpg', 10.00, 'revision'),
('TK5555666677', 'Carlos Ruiz Díaz', '11223344', '998877665', 'Cusco', '/uploads/test3.jpg', 15.00, 'rechazado');
