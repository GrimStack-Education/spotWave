DO $$
BEGIN
  IF to_regclass('"Event"') IS NOT NULL THEN
    ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "communityId" TEXT;

    CREATE INDEX IF NOT EXISTS "Event_communityId_startsAt_idx" ON "Event"("communityId", "startsAt");

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'Event_communityId_fkey'
    ) THEN
      ALTER TABLE "Event"
        ADD CONSTRAINT "Event_communityId_fkey"
        FOREIGN KEY ("communityId") REFERENCES "Community"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;
