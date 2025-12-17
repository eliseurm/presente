-- Cria a coluna
ALTER TABLE IF EXISTS presente_sh.pessoa
    ADD COLUMN IF NOT EXISTS cliente_id BIGINT,
    ADD COLUMN IF NOT EXISTS cpf VARCHAR(11)
;

-- Seta valor para registros já existentes
UPDATE presente_sh.pessoa
SET cliente_id = 1
WHERE cliente_id IS NULL;

-- Cria a foreign key
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pessoa_cliente') THEN
        ALTER TABLE presente_sh.pessoa
            ADD CONSTRAINT fk_pessoa_cliente
            FOREIGN KEY (cliente_id)
            REFERENCES presente_sh.cliente (id)
            ON UPDATE RESTRICT ON DELETE SET NULL;
    END IF;
END $$;

-- Cria índice (boa prática)
CREATE INDEX IF NOT EXISTS idx_pessoa_cliente
    ON presente_sh.pessoa (cliente_id);
