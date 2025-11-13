-- Adiciona coluna de version para controle de concorrência otimista na tabela tamanho
-- Considera que o schema padrão da aplicação é "presente_sh"

ALTER TABLE IF EXISTS presente_sh.tamanho
ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Opcionalmente, garantir valores iniciais coerentes
UPDATE presente_sh.tamanho SET version = COALESCE(version, 0);
