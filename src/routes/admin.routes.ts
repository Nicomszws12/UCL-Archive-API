import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { requireAdminJWT, requireSuperAdmin, AuthRequest } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';
import { clearCache } from '../middlewares/cache.middleware';
import { uploadImage } from '../middlewares/upload.middleware';
import { generateOtp, verifyOtp, sendOtpEmail } from '../services/mail.service';
import { EventType, MatchStatus, PhaseCode, SquadRole, TournamentFormat } from '@prisma/client';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'clave_super_secreta_champions_league_2026';

// ============================================================================
// 👇 CUENTAS OFICIALES DE SUPERADMIN (NICOLÁS + AMIGO CO-DESARROLLADOR) 👇
// Puedes configurar las credenciales de tu amigo directamente en el archivo .env
// (SUPERADMIN_2_EMAIL y SUPERADMIN_2_PASSWORD) o reemplazarlas aquí abajo:
// ============================================================================
interface SuperAdminAccount {
  name: string;
  email: string;
  password: string;
  smtpUser?: string;
  smtpPass?: string;
}

function getSuperAdminAccounts(): SuperAdminAccount[] {
  const accounts: SuperAdminAccount[] = [
    {
      name: 'Nicolás (SuperAdmin Principal)',
      email: (process.env.SUPERADMIN_EMAIL || 'nicolasnieto191213@gmail.com').trim().toLowerCase(),
      password: process.env.SUPERADMIN_PASSWORD || 'N4k0laz1122$*',
      smtpUser: process.env.SMTP_USER || process.env.SUPERADMIN_EMAIL || 'nicolasnieto191213@gmail.com',
      smtpPass: process.env.SMTP_PASS || ''
    },
    {
      // 👉 CREDENCIALES Y SMTP DE TU AMIGO (SUPERADMIN 2):
      name: process.env.SUPERADMIN_2_NAME || 'Alejandro Rodríguez (SuperAdmin 2)',
      email: (process.env.SUPERADMIN_2_EMAIL || 'alejandrorodriguezrubio2005@gmail.com').trim().toLowerCase(),
      password: process.env.SUPERADMIN_2_PASSWORD || 'Alejo elrey2005@',
      smtpUser: process.env.SMTP_2_USER || process.env.SUPERADMIN_2_EMAIL || 'alejandrorodriguezrubio2005@gmail.com',
      smtpPass: process.env.SMTP_2_PASS || ''
    }
  ];

  return accounts.filter((acc) => acc.email && acc.password);
}

// Lista oficial de las 55 federaciones miembro de la UEFA
const UEFA_COUNTRY_CODES = new Set([
  // 1. Europa Occidental y Central
  'GER', 'AUT', 'BEL', 'FRA', 'NED', 'IRL', 'LIE', 'LUX', 'SUI',
  // 2. Islas Británicas y Europa del Norte
  'ENG', 'SCO', 'WAL', 'NIR', 'DEN', 'FIN', 'ISL', 'NOR', 'SWE', 'FRO',
  // 3. Europa del Sur y Países Mediterráneos
  'ESP', 'ITA', 'POR', 'GRE', 'CYP', 'MLT', 'TUR', 'GIB', 'AND', 'SMR',
  // 4. Europa del Este y Balcanes
  'ALB', 'BIH', 'CRO', 'SVN', 'MKD', 'MNE', 'SRB', 'KOS', 'BUL', 'CZE', 'SVK', 'HUN', 'POL', 'ROU',
  // 5. Región Báltica y Ex repúblicas Soviéticas / Euroasiáticas
  'EST', 'LVA', 'LTU', 'BLR', 'MDA', 'UKR', 'RUS', 'GEO', 'ARM', 'AZE', 'KAZ', 'ISR'
]);

/**
 * 0.1 PASO 1 2FA: POST /api/v1/auth/request-code
 * Valida correo y contraseña del SuperAdmin. Si son correctos, envía código de 6 dígitos
 */
