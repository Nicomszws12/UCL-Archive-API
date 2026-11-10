import { PrismaClient, TournamentFormat, PhaseCode, EventType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga de datos históricos de la Champions League...');

  // 1. Limpiamos datos previos (en orden inverso para respetar relaciones)
  await prisma.matchEvent.deleteMany();
  await prisma.match.deleteMany();
  await prisma.squadMember.deleteMany();
  await prisma.phase.deleteMany();
  await prisma.season.deleteMany();
  await prisma.player.deleteMany();
  await prisma.club.deleteMany();

  // 2. Creamos Clubes Históricos
  const realMadrid = await prisma.club.create({
    data: { name: 'Real Madrid CF', short_name: 'RMA', country_code: 'ESP', stadium: 'Santiago Bernabéu', titles_count: 15 }
  });
  const dortmund = await prisma.club.create({
    data: { name: 'Borussia Dortmund', short_name: 'BVB', country_code: 'GER', stadium: 'Signal Iduna Park', titles_count: 1 }
  });
  const barcelona = await prisma.club.create({
    data: { name: 'FC Barcelona', short_name: 'FCB', country_code: 'ESP', stadium: 'Spotify Camp Nou', titles_count: 5 }
  });
  const bayern = await prisma.club.create({
    data: { name: 'FC Bayern München', short_name: 'BAY', country_code: 'GER', stadium: 'Allianz Arena', titles_count: 6 }
  });
  const psg = await prisma.club.create({
    data: { name: 'Paris Saint-Germain', short_name: 'PSG', country_code: 'FRA', stadium: 'Parc des Princes', titles_count: 1 }
  });
  const inter = await prisma.club.create({
    data: { name: 'FC Internazionale Milano', short_name: 'INT', country_code: 'ITA', stadium: 'San Siro', titles_count: 3 }
  });

  // 3. Creamos Jugadores Históricos y Actuales
  const cristiano = await prisma.player.create({
    data: { first_name: 'Cristiano', last_name: 'Ronaldo', nationality: 'POR', position: 'Forward', active: false, total_goals: 140, total_appearances: 183 }
  });
  const messi = await prisma.player.create({
    data: { first_name: 'Lionel', last_name: 'Messi', nationality: 'ARG', position: 'Forward', active: false, total_goals: 129, total_appearances: 163 }
  });
  const lewandowski = await prisma.player.create({
    data: { first_name: 'Robert', last_name: 'Lewandowski', nationality: 'POL', position: 'Forward', active: true, total_goals: 105, total_appearances: 128 }
  });
  const mbappe = await prisma.player.create({
    data: { first_name: 'Kylian', last_name: 'Mbappé', nationality: 'FRA', position: 'Forward', active: true, total_goals: 55, total_appearances: 82 }
  });
  const vinicius = await prisma.player.create({
    data: { first_name: 'Vinícius', last_name: 'Júnior', nationality: 'BRA', position: 'Forward', active: true, total_goals: 28, total_appearances: 62 }
  });
  const kane = await prisma.player.create({
    data: { first_name: 'Harry', last_name: 'Kane', nationality: 'ENG', position: 'Forward', active: true, total_goals: 39, total_appearances: 52 }
  });

  // 4. Temporada 2023/2024 (Última con Formato Clásico de 32 equipos)
  const season2324 = await prisma.season.create({
    data: {
      year_start: 2023,
      year_end: 2024,
      format: TournamentFormat.CLASSIC_GROUPS,
      teams_count: 32,
      champion_id: realMadrid.id,
      runner_up_id: dortmund.id,
      top_scorer_id: kane.id
    }
  });

  // Fase Final 2023/2024
  const finalPhase2324 = await prisma.phase.create({
    data: {
      code: PhaseCode.FINAL,
      name: 'Final',
      season_id: season2324.id
    }
  });

  // Partido de la Final 2023/2024: Dortmund 0 - 2 Real Madrid
  const matchFinal2324 = await prisma.match.create({
    data: {
      season_id: season2324.id,
      phase_id: finalPhase2324.id,
      home_team_id: dortmund.id,
      away_team_id: realMadrid.id,
      home_score: 0,
      away_score: 2,
      match_date: new Date('2024-06-01T19:00:00Z'),
      stadium: 'Wembley Stadium'
    }
  });

  // Evento de gol en la Final 2023/2024
  await prisma.matchEvent.create({
    data: {
      match_id: matchFinal2324.id,
      player_id: vinicius.id,
      type: EventType.GOAL,
      minute: 83
    }
  });

  // 5. Temporada 2024/2025 (NUEVO FORMATO: Sistema Suizo de 36 clubes)
  const season2425 = await prisma.season.create({
    data: {
      year_start: 2024,
      year_end: 2025,
      format: TournamentFormat.SWISS_LEAGUE,
      teams_count: 36,
      champion_id: psg.id,
      runner_up_id: inter.id,
      top_scorer_id: kane.id
    }
  });

  // Fases del nuevo formato 2024/25
  const leaguePhase2425 = await prisma.phase.create({
    data: {
      code: PhaseCode.LEAGUE_PHASE,
      name: 'Fase Liga (Sistema Suizo)',
      season_id: season2425.id
    }
  });

  const playoffsPhase2425 = await prisma.phase.create({
    data: {
      code: PhaseCode.KNOCKOUT_PLAYOFFS,
      name: 'Play-offs Eliminatorios',
      season_id: season2425.id
    }
  });

  // Partido de la Fase Liga 2024/25 (Jornada 3, sin grupo porque es tabla única)
  const matchSwiss2425 = await prisma.match.create({
    data: {
      season_id: season2425.id,
      phase_id: leaguePhase2425.id,
      matchday: 3,
      group_name: null, // Tabla única de 36 equipos
      home_team_id: barcelona.id,
      away_team_id: bayern.id,
      home_score: 4,
      away_score: 1,
      match_date: new Date('2024-10-23T19:00:00Z'),
      stadium: 'Estadi Olímpic Lluís Companys'
    }
  });

  await prisma.matchEvent.create({
    data: {
      match_id: matchSwiss2425.id,
      player_id: lewandowski.id,
      type: EventType.GOAL,
      minute: 36
    }
  });

  // Partido clásico adicional entre Real Madrid y Bayern para probar Head-to-Head
  const semiPhase2324 = await prisma.phase.create({
    data: {
      code: PhaseCode.SEMI_FINALS,
      name: 'Semifinales',
      season_id: season2324.id
    }
  });

  await prisma.match.create({
    data: {
      season_id: season2324.id,
      phase_id: semiPhase2324.id,
      home_team_id: realMadrid.id,
      away_team_id: bayern.id,
      home_score: 2,
      away_score: 1,
      match_date: new Date('2024-05-08T19:00:00Z'),
      stadium: 'Santiago Bernabéu'
    }
  });

  console.log('¡Datos cargados con éxito!');
}

main()
  .catch((e) => {
    console.error('Error cargando datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });