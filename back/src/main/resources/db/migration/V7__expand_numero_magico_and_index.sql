-- Aumenta o tamanho da coluna numero_magico para armazenar o token completo (ex.: Maria_A1B2C3D4)
ALTER TABLE evento_pessoa
    ALTER COLUMN numero_magico TYPE varchar(64);

-- Índice para lookup rápido por token na validação pública
CREATE INDEX IF NOT EXISTS idx_evento_pessoa_numero_magico ON evento_pessoa (numero_magico);
