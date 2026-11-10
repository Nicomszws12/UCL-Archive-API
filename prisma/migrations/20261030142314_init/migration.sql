-- CreateEnum
CREATE TYPE "TournamentFormat" AS ENUM ('CLASSIC_GROUPS', 'SWISS_LEAGUE');

-- CreateEnum
CREATE TYPE "PhaseCode" AS ENUM ('GROUP_STAGE', 'LEAGUE_PHASE', 'KNOCKOUT_PLAYOFFS', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('GOAL', 'PENALTY', 'ASSIST', 'YELLOW_CARD', 'RED_CARD');

-- CreateTable
CREATE TABLE "Season" (
    "id" SERIAL NOT NULL,
    "year_start" INTEGER NOT NULL,
    "year_end" INTEGER NOT NULL,
    "format" "TournamentFormat" NOT NULL DEFAULT 'CLASSIC_GROUPS',
    "teams_count" INTEGER NOT NULL DEFAULT 32,
    "champion_id" INTEGER,
    "runner_up_id" INTEGER,
    "top_scorer_id" INTEGER,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" SERIAL NOT NULL,
    "code" "PhaseCode" NOT NULL,
    "name" TEXT NOT NULL,
    "season_id" INTEGER NOT NULL,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "stadium" TEXT NOT NULL,
    "titles_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "total_goals" INTEGER NOT NULL DEFAULT 0,
    "total_appearances" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquadMember" (
    "id" SERIAL NOT NULL,
    "club_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "season_id" INTEGER,
    "shirt_number" INTEGER,

    CONSTRAINT "SquadMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "season_id" INTEGER NOT NULL,
    "phase_id" INTEGER NOT NULL,
    "matchday" INTEGER,
    "group_name" TEXT,
    "home_team_id" INTEGER NOT NULL,
    "away_team_id" INTEGER NOT NULL,
    "home_score" INTEGER NOT NULL DEFAULT 0,
    "away_score" INTEGER NOT NULL DEFAULT 0,
    "match_date" TIMESTAMP(3) NOT NULL,
    "stadium" TEXT NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchEvent" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "type" "EventType" NOT NULL,
    "minute" INTEGER NOT NULL,

    CONSTRAINT "MatchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Season_year_start_year_end_key" ON "Season"("year_start", "year_end");

-- CreateIndex
CREATE UNIQUE INDEX "Club_name_key" ON "Club"("name");

-- CreateIndex
CREATE INDEX "Match_match_date_idx" ON "Match"("match_date");

-- CreateIndex
CREATE INDEX "Match_season_id_idx" ON "Match"("season_id");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_champion_id_fkey" FOREIGN KEY ("champion_id") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_runner_up_id_fkey" FOREIGN KEY ("runner_up_id") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_top_scorer_id_fkey" FOREIGN KEY ("top_scorer_id") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadMember" ADD CONSTRAINT "SquadMember_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadMember" ADD CONSTRAINT "SquadMember_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadMember" ADD CONSTRAINT "SquadMember_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchEvent" ADD CONSTRAINT "MatchEvent_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchEvent" ADD CONSTRAINT "MatchEvent_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
