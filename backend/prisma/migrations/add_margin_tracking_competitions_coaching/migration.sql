-- AlterTable: Add margin tracking columns to sale_items
ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "cost_price" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "margin_amount" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "margin_percentage" DECIMAL(5,2);

-- AlterTable: Add margin tracking columns to daily_performance
ALTER TABLE "daily_performance" ADD COLUMN IF NOT EXISTS "total_margin" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "margin_percentage" DECIMAL(5,2) DEFAULT 0;

-- CreateEnum: Competition Types
CREATE TYPE "competition_type" AS ENUM ('POWER_HOUR', 'DAILY_BLITZ', 'BRACKET', 'TEAM_CHALLENGE', 'STREAK');

-- CreateEnum: Competition Status
CREATE TYPE "competition_status" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum: Competition Metrics
CREATE TYPE "competition_metric" AS ENUM ('TOTAL_SALES', 'FCP_PERCENTAGE', 'TRANSACTION_COUNT', 'AVERAGE_SALE', 'GROSS_MARGIN', 'SALES_PER_HOUR');

-- CreateEnum: Coaching Triggers
CREATE TYPE "coaching_trigger" AS ENUM ('PERFORMANCE_DROP', 'BELOW_GOAL', 'LOW_FCP_RATE', 'LOW_CONVERSION', 'MANUAL');

-- CreateEnum: Coaching Status
CREATE TYPE "coaching_status" AS ENUM ('RECOMMENDED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED');

-- CreateTable: competitions
CREATE TABLE "competitions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "competition_type" NOT NULL,
    "metric" "competition_metric" NOT NULL,
    "status" "competition_status" NOT NULL DEFAULT 'SCHEDULED',
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "prize_description" TEXT,
    "rules" JSONB NOT NULL DEFAULT '{}',
    "location_ids" TEXT[],
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "competitions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: competition_participants
CREATE TABLE "competition_participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competition_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "enrolled" BOOLEAN NOT NULL DEFAULT true,
    "current_score" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "final_rank" INTEGER,
    "prize_won" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "competition_participants_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: competition_leaderboard
CREATE TABLE "competition_leaderboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competition_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" DECIMAL(10,2) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "competition_leaderboard_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: coaching_playbooks
CREATE TABLE "coaching_playbooks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "manager_id" TEXT,
    "trigger" "coaching_trigger" NOT NULL,
    "status" "coaching_status" NOT NULL DEFAULT 'RECOMMENDED',
    "priority" SMALLINT NOT NULL DEFAULT 5,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "diagnosis_data" JSONB NOT NULL,
    "recommended_actions" JSONB NOT NULL,
    "progress_notes" JSONB NOT NULL DEFAULT '[]',
    "due_date" DATE,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "coaching_playbooks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "competitions_organization_id_idx" ON "competitions"("organization_id");
CREATE INDEX "competitions_status_idx" ON "competitions"("status");
CREATE INDEX "competitions_start_time_end_time_idx" ON "competitions"("start_time", "end_time");

CREATE UNIQUE INDEX "competition_participants_competition_id_user_id_key" ON "competition_participants"("competition_id", "user_id");
CREATE INDEX "competition_participants_competition_id_idx" ON "competition_participants"("competition_id");
CREATE INDEX "competition_participants_user_id_idx" ON "competition_participants"("user_id");

CREATE INDEX "competition_leaderboard_competition_id_rank_idx" ON "competition_leaderboard"("competition_id", "rank");
CREATE INDEX "competition_leaderboard_competition_id_user_id_idx" ON "competition_leaderboard"("competition_id", "user_id");

CREATE INDEX "coaching_playbooks_organization_id_idx" ON "coaching_playbooks"("organization_id");
CREATE INDEX "coaching_playbooks_user_id_idx" ON "coaching_playbooks"("user_id");
CREATE INDEX "coaching_playbooks_manager_id_idx" ON "coaching_playbooks"("manager_id");
CREATE INDEX "coaching_playbooks_status_idx" ON "coaching_playbooks"("status");
CREATE INDEX "coaching_playbooks_trigger_idx" ON "coaching_playbooks"("trigger");
CREATE INDEX "coaching_playbooks_priority_idx" ON "coaching_playbooks"("priority");
