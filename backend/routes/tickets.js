import express from 'express';
import pool from '../config/database.js';
import upload from '../middleware/upload.js';
import { processImageOCR } from '../utils/ocr.js';
import { generateTicketID } from '../utils/ticketGenerator.js';
import path from 'path';

const router = express.Router();

router.post('/', upload.single('comprobante'), async (req,res) => {
  try {
    const { nombre, dni, whatsapp, region } = req.body;
    if (!nombre || !dni || !whatsapp || !region || !req.file) return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    if (!/^[0-9]{8}$/.test(dni)) return res.status(400).json({ error: 'DNI inválido' });
    if (!/^[0-9]{9}$/.test(whatsapp)) return res.status(400).json({ error: 'WhatsApp inválido' });

    const ticketId = generateTicketID();
    const imagePath = req.file.path;
    const ocr = await processImageOCR(imagePath);
    const comprobanteUrl = `/uploads/${req.file.filename}`;

    const query = `
      INSERT INTO tickets (ticket_id, nombre, dni, whatsapp, region, comprobante_url, monto_detectado, estado, fecha_registro)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    await pool.execute(query, [ticketId, nombre, dni, whatsapp, region, comprobanteUrl, ocr.monto, ocr.estado]);

    const [rows] = await pool.execute('SELECT * FROM tickets WHERE ticket_id = ?', [ticketId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creando ticket', err);
    res.status(500).json({ error: 'Error al crear ticket' });
  }
});

router.get('/', async (req,res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tickets ORDER BY fecha_registro DESC');
    res.json(rows);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
});

router.get('/search/:dni', async (req,res) => {
  try {
    const { dni } = req.params;
    const [rows] = await pool.execute('SELECT * FROM tickets WHERE dni = ? ORDER BY fecha_registro DESC', [dni]);
    res.json(rows);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar tickets' });
  }
});

router.put('/:ticketId/status', async (req,res) => {
  try {
    const { ticketId } = req.params;
    const { estado } = req.body;
    if (!['aprobado','rechazado','revision'].includes(estado)) return res.status(400).json({ error: 'Estado inválido' });
    await pool.execute('UPDATE tickets SET estado = ? WHERE ticket_id = ?', [estado, ticketId]);
    const [rows] = await pool.execute('SELECT * FROM tickets WHERE ticket_id = ?', [ticketId]);
    res.json(rows[0]);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

export default router;
