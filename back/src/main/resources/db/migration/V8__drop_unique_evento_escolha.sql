-- Remove qualquer unique constraint antiga em evento_escolha que impeça múltiplos históricos
-- (compatível com PostgreSQL)
DO $$
DECLARE
    cons record;
BEGIN
    FOR cons IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid AND rel.relname = 'evento_escolha'
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE con.contype = 'u'
    LOOP
        EXECUTE format('ALTER TABLE evento_escolha DROP CONSTRAINT IF EXISTS %I', cons.conname);
    END LOOP;
END $$;
