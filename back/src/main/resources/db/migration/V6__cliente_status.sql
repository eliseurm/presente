-- V6: adiciona coluna status em cliente

ALTER TABLE IF EXISTS presente_sh.cliente
    ADD COLUMN IF NOT EXISTS status VARCHAR(32);

-- Opcional: valor padrão inicial
UPDATE presente_sh.cliente SET status = COALESCE(status, 'ATIVO');
