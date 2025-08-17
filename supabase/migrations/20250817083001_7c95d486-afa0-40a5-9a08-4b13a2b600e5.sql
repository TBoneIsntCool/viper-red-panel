BEGIN;
-- Data minimization: remove sensitive token columns no longer used
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS access_token,
  DROP COLUMN IF EXISTS refresh_token;
COMMIT;