router.post('/auth/request-code', authLimiter, async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanPassword = typeof password === 'string' ? password : '';

  if (!normalizedEmail || !cleanPassword) {
    res.status(400).json({ error: 'Debes proporcionar tu correo y tu contraseña maestra' });
    return;
  }

  // Comprobación estricta contra la lista de cuentas SuperAdmin autorizadas (Nicolás + Amigo)
  const matchedAdmin = getSuperAdminAccounts().find(
    (acc) => acc.email === normalizedEmail && acc.password === cleanPassword
  );

  if (!matchedAdmin) {
    res.status(401).json({
      error: 'Correo o contraseña de SuperAdmin incorrectos. Verifica que hayas escrito ambos datos correctamente.'
    });
    return;
  }

  // Generamos el código OTP de 6 dígitos
  const code = generateOtp(normalizedEmail);

  // Enviamos por correo usando el SMTP de la cuenta (o el principal de respaldo) y registramos en consola
  const mailResult = await sendOtpEmail(normalizedEmail, code, matchedAdmin.name, {
    user: matchedAdmin.smtpUser,
    pass: matchedAdmin.smtpPass
  });

  res.json({
    message: `Código de verificación de 6 dígitos generado para ${normalizedEmail}`,
    email: normalizedEmail,
    sentViaSmtp: mailResult.sentViaSmtp,
    expires_in_seconds: 600,
    notice: mailResult.sentViaSmtp
      ? 'Revisa tu bandeja de entrada en Gmail.'
      : 'Código generado y visible en la terminal del servidor (puedes configurar SMTP_PASS en .env para entrega en Gmail).'
  });
});

/**
 * 0.2 PASO 2 2FA: POST /api/v1/auth/verify-code
 * Comprueba el código de 6 dígitos y entrega el Token JWT con rol SUPERADMIN
 */
router.post('/auth/verify-code', authLimiter, (req: Request, res: Response) => {
  const { email, code } = req.body;

  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanCode = typeof code === 'string' ? code.trim() : '';

  if (!normalizedEmail || !cleanCode) {
    res.status(400).json({ error: 'Debes indicar el correo y el código de 6 dígitos recibido' });
    return;
  }

  const verification = verifyOtp(normalizedEmail, cleanCode);
  if (!verification.valid) {
    res.status(400).json({ error: verification.error || 'Código incorrecto o expirado' });
    return;
  }

  // Éxito: Generamos el Token JWT de SuperAdmin con 12 horas de duración
  const token = jwt.sign(
    { username: normalizedEmail, role: 'SUPERADMIN' },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.json({
    message: 'Autenticación de SuperAdmin exitosa con Doble Factor (2FA)',
    user: { username: normalizedEmail, role: 'SUPERADMIN' },
    token
  });
});

/**
 * 0.3 POST /api/v1/auth/login (Compatibilidad Thunder Client / Colaboradores)
 * Los usuarios que ingresan por usuario/contraseña genérica o Thunder Client
 * reciben un Token con rol 'EDITOR' (limitado: no pueden vaciar la base de datos)
 */
router.post('/auth/login', authLimiter, (req: Request, res: Response) => {
  const { username, password } = req.body;
  const adminPass = process.env.ADMIN_PASSWORD || 'admin_ucl_2026';

  const cleanUser = typeof username === 'string' && username.trim() ? username.trim() : 'colaborador';

  if (password === adminPass) {
    const token = jwt.sign(
      { username: cleanUser, role: 'EDITOR' },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      message: 'Autenticación exitosa como Colaborador/Editor (Rol limitado: sin permisos destructivos)',
      user: { username: cleanUser, role: 'EDITOR' },
      token
    });
    return;
  }

  res.status(401).json({
    error: 'Contraseña de colaborador inválida (por defecto: admin_ucl_2026). Para acceso SuperAdmin utiliza tu correo personal con 2FA.'
  });
});

/**
 * 0.4 POST /api/v1/auth/generate-editor-token (Exclusivo SuperAdmin)
 * Permite al SuperAdmin generar tokens de colaborador con rol EDITOR
 */
router.post('/auth/generate-editor-token', requireSuperAdmin, (req: AuthRequest, res: Response) => {
  const { collaborator_name = 'colaborador', hours = 24 } = req.body;

  const token = jwt.sign(
    { username: String(collaborator_name).trim(), role: 'EDITOR' },
    JWT_SECRET,
    { expiresIn: `${Math.max(1, Number(hours) || 24)}h` }
  );

  res.status(201).json({
    message: `Token de colaborador generado para "${collaborator_name}" (Válido por ${hours} horas)`,
    role: 'EDITOR',
    token
  });
});

/**
 * 0.5 GET /api/v1/auth/verify (Protegido con JWT)
 */
router.get('/auth/verify', requireAdminJWT, (req: AuthRequest, res: Response) => {
  res.json({
    valid: true,
    message: 'Token JWT verificado correctamente',
    user: req.user
  });
});

