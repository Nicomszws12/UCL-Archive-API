import rateLimit from 'express-rate-limit';

// 1. Limitador general para proteger la API (500 peticiones cada 15 minutos por IP)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // Máximo 500 peticiones por ventana
  standardHeaders: true, // Devuelve información de límite en cabeceras `RateLimit-*`
  legacyHeaders: false, // Deshabilita cabeceras antiguas `X-RateLimit-*`
  message: {
    status: 429,
    error: 'Límite de peticiones alcanzado',
    message: 'Has enviado demasiadas peticiones en un corto período de tiempo. Por favor intenta de nuevo en 15 minutos.'
  }
});

// 2. Limitador estricto para el Login (Previene ataques de fuerza bruta al SuperAdmin)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Máximo 20 intentos de login cada 15 minutos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Demasiados intentos de autenticación',
    message: 'Has superado el límite de intentos de login. Por seguridad, espera 15 minutos antes de volver a intentar.'
  }
});
