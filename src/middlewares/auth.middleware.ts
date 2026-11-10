import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_super_secreta_champions_league_2026';

export interface AuthRequest extends Request {
  user?: {
    username: string;
    role: 'SUPERADMIN' | 'ADMIN' | 'EDITOR';
  };
}

/**
 * Middleware que protege las rutas operativas (Permite SUPERADMIN, ADMIN y EDITOR)
 */
export const requireAdminJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: 'Acceso denegado. Debes enviar un token JWT en el encabezado Authorization: Bearer <token>'
    });
    return;
  }

  let token = authHeader.replace(/^Bearer\s+/i, '').trim();
  token = token.replace(/^Bearer\s+/i, '').trim();
  token = token.replace(/^["']+|["']+$/g, '').trim();

  if (!token) {
    res.status(401).json({
      error: 'Acceso denegado. El token proporcionado está vacío.'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: 'SUPERADMIN' | 'ADMIN' | 'EDITOR' };

    const validRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR'];
    if (!validRoles.includes(decoded.role)) {
      res.status(403).json({ error: 'Permisos insuficientes. Token no autorizado para administración.' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token JWT inválido o expirado' });
  }
};

/**
 * Middleware estricto para operaciones críticas/destructivas (EXCLUSIVO SUPERADMIN)
 */
export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  requireAdminJWT(req, res, () => {
    if (req.user?.role !== 'SUPERADMIN') {
      res.status(403).json({
        error: 'Permisos insuficientes. Acción de alto riesgo reservada exclusivamente para el SuperAdmin titular.'
      });
      return;
    }
    next();
  });
};
