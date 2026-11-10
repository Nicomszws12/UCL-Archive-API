import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { PhaseCode } from '@prisma/client';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

/**
 * 1. GET /api/v1/clubs
 * Lista todos los clubes ordenados alfabéticamente (incluye crest_url)
 */
router.get('/clubs', cacheMiddleware(60), async (_req: Request, res: Response) => {
  try {
    const clubs = await prisma.club.findMany({
      orderBy: { name: 'asc' }
    });

    res.json({
      count: clubs.length,
      data: clubs
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la lista de clubes' });
  }
});

/**
 * 2. GET /api/v1/players
 * Lista todos los jugadores ordenados por goles y apellido (incluye photo_url)
 */
router.get('/players', cacheMiddleware(60), async (_req: Request, res: Response) => {
  try {
    const players = await prisma.player.findMany({
      orderBy: [
        { total_goals: 'desc' },
        { last_name: 'asc' }
      ]
    });

    res.json({
      count: players.length,
      data: players
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la lista de jugadores' });
  }
});

/**
 * 3. GET /api/v1/squads
 * Explorador dinámico de plantillas (?season_id=X&club_id=Y)
 * Devuelve club (con crest_url), temporada y jugadores (con photo_url, dorsal, rol y posición)
 */
router.get('/squads', cacheMiddleware(60), async (req: Request, res: Response) => {
  try {
    const { season_id, club_id } = req.query;
    const where: any = {};

    if (season_id) where.season_id = Number(season_id);
    if (club_id) where.club_id = Number(club_id);

    const [squads, selectedClub, selectedSeason] = await Promise.all([
      prisma.squadMember.findMany({
        where,
        orderBy: [
          { role: 'asc' },
          { shirt_number: 'asc' },
          { id: 'asc' }
        ],
        include: {
          club: {
            select: {
              id: true,
              name: true,
              short_name: true,
              country_code: true,
              stadium: true,
              titles_count: true,
              crest_url: true
            }
          },
          player: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              position: true,
              nationality: true,
              active: true,
              total_goals: true,
              total_appearances: true,
              photo_url: true
            }
          },
          season: {
            select: {
              id: true,
              year_start: true,
              year_end: true,
              format: true,
              teams_count: true
            }
          }
        }
      }),
      club_id ? prisma.club.findUnique({ where: { id: Number(club_id) } }) : Promise.resolve(null),
      season_id ? prisma.season.findUnique({ where: { id: Number(season_id) } }) : Promise.resolve(null)
    ]);

    res.json({
      count: squads.length,
      club: selectedClub,
      season: selectedSeason,
      starters: squads.filter((s) => s.role === 'STARTER'),
      substitutes: squads.filter((s) => s.role === 'SUBSTITUTE'),
      reserves: squads.filter((s) => s.role === 'RESERVE'),
      data: squads
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las plantillas' });
  }
});

/**
 * 4. GET /api/v1/seasons
 * Lista todas las temporadas registradas (incluye crest_url y photo_url en cuadro de honor)
 */
router.get('/seasons', cacheMiddleware(60), async (req: Request, res: Response) => {
  try {
    const order = req.query.order === 'asc' ? 'asc' : 'desc';

    const seasons = await prisma.season.findMany({
      orderBy: { year_start: order },
      include: {
        champion: {
          select: { id: true, name: true, short_name: true, country_code: true, crest_url: true }
        },
        runner_up: {
          select: { id: true, name: true, short_name: true, country_code: true, crest_url: true }
        },
        top_scorer: {
          select: { id: true, first_name: true, last_name: true, nationality: true, total_goals: true, photo_url: true }
        },
        phases: { orderBy: { id: 'asc' } }
      }
    });

    res.json({
      count: seasons.length,
      data: seasons
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las temporadas' });
  }
});

/**
 * 5. GET /api/v1/seasons/:id/phases
 * Lista todas las fases de una temporada específica
 */
router.get('/seasons/:id/phases', cacheMiddleware(60), async (req: Request, res: Response) => {
  try {
    const seasonId = Number(req.params.id);

    const season = await prisma.season.findUnique({
      where: { id: seasonId }
    });

    if (!season) {
      res.status(404).json({ error: 'Temporada no encontrada' });
      return;
    }

    const phases = await prisma.phase.findMany({
      where: { season_id: seasonId },
      orderBy: { id: 'asc' }
    });

    res.json({
      season_id: seasonId,
      format: season.format,
      count: phases.length,
      data: phases
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las fases de la temporada' });
  }
});

/**
 * 6. GET /api/v1/seasons/:id/records
 * Resumen estadístico de una edición
 */
router.get('/seasons/:id/records', cacheMiddleware(60), async (req: Request, res: Response) => {
  try {
    const seasonId = Number(req.params.id);

    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        champion: true,
        runner_up: true,
        top_scorer: true,
        matches: true
      }
    });

    if (!season) {
      res.status(404).json({ error: 'Temporada no encontrada' });
      return;
    }

    const totalGoalsInMatches = season.matches.reduce(
      (sum, match) => sum + match.home_score + match.away_score,
      0
    );

    res.json({
      season: `${season.year_start}-${season.year_end}`,
      format: season.format,
      teams_count: season.teams_count,
      champion: season.champion?.name || 'Por definir',
      champion_crest_url: season.champion?.crest_url || null,
      runner_up: season.runner_up?.name || 'Por definir',
      runner_up_crest_url: season.runner_up?.crest_url || null,
      top_scorer: season.top_scorer
        ? `${season.top_scorer.first_name} ${season.top_scorer.last_name}`
        : 'Por definir',
      top_scorer_photo_url: season.top_scorer?.photo_url || null,
      stats: {
        matches_recorded: season.matches.length,
        total_goals: totalGoalsInMatches,
        goals_per_match:
          season.matches.length > 0
            ? Number((totalGoalsInMatches / season.matches.length).toFixed(2))
            : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular los récords de la temporada' });
  }
});

/**
 * 7. GET /api/v1/matches
 * Filtro avanzado y paginado de partidos (incluye crest_url, estado de suspensión y eventos con photo_url)
 */
router.get('/matches', cacheMiddleware(30), async (req: Request, res: Response) => {
  try {
    const { season, phase, team_id, matchday, status, page = '1', limit = '50' } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (season && typeof season === 'string') {
      const [start, end] = season.split('-').map(Number);
      if (start && end) {
        where.season = { year_start: start, year_end: end };
      }
    }

    if (phase && typeof phase === 'string') {
      const upperPhase = phase.toUpperCase();
      if (Object.values(PhaseCode).includes(upperPhase as PhaseCode)) {
        where.phase = { code: upperPhase as PhaseCode };
      } else {
        where.phase = { name: { contains: phase, mode: 'insensitive' } };
      }
    }

    if (team_id) {
      const teamIdNum = Number(team_id);
      where.OR = [{ home_team_id: teamIdNum }, { away_team_id: teamIdNum }];
    }

    if (matchday) {
      where.matchday = Number(matchday);
    }

    if (status && typeof status === 'string') {
      where.status = status.toUpperCase();
    }

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { match_date: 'desc' },
        include: {
          season: { select: { id: true, year_start: true, year_end: true, format: true } },
          phase: { select: { id: true, code: true, name: true } },
          home_team: { select: { id: true, name: true, short_name: true, country_code: true, crest_url: true } },
          away_team: { select: { id: true, name: true, short_name: true, country_code: true, crest_url: true } },
          events: {
            orderBy: [
              { minute: 'asc' },
              { extra_minute: 'asc' }
            ],
            include: {
              player: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  nationality: true,
                  position: true,
                  photo_url: true
                }
              }
            }
          }
        }
      }),
      prisma.match.count({ where })
    ]);

    res.json({
      pagination: {
        total_records: total,
        current_page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(total / limitNum)
      },
      data: matches
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al filtrar los partidos' });
  }
});

/**
 * 8. GET /api/v1/players/top-scorers
 * Ranking histórico de goleadores (?active_only=true&country=FRA) con photo_url
 */
router.get('/players/top-scorers', cacheMiddleware(60), async (req: Request, res: Response) => {
  try {
    const { active_only, country, limit = '20' } = req.query;

    const where: any = {};

    if (active_only === 'true') {
      where.active = true;
    }

    if (country && typeof country === 'string') {
      where.nationality = country.toUpperCase();
    }

    const players = await prisma.player.findMany({
      where,
      orderBy: [
        { total_goals: 'desc' },
        { total_appearances: 'asc' }
      ],
      take: Number(limit)
    });

    res.json({
      count: players.length,
      data: players
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el ranking de goleadores' });
  }
});

/**
 * 9. GET /api/v1/head-to-head
 * Historial directo entre dos clubes (?team1=1&team2=2) con crest_url
 */
router.get('/head-to-head', cacheMiddleware(60), async (req: Request, res: Response) => {
  try {
    const team1Id = Number(req.query.team1);
    const team2Id = Number(req.query.team2);

    if (!team1Id || !team2Id || team1Id === team2Id) {
      res.status(400).json({
        error: 'Debes enviar dos IDs de clubes distintos, por ejemplo: ?team1=1&team2=2'
      });
      return;
    }

    const [club1, club2, matches] = await Promise.all([
      prisma.club.findUnique({ where: { id: team1Id } }),
      prisma.club.findUnique({ where: { id: team2Id } }),
      prisma.match.findMany({
        where: {
          OR: [
            { home_team_id: team1Id, away_team_id: team2Id },
            { home_team_id: team2Id, away_team_id: team1Id }
          ]
        },
        orderBy: { match_date: 'desc' },
        include: {
          season: { select: { year_start: true, year_end: true } },
          phase: { select: { name: true } },
          home_team: { select: { id: true, name: true, short_name: true, crest_url: true } },
          away_team: { select: { id: true, name: true, short_name: true, crest_url: true } }
        }
      })
    ]);

    if (!club1 || !club2) {
      res.status(404).json({ error: 'Uno o ambos clubes no existen en la base de datos' });
      return;
    }

    let team1Wins = 0;
    let team2Wins = 0;
    let draws = 0;
    let team1Goals = 0;
    let team2Goals = 0;

    for (const m of matches) {
      const isTeam1Home = m.home_team_id === team1Id;
      const t1Score = isTeam1Home ? m.home_score : m.away_score;
      const t2Score = isTeam1Home ? m.away_score : m.home_score;

      team1Goals += t1Score;
      team2Goals += t2Score;

      if (t1Score > t2Score) team1Wins++;
      else if (t2Score > t1Score) team2Wins++;
      else draws++;
    }

    res.json({
      matchup: `${club1.name} vs ${club2.name}`,
      clubs: {
        team1: club1,
        team2: club2
      },
      summary: {
        total_matches: matches.length,
        [club1.short_name]: { wins: team1Wins, goals: team1Goals, crest_url: club1.crest_url },
        [club2.short_name]: { wins: team2Wins, goals: team2Goals, crest_url: club2.crest_url },
        draws
      },
      matches
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar el historial Head-to-Head' });
  }
});

export default router;
