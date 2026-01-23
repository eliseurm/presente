DO $$
BEGIN
    -- Verifica se a tabela PRODUTO existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'produto' ) THEN

        -- Adiciona coluna temporária se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'produto' AND column_name = 'status_new') THEN
            ALTER TABLE presente_sh.produto ADD COLUMN status_new VARCHAR(20);
        END IF;

        -- Atualiza somente se a coluna antiga existir
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'produto' AND column_name = 'status') THEN
            UPDATE presente_sh.produto SET status_new = CASE WHEN status::text IN ('true', 't', '1') THEN 'ATIVO' ELSE 'ENCERRADO' END;
            -- Remove coluna antiga
            ALTER TABLE presente_sh.produto DROP COLUMN status;
            ALTER TABLE presente_sh.produto RENAME COLUMN status_new TO status;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cliente') THEN

        -- Adiciona coluna temporária se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cliente' AND column_name = 'status_new') THEN
            ALTER TABLE presente_sh.cliente ADD COLUMN status_new VARCHAR(20);
        END IF;

        -- Atualiza somente se a coluna antiga existir
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cliente' AND column_name = 'status') THEN
            UPDATE presente_sh.cliente SET status_new = CASE WHEN UPPER(status) IN ('TRUE', 'T', '1', 'A', 'ATIVO') THEN 'ATIVO' ELSE 'ENCERRADO' END;

            ALTER TABLE presente_sh.cliente DROP COLUMN status;
            ALTER TABLE presente_sh.cliente RENAME COLUMN status_new TO status;
        END IF;
    END IF;

END $$;


