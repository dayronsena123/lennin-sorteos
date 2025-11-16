import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const verifyToken = (req,res,next) => {
  const header = req.headers['authorization'] || '';
  const token = header.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'Token requerido' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch(err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