/**
 * 0.6 POST /api/v1/upload (Protegido con JWT)
 * Sube una imagen local (escudo de club o foto de jugador) y devuelve la URL pública
 */
router.post('/upload', requireAdminJWT, (req: Request, res: Response) => {
  const singleUpload = uploadImage.single('image');
  singleUpload(req, res, (err: any) => {
    if (err) {
      res.status(400).json({ error: err.message || 'Error al subir la imagen' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No se recibió ningún archivo de imagen' });
      return;
    }

    const folder = String(req.query.folder || req.body?.folder || 'players').toLowerCase() === 'clubs'
      ? 'clubs'
      : 'players';

    const publicUrl = `/uploads/${folder}/${req.file.filename}`;
    res.status(201).json({
      message: 'Imagen subida exitosamente',
      url: publicUrl
    });
  });
});

/**
 * 0.7 DELETE /api/v1/admin/reset-database (PROTEGIDO EXCLUSIVO SUPERADMIN)
 * Vacía completamente todos los registros de la base de datos para empezar desde cero.
 * Los usuarios con rol EDITOR o tokens limitados tienen TERMINANTEMENTE PROHIBIDO ejecutar esto.
 */
router.delete('/admin/reset-database', requireSuperAdmin, async (_req: Request, res: Response) => {
  try {
    await prisma.$transaction([
      prisma.matchEvent.deleteMany(),
      prisma.match.deleteMany(),
      prisma.squadMember.deleteMany(),
      prisma.phase.deleteMany(),
      prisma.season.deleteMany(),
      prisma.player.deleteMany(),
      prisma.club.deleteMany()
    ]);

    await clearCache();

    res.json({
      message: 'Base de datos vaciada por completo por el SuperAdmin. Lista para carga manual desde cero.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al vaciar la base de datos' });
  }
});

/**
 * 1. POST /api/v1/clubs (Protegido con JWT)
 * Crea un club nuevo con crest_url (archivo subido o URL)
 */
router.post('/clubs', requireAdminJWT, async (req: Request, res: Response) => {
  try {
    const { name, short_name, country_code, stadium, titles_count = 0, crest_url } = req.body;

    if (!name || !short_name || !country_code || !stadium) {
      res.status(400).json({
        error: 'Todos los campos son obligatorios: name, short_name, country_code y stadium'
      });
      return;
    }

    const cleanCountry = String(country_code).trim().toUpperCase();
    if (!UEFA_COUNTRY_CODES.has(cleanCountry)) {
      res.status(400).json({
        error: `El código de país "${cleanCountry}" no pertenece a una federación miembro de la UEFA. Solo clubes de la UEFA pueden disputar la Champions League.`
      });
      return;
    }

    const cleanName = String(name).trim();
    const existingClub = await prisma.club.findFirst({
      where: {
        name: { equals: cleanName, mode: 'insensitive' }
      }
    });

    if (existingClub) {
      res.status(400).json({
        error: `El club "${cleanName}" ya está registrado en la base de datos`
      });
      return;
    }

    const newClub = await prisma.club.create({
      data: {
        name: cleanName,
        short_name: String(short_name).trim().toUpperCase().slice(0, 5),
        country_code: cleanCountry,
        stadium: String(stadium).trim(),
        titles_count: Math.max(0, Number(titles_count) || 0),
        crest_url: crest_url && String(crest_url).trim() !== '' ? String(crest_url).trim() : null
      }
    });

    await clearCache();

    res.status(201).json({
      message: 'Club registrado exitosamente',
      data: newClub
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al registrar el club' });
  }
});

/**
 * 1.1 PUT /api/v1/clubs/:id (Protegido con JWT)
 * Actualiza datos o escudo (crest_url) de un club existente
 */
router.put('/clubs/:id', requireAdminJWT, async (req: Request, res: Response) => {
  try {
    const clubId = Number(req.params.id);
    const { name, short_name, country_code, stadium, titles_count, crest_url } = req.body;

    const existingClub = await prisma.club.findUnique({ where: { id: clubId } });
    if (!existingClub) {
      res.status(404).json({ error: 'Club no encontrado' });
      return;
    }

    if (country_code !== undefined) {
      const cleanCountry = String(country_code).trim().toUpperCase();
      if (!UEFA_COUNTRY_CODES.has(cleanCountry)) {
        res.status(400).json({ error: `El país "${cleanCountry}" no pertenece a la UEFA` });
        return;
      }
    }

    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(short_name !== undefined && { short_name: String(short_name).trim().toUpperCase().slice(0, 5) }),
        ...(country_code !== undefined && { country_code: String(country_code).trim().toUpperCase() }),
        ...(stadium !== undefined && { stadium: String(stadium).trim() }),
        ...(titles_count !== undefined && { titles_count: Math.max(0, Number(titles_count) || 0) }),
        ...(crest_url !== undefined && {
          crest_url: crest_url && String(crest_url).trim() !== '' ? String(crest_url).trim() : null
        })
      }
    });

    await clearCache();

    res.json({
      message: 'Club actualizado exitosamente',
      data: updatedClub
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el club' });
  }
});

/**
 * 2. POST /api/v1/players (Protegido con JWT)
 * Crea un jugador nuevo con photo_url (archivo subido o URL)
 */
router.post('/players', requireAdminJWT, async (req: Request, res: Response) => {
  try {
    const {
      first_name,
      last_name,
      nationality,
      position,
      active = true,
      total_goals = 0,
      total_appearances = 0,
      photo_url
    } = req.body;

    if (!first_name || !last_name || !nationality || !position) {
      res.status(400).json({
        error: 'Los campos first_name, last_name, nationality y position son obligatorios'
      });
      return;
    }

    const newPlayer = await prisma.player.create({
      data: {
        first_name: String(first_name).trim(),
        last_name: String(last_name).trim(),
        nationality: String(nationality).trim().toUpperCase().slice(0, 3),
        position: String(position).trim(),
        active: Boolean(active),
        total_goals: Math.max(0, Number(total_goals) || 0),
        total_appearances: Math.max(0, Number(total_appearances) || 0),
        photo_url: photo_url && String(photo_url).trim() !== '' ? String(photo_url).trim() : null
      }
    });

    await clearCache();

    res.status(201).json({
      message: 'Jugador registrado exitosamente',
      data: newPlayer
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al registrar el jugador' });
  }
});

/**
 * 2.1 PUT /api/v1/players/:id (Protegido con JWT)
 * Actualiza información biográfica, foto (photo_url) o estadísticas de un jugador
 */
router.put('/players/:id', requireAdminJWT, async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.params.id);
    const {
      first_name,
      last_name,
      nationality,
      position,
      active,
      total_goals,
      total_appearances,
      photo_url
    } = req.body;

    const existingPlayer = await prisma.player.findUnique({ where: { id: playerId } });
    if (!existingPlayer) {
      res.status(404).json({ error: 'Jugador no encontrado' });
      return;
    }

    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: {
        ...(first_name !== undefined && { first_name: String(first_name).trim() }),
        ...(last_name !== undefined && { last_name: String(last_name).trim() }),
        ...(nationality !== undefined && { nationality: String(nationality).toUpperCase().slice(0, 3) }),
        ...(position !== undefined && { position: String(position).trim() }),
        ...(active !== undefined && { active: Boolean(active) }),
        ...(total_goals !== undefined && { total_goals: Math.max(0, Number(total_goals) || 0) }),
        ...(total_appearances !== undefined && { total_appearances: Math.max(0, Number(total_appearances) || 0) }),
        ...(photo_url !== undefined && {
          photo_url: photo_url && String(photo_url).trim() !== '' ? String(photo_url).trim() : null
        })
      }
    });

    await clearCache();

    res.json({
      message: 'Información del jugador actualizada con éxito',
      data: updatedPlayer
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el jugador' });
  }
});

/**
 * 3. POST /api/v1/seasons (Protegido con JWT)
 * Crea una temporada desde cero y genera automáticamente todas sus fases en transacción
 */
router.post('/seasons', requireAdminJWT, async (req: Request, res: Response) => {
  try {
    const {
      year_start,
      year_end,
      format,
      teams_count,
      champion_id,
      runner_up_id,
      top_scorer_id
    } = req.body;

    const startYear = Number(year_start);
    const endYear = year_end ? Number(year_end) : startYear + 1;

    if (!startYear || startYear < 1955 || startYear > 2100) {
      res.status(400).json({ error: 'Ingresa un año de inicio válido (ej: 1992 a 2030)' });
      return;
    }

    if (endYear !== startYear + 1) {
      res.status(400).json({
        error: `El año de fin (${endYear}) debe ser exactamente el año siguiente al de inicio (${startYear + 1})`
      });
      return;
    }

    const existingSeason = await prisma.season.findUnique({
      where: {
        year_start_year_end: {
          year_start: startYear,
          year_end: endYear
        }
      }
    });

    if (existingSeason) {
      res.status(400).json({
        error: `La temporada ${startYear}/${endYear} ya existe en la base de datos`
      });
      return;
    }

    if (champion_id && runner_up_id && Number(champion_id) === Number(runner_up_id)) {
      res.status(400).json({
        error: 'El club campeón y el subcampeón no pueden ser el mismo equipo'
      });
      return;
    }

    const resolvedFormat: TournamentFormat =
      format === TournamentFormat.SWISS_LEAGUE || (format === undefined && startYear >= 2024)
        ? TournamentFormat.SWISS_LEAGUE
        : TournamentFormat.CLASSIC_GROUPS;

    const resolvedTeamsCount = teams_count
      ? Number(teams_count)
      : resolvedFormat === TournamentFormat.SWISS_LEAGUE
      ? 36
      : 32;

    const phasesToCreate =
      resolvedFormat === TournamentFormat.SWISS_LEAGUE
        ? [
            { code: PhaseCode.LEAGUE_PHASE, name: 'Fase Liga - Sistema Suizo' },
            { code: PhaseCode.KNOCKOUT_PLAYOFFS, name: 'Play-offs Eliminatorios' },
            { code: PhaseCode.ROUND_OF_16, name: 'Octavos de Final' },
            { code: PhaseCode.QUARTER_FINALS, name: 'Cuartos de Final' },
            { code: PhaseCode.SEMI_FINALS, name: 'Semifinales' },
            { code: PhaseCode.FINAL, name: 'Final' }
          ]
        : [
            { code: PhaseCode.GROUP_STAGE, name: 'Fase de Grupos' },
            { code: PhaseCode.ROUND_OF_16, name: 'Octavos de Final' },
            { code: PhaseCode.QUARTER_FINALS, name: 'Cuartos de Final' },
            { code: PhaseCode.SEMI_FINALS, name: 'Semifinales' },
            { code: PhaseCode.FINAL, name: 'Final' }
          ];

    const createdSeason = await prisma.$transaction(async (tx) => {
      const season = await tx.season.create({
        data: {
          year_start: startYear,
          year_end: endYear,
          format: resolvedFormat,
          teams_count: resolvedTeamsCount,
          champion_id: champion_id ? Number(champion_id) : null,
          runner_up_id: runner_up_id ? Number(runner_up_id) : null,
          top_scorer_id: top_scorer_id ? Number(top_scorer_id) : null
        }
      });

      await tx.phase.createMany({
        data: phasesToCreate.map((p) => ({
          code: p.code,
          name: p.name,
          season_id: season.id
        }))
      });

      return tx.season.findUnique({
        where: { id: season.id },
        include: {
          champion: { select: { id: true, name: true, short_name: true, crest_url: true } },
          runner_up: { select: { id: true, name: true, short_name: true, crest_url: true } },
          top_scorer: { select: { id: true, first_name: true, last_name: true, photo_url: true } },
          phases: { orderBy: { id: 'asc' } }
        }
      });
    });

    await clearCache();

    res.status(201).json({
      message: `Temporada ${startYear}/${endYear} y sus ${phasesToCreate.length} fases oficiales creadas exitosamente`,
      data: createdSeason
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la temporada y sus fases' });
  }
});

/**
 * 4. PUT /api/v1/seasons/:id (Protegido con JWT)
 * Actualiza campeón, subcampeón y máximo goleador de una temporada existente
 */
router.put('/seasons/:id', requireAdminJWT, async (req: Request, res: Response) => {
  try {
    const seasonId = Number(req.params.id);
    const { champion_id, runner_up_id, top_scorer_id } = req.body;

    const existingSeason = await prisma.season.findUnique({ where: { id: seasonId } });
    if (!existingSeason) {
      res.status(404).json({ error: 'Temporada no encontrada' });
      return;
    }

    const nextChampionId =
      champion_id !== undefined ? (champion_id ? Number(champion_id) : null) : existingSeason.champion_id;
    const nextRunnerUpId =
      runner_up_id !== undefined ? (runner_up_id ? Number(runner_up_id) : null) : existingSeason.runner_up_id;

    if (nextChampionId && nextRunnerUpId && nextChampionId === nextRunnerUpId) {
      res.status(400).json({ error: 'El club campeón y el subcampeón deben ser clubes distintos' });
      return;
    }

    const updatedSeason = await prisma.season.update({
      where: { id: seasonId },
      data: {
        ...(champion_id !== undefined && { champion_id: champion_id ? Number(champion_id) : null }),
        ...(runner_up_id !== undefined && { runner_up_id: runner_up_id ? Number(runner_up_id) : null }),
        ...(top_scorer_id !== undefined && { top_scorer_id: top_scorer_id ? Number(top_scorer_id) : null })
      },
      include: {
        champion: { select: { id: true, name: true, short_name: true, crest_url: true } },
        runner_up: { select: { id: true, name: true, short_name: true, crest_url: true } },
        top_scorer: { select: { id: true, first_name: true, last_name: true, photo_url: true } },
        phases: { orderBy: { id: 'asc' } }
      }
    });

    await clearCache();

    res.json({
      message: `Cuadro de honor de la temporada ${updatedSeason.year_start}/${updatedSeason.year_end} actualizado con éxito`,
      data: updatedSeason
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la temporada' });
  }
});

/**
 * 5. POST /api/v1/squads (Protegido con JWT)
 * Asigna un jugador a la plantilla de un club en una temporada con su dorsal y rol (STARTER, SUBSTITUTE, RESERVE)
 */
router.post('/squads', requireAdminJWT, async (req: Request, res: Response) => {
  try {
    const { club_id, player_id, season_id, shirt_number, role = 'STARTER' } = req.body;

    if (!club_id || !player_id) {
      res.status(400).json({ error: 'Debes seleccionar tanto el club como el jugador' });
      return;
    }

    const validRole: SquadRole = Object.values(SquadRole).includes(role as SquadRole)
      ? (role as SquadRole)
      : SquadRole.STARTER;

    const [club, player, season] = await Promise.all([
      prisma.club.findUnique({ where: { id: Number(club_id) } }),
      prisma.player.findUnique({ where: { id: Number(player_id) } }),
      season_id ? prisma.season.findUnique({ where: { id: Number(season_id) } }) : Promise.resolve(null)
    ]);

    if (!club || !player) {
      res.status(404).json({ error: 'El club o el jugador seleccionado no existe' });
      return;
    }

    if (season_id && !season) {
      res.status(404).json({ error: 'La temporada seleccionada no existe' });
      return;
    }

    const existingMember = await prisma.squadMember.findFirst({
      where: {
        club_id: Number(club_id),
        player_id: Number(player_id),
        season_id: season_id ? Number(season_id) : null
      }
    });

    if (existingMember) {
      res.status(400).json({
        error: `${player.first_name} ${player.last_name} ya forma parte de la plantilla de ${club.name} en esa temporada`
      });
      return;
    }

    const newSquadMember = await prisma.squadMember.create({
      data: {
        club_id: Number(club_id),
        player_id: Number(player_id),
        season_id: season_id ? Number(season_id) : null,
        shirt_number: shirt_number ? Number(shirt_number) : null,
        role: validRole
      },
      include: {
        club: { select: { id: true, name: true, short_name: true, crest_url: true } },
        player: { select: { id: true, first_name: true, last_name: true, position: true, photo_url: true } },
        season: { select: { id: true, year_start: true, year_end: true } }
      }
    });

    await clearCache();

    res.status(201).json({
      message: `${player.first_name} ${player.last_name} asignado a ${club.name} (${validRole})`,
      data: newSquadMember
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el jugador en la plantilla' });
  }
});

/**
 * 5.1 PUT /api/v1/squads/:id (Protegido con JWT)
 * Permite cambiar el rol (STARTER / SUBSTITUTE / RESERVE) o el dorsal de un jugador en la plantilla
 */
router.put('/squads/:id', requireAdminJWT, async (req: Request, res: Response) => {
  try {
    const squadId = Number(req.params.id);
    const { role, shirt_number } = req.body;

    const existing = await prisma.squadMember.findUnique({ where: { id: squadId } });
    if (!existing) {
      res.status(404).json({ error: 'Registro de plantilla no encontrado' });
      return;
    }

    const updated = await prisma.squadMember.update({
      where: { id: squadId },
      data: {
        ...(role && Object.values(SquadRole).includes(role as SquadRole) && { role: role as SquadRole }),
        ...(shirt_number !== undefined && { shirt_number: shirt_number ? Number(shirt_number) : null })
      },
      include: {
        club: { select: { id: true, name: true, short_name: true, crest_url: true } },
        player: { select: { id: true, first_name: true, last_name: true, position: true, photo_url: true } },
        season: { select: { id: true, year_start: true, year_end: true } }
      }
    });

    await clearCache();

    res.json({
      message: `Rol de ${updated.player.first_name} ${updated.player.last_name} actualizado a ${updated.role}`,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el miembro de la plantilla' });
  }
});

/**
 * 5.2 DELETE /api/v1/squads/:id (Protegido con JWT)
 * Quita a un jugador de la plantilla
 */
router.delete('/squads/:id', requireAdminJWT, async (req: Request, res: Response) => {
  try {
    const squadId = Number(req.params.id);
    const existing = await prisma.squadMember.findUnique({ where: { id: squadId } });
    if (!existing) {
      res.status(404).json({ error: 'Registro de plantilla no encontrado' });
      return;
    }

    await prisma.squadMember.delete({ where: { id: squadId } });
    await clearCache();

    res.json({ message: 'Jugador retirado de la plantilla correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el jugador de la plantilla' });
  }
});

/**
 * 6. POST /api/v1/matches (Protegido con JWT)
 * Registra un nuevo partido con soporte de estado de suspensión/aplazamiento
 * Y permite guardar múltiples incidencias (events) en una sola transacción atómica
 */
router.post('/matches', requireAdminJWT, async (req: Request, res: Response) => {
  try {
    const {
      season_id,
      phase_id,
      matchday,
      group_name,
      home_team_id,
      away_team_id,
      home_score = 0,
      away_score = 0,
      match_date,
      stadium,
      status = 'FINISHED',
      suspended_at,
      suspended_minute,
      resumed_at,
      suspension_reason,
      events = []
    } = req.body;

    if (Number(home_team_id) === Number(away_team_id)) {
      res.status(400).json({ error: 'El club local y el club visitante deben ser diferentes' });
      return;
    }

    const [season, phase, homeTeam, awayTeam] = await Promise.all([
      prisma.season.findUnique({ where: { id: Number(season_id) } }),
      prisma.phase.findUnique({ where: { id: Number(phase_id) } }),
      prisma.club.findUnique({ where: { id: Number(home_team_id) } }),
      prisma.club.findUnique({ where: { id: Number(away_team_id) } })
    ]);

    const missing: string[] = [];
    if (!season) missing.push(`season_id (${season_id})`);
    if (!phase) missing.push(`phase_id (${phase_id})`);
    if (!homeTeam) missing.push(`home_team_id (${home_team_id})`);
    if (!awayTeam) missing.push(`away_team_id (${away_team_id})`);

    if (missing.length > 0) {
      res.status(404).json({
        error: `No se encontraron los siguientes registros en la base de datos: ${missing.join(', ')}`
      });
      return;
    }

    if (phase!.season_id !== season!.id) {
      res.status(400).json({
        error: `La fase "${phase!.name}" no pertenece a la temporada ${season!.year_start}/${season!.year_end}`
      });
      return;
    }

    const cleanGroup = group_name && String(group_name).trim() !== '' ? String(group_name).trim() : null;

    if (season!.format === 'SWISS_LEAGUE' && cleanGroup) {
      res.status(400).json({
        error: 'Las temporadas con formato SWISS_LEAGUE (36 clubes) son de tabla única y no usan group_name'
      });
      return;
    }

    const validStatus: MatchStatus = Object.values(MatchStatus).includes(status as MatchStatus)
      ? (status as MatchStatus)
      : MatchStatus.FINISHED;

    const validEvents: Array<{
      player_id: number;
      type: EventType;
      minute: number;
      extra_minute: number | null;
      detail: string | null;
    }> = [];

    if (Array.isArray(events)) {
      for (const ev of events) {
        if (!ev.player_id || !ev.type || !ev.minute) continue;
        // Compatibilidad si alguien envía 'PENALTY' en vez de 'PENALTY_GOAL'
        const normalizedType = ev.type === 'PENALTY' ? 'PENALTY_GOAL' : ev.type;
        if (!Object.values(EventType).includes(normalizedType as EventType)) {
          res.status(400).json({
            error: `Tipo de evento inválido: ${ev.type}. Valores permitidos: ${Object.values(EventType).join(', ')}`
          });
          return;
        }
        validEvents.push({
          player_id: Number(ev.player_id),
          type: normalizedType as EventType,
          minute: Number(ev.minute),
          extra_minute: ev.extra_minute ? Number(ev.extra_minute) : null,
          detail: ev.detail && String(ev.detail).trim() !== '' ? String(ev.detail).trim() : null
        });
      }
    }

    const createdMatch = await prisma.$transaction(async (tx) => {
      const match = await tx.match.create({
        data: {
          season_id: Number(season_id),
          phase_id: Number(phase_id),
          matchday: matchday ? Number(matchday) : null,
          group_name: cleanGroup,
          home_team_id: Number(home_team_id),
          away_team_id: Number(away_team_id),
          home_score: Math.max(0, Number(home_score) || 0),
          away_score: Math.max(0, Number(away_score) || 0),
          match_date: new Date(match_date),
          stadium: String(stadium || homeTeam!.stadium).trim(),
          status: validStatus,
          suspended_at: suspended_at ? new Date(suspended_at) : null,
          suspended_minute: suspended_minute ? Number(suspended_minute) : null,
          resumed_at: resumed_at ? new Date(resumed_at) : null,
          suspension_reason:
            suspension_reason && String(suspension_reason).trim() !== ''
              ? String(suspension_reason).trim()
              : null
        }
      });

      for (const ev of validEvents) {
        await tx.matchEvent.create({
          data: {
            match_id: match.id,
            player_id: ev.player_id,
            type: ev.type,
            minute: ev.minute,
            extra_minute: ev.extra_minute,
            detail: ev.detail
          }
        });

        // Si es gol de jugada o gol de penal, suma +1 a los goles históricos del jugador
        if (ev.type === EventType.GOAL || ev.type === EventType.PENALTY_GOAL) {
          await tx.player.update({
            where: { id: ev.player_id },
            data: {
              total_goals: { increment: 1 }
            }
          });
        }
      }

      return tx.match.findUnique({
        where: { id: match.id },
        include: {
          season: { select: { year_start: true, year_end: true } },
          home_team: { select: { id: true, name: true, short_name: true, crest_url: true } },
          away_team: { select: { id: true, name: true, short_name: true, crest_url: true } },
          phase: { select: { name: true, code: true } },
          events: {
            orderBy: [{ minute: 'asc' }, { extra_minute: 'asc' }],
            include: {
              player: { select: { id: true, first_name: true, last_name: true, photo_url: true } }
            }
          }
        }
      });
    });

    await clearCache();

    res.status(201).json({
      message:
        validEvents.length > 0
          ? `Partido registrado con ${validEvents.length} incidencia(s) en transacción`
          : 'Partido registrado exitosamente',
      data: createdMatch
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el partido' });
  }
});

/**
 * 7. POST /api/v1/matches/:id/events (Protegido con JWT)
 * Registra una incidencia individual sobre un partido existente en transacción
 */
router.post('/matches/:id/events', requireAdminJWT, async (req: Request, res: Response) => {
  try {
    const matchId = Number(req.params.id);
    const { player_id, type, minute, extra_minute, detail } = req.body;

    const normalizedType = type === 'PENALTY' ? 'PENALTY_GOAL' : type;

    if (!Object.values(EventType).includes(normalizedType as EventType)) {
      res.status(400).json({
        error: `Tipo de evento inválido. Valores permitidos: ${Object.values(EventType).join(', ')}`
      });
      return;
    }

    const [match, player] = await Promise.all([
      prisma.match.findUnique({ where: { id: matchId } }),
      prisma.player.findUnique({ where: { id: Number(player_id) } })
    ]);

    if (!match || !player) {
      res.status(404).json({ error: 'El partido o el jugador no existen' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.matchEvent.create({
        data: {
          match_id: matchId,
          player_id: Number(player_id),
          type: normalizedType as EventType,
          minute: Number(minute),
          extra_minute: extra_minute ? Number(extra_minute) : null,
          detail: detail && String(detail).trim() !== '' ? String(detail).trim() : null
        },
        include: {
          player: { select: { id: true, first_name: true, last_name: true, photo_url: true } }
        }
      });

      let updatedPlayer = player;
      if (normalizedType === EventType.GOAL || normalizedType === EventType.PENALTY_GOAL) {
        updatedPlayer = await tx.player.update({
          where: { id: Number(player_id) },
          data: {
            total_goals: { increment: 1 }
          }
        });
      }

      return { event, updatedPlayer };
    });

    await clearCache();

    res.status(201).json({
      message: 'Incidencia registrada y estadísticas actualizadas mediante transacción',
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el evento del partido' });
  }
});

export default router;
