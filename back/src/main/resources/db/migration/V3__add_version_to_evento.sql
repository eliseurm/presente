-- Adiciona coluna de version para controle de concorrência otimista na tabela evento
-- Considera que o schema padrão da aplicação é "presente_sh"

ALTER TABLE IF EXISTS presente_sh.evento
ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Inicializa valores nulos, caso existam
UPDATE presente_sh.evento SET version = COALESCE(version, 0);
