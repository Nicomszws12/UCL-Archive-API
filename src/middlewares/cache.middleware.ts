import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

// Conexión a Redis con reintento controlado
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  retryStrategy: (times) => (times <= 3 ? 1000 : null)
});

let isRedisReady = false;

// Intentamos conectar a Redis
redis.connect()
  .then(() => {
    isRedisReady = true;
    console.log('⚡ [Redis] Servidor de caché Redis conectado exitosamente en el puerto 6379.');
  })
  .catch(() => {
    console.log('ℹ️ [Caché] Redis local no disponible. Usando motor de caché en memoria de respaldo.');
  });

redis.on('error', () => {
  isRedisReady = false;
});

// Almacén en memoria de respaldo si Redis no está activo
const memoryStore = new Map<string, { data: string; expiresAt: number }>();

/**
 * Obtiene un valor desde Redis o memoria de respaldo
 */
export const getFromCache = async (key: string): Promise<string | null> => {
  if (isRedisReady) {
    try {
      return await redis.get(key);
    } catch {
      // Si falla Redis, pasa al almacén en memoria
    }
  }

  const item = memoryStore.get(key);
  if (item && item.expiresAt > Date.now()) {
    return item.data;
  }
  if (item) {
    memoryStore.delete(key);
  }
  return null;
};

/**
 * Guarda un valor en Redis o memoria de respaldo con expiración (TTL)
 */
export const setInCache = async (key: string, data: string, ttlSeconds: number = 60): Promise<void> => {
  if (isRedisReady) {
    try {
      await redis.setex(key, ttlSeconds, data);
      return;
    } catch {
      // Si falla Redis, guarda en memoria
    }
  }

  memoryStore.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
};

/**
 * Invalida todo el caché (se usa al crear partidos, goles o actualizar jugadores)
 */
export const clearCache = async (): Promise<void> => {
  memoryStore.clear();
  if (isRedisReady) {
    try {
      const keys = await redis.keys('ucl:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {
      // Ignorar si hay error
    }
  }
};

/**
 * Middleware para cachear respuestas GET (por defecto 60 segundos)
 */
export const cacheMiddleware = (ttlSeconds: number = 60) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const cacheKey = `ucl:${req.originalUrl || req.url}`;

    try {
      const cachedData = await getFromCache(cacheKey);

      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Content-Type', 'application/json');
        res.send(cachedData);
        return;
      }

      res.setHeader('X-Cache', 'MISS');

      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (res.statusCode === 200) {
          const stringified = JSON.stringify(body);
          setInCache(cacheKey, stringified, ttlSeconds).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      next();
    }
  };
};

