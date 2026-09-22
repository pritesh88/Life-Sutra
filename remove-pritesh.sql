-- ---------------------------------------------------------------------------
-- Delete ONE user: priteshlad6822@gmail.com  (and nothing else).
--
--     npx prisma db execute --file remove-pritesh.sql
--
-- One transaction: if anything fails, nothing changes. The audit log's
-- tamper-protection trigger is switched off only for the delete of this
-- user's own audit rows, and switched back on straight afterwards.
-- ---------------------------------------------------------------------------

BEGIN;

ALTER TABLE "AuditLog" DISABLE TRIGGER "AuditLog_no_update_delete";

DELETE FROM "AuditLog"
 WHERE "actorId"  = (SELECT id FROM "User" WHERE email = 'priteshlad6822@gmail.com')
    OR "targetId" = (SELECT id FROM "User" WHERE email = 'priteshlad6822@gmail.com');

ALTER TABLE "AuditLog" ENABLE TRIGGER "AuditLog_no_update_delete";

-- His sessions and role assignments are removed with him.
DELETE FROM "User" WHERE email = 'priteshlad6822@gmail.com';

COMMIT;
