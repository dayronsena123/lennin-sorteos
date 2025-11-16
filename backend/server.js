import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import ticketRoutes from './routes/tickets.js';
import adminRoutes from './routes/admin.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Servir comprobantes
app.use('/uploads', express.static(uploadsDir));

// Rutas
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);

// Health
app.get('/api/health', (req,res)=> res.json({status:'OK'}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
