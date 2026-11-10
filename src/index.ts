import 'dotenv/config';
import path from 'path';
import express, { Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { apiLimiter } from './middlewares/rateLimit.middleware';
import publicRoutes from './routes/public.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Necesario para despliegues en la nube (Render, Railway, etc.) detrás de proxy
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

// 1. Servir archivos estáticos del Panel Web SuperAdmin (/admin)
const publicDir = path.join(process.cwd(), 'public');
app.use(express.static(publicDir));

app.get('/', (_req: Request, res: Response) => {
  res.redirect('/admin');
});

app.get('/admin', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'admin', 'index.html'));
});

// 2. Límite de peticiones (Rate Limiting) global para proteger la API
app.use('/api', apiLimiter);

// 3. Documentación interactiva con Swagger UI en /api-docs
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Documentación Oficial UCL API',
    customCss: '.swagger-ui .topbar { background-color: #0d1b2a; }'
  })
);

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: '¡Bienvenido a la API Histórica de la UEFA Champions League!',
    superadmin_panel: `http://localhost:${PORT}/admin`,
    swagger_docs: `http://localhost:${PORT}/api-docs`
  });
});

// Rutas públicas (GET) y administrativas (POST / PUT con JWT)
app.use('/api/v1', publicRoutes);
app.use('/api/v1', adminRoutes);

app.listen(PORT, () => {
  console.log('=======================================================');
  console.log(`🏆 UCL Archive API en línea:    http://localhost:${PORT}`);
  console.log(`🛡️ Panel Web SuperAdmin:        http://localhost:${PORT}/admin`);
  console.log(`📖 Documentación Swagger UI:    http://localhost:${PORT}/api-docs`);
  console.log('=======================================================');

  // Auto-Ping (Keep-Alive) cada 12 minutos en Render para evitar que la instancia gratuita entre en reposo
  const externalUrl = process.env.RENDER_EXTERNAL_URL || '';
  if (externalUrl) {
    setInterval(async () => {
      try {
        await fetch(`${externalUrl}/api/v1/health`);
        console.log(`🔄 [Keep-Alive] Ping enviado a ${externalUrl}/api/v1/health`);
      } catch (_err) {
        // Ignorar errores de red temporales
      }
    }, 12 * 60 * 1000);
  }
});
