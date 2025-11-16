# Instrucciones rápidas para ejecutar localmente

## Requisitos
- Node.js 18+
- MySQL 8+ (o adapta a sqlite si prefieres)
- npm

## Pasos

### 1) Configurar base de datos MySQL
- Crear la base y tablas:
  mysql -u root -p
  SOURCE database/schema.sql;

- (Opcional) Cargar datos de ejemplo:
  SOURCE database/seed.sql;

### 2) Backend
cd backend
npm install
# Copia .env.example a .env y edita con tus credenciales
cp .env.example .env
# Ejecuta en modo desarrollo
npm run dev
# El servidor correrá en http://localhost:5000

### 3) Frontend
cd frontend
npm install
npm run dev
# Frontend en http://localhost:3000 (vite), la configuración proxy envía /api a backend.

### 4) Probar
- En el navegador abre http://localhost:3000
- Registra un ticket (sube comprobante)
- Revisa panel admin en /admin o botón Admin (usa las credenciales del .env)

### Nota sobre OCR
El backend usa tesseract.js. En entornos con limitaciones ten en cuenta que tesseract puede tardar en reconocer imágenes grandes; si despliegas en un servicio gratuito revisa límites de ejecución.

