-- V6: adiciona coluna status em cliente

ALTER TABLE IF EXISTS evento_escolha
    ADD COLUMN IF NOT EXISTS status VARCHAR(32),
    ADD COLUMN IF NOT EXISTS alterado_em TIMESTAMP WITHOUT TIME ZONE;

-- Opcional: valor padrão inicial
UPDATE evento_escolha SET status = COALESCE(status, 'ATIVO');
