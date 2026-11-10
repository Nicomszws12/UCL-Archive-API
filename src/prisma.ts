import { PrismaClient } from '@prisma/client';

// Creamos una única conexión a la base de datos para usarla en toda nuestra API
export const prisma = new PrismaClient();

