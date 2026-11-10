import fs from 'fs';
import path from 'path';
import multer from 'multer';

const clubsUploadDir = path.join(process.cwd(), 'public', 'uploads', 'clubs');
const playersUploadDir = path.join(process.cwd(), 'public', 'uploads', 'players');

// Aseguramos que las carpetas existan al arrancar el servidor
fs.mkdirSync(clubsUploadDir, { recursive: true });
fs.mkdirSync(playersUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const folder = String(req.query.folder || req.body?.folder || 'players').toLowerCase();
    const targetDir = folder === 'clubs' ? clubsUploadDir : playersUploadDir;
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const folder = String(req.query.folder || req.body?.folder || 'players').toLowerCase();
    const prefix = folder === 'clubs' ? 'club' : 'player';
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext) ? ext : '.png';
    const uniqueName = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e5)}${safeExt}`;
    cb(null, uniqueName);
  }
});

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Máximo 5 MB por imagen
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, WEBP, SVG, GIF)'));
    }
  }
});

