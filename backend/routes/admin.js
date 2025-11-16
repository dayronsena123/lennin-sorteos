import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

router.post('/login', async (req,res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
      return res.json({ success: true, token, message: 'Login exitoso' });
    } else {
      return res.status(401).json({ success:false, message:'Credenciales incorrectas' });
    }
  } catch(err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
