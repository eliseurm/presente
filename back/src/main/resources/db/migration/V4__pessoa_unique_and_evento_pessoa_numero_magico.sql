-- V4: Constraints, normalização de dados e novas colunas

-- 1) Adicionar coluna senha (<=8) em pessoa
ALTER TABLE IF EXISTS presente_sh.pessoa
    ADD COLUMN IF NOT EXISTS senha VARCHAR(8),
    ADD COLUMN IF NOT EXISTS cpf VARCHAR(11);

-- 2) Normalizar dados existentes para permitir criação de índices únicos
-- 2.1) Normalizar email: trim + lower
UPDATE presente_sh.pessoa
SET email = NULLIF(lower(trim(email)), '')
WHERE email IS NOT NULL;

-- 2.2) Normalizar telefone: remover tudo que não é dígito ou '+', e trim
UPDATE presente_sh.pessoa
SET telefone = NULLIF(trim(regexp_replace(telefone, '[^0-9+]', '', 'g')), '')
WHERE telefone IS NOT NULL;

-- 2.3) Deduplicar emails mantendo o menor id e anulando os demais
WITH normalized AS (
    SELECT id, lower(email) AS em
    FROM presente_sh.pessoa
    WHERE email IS NOT NULL
), dups AS (
    SELECT em, MIN(id) AS keep_id
    FROM normalized
    GROUP BY em
    HAVING COUNT(*) > 1
)
UPDATE presente_sh.pessoa p
SET email = NULL
FROM dups d
WHERE lower(p.email) = d.em AND p.id <> d.keep_id;

-- 2.4) Deduplicar telefones mantendo o menor id e anulando os demais
WITH normalized_t AS (
    SELECT id, trim(regexp_replace(telefone, '[^0-9+]', '', 'g')) AS tel
    FROM presente_sh.pessoa
    WHERE telefone IS NOT NULL
), dups_t AS (
    SELECT tel, MIN(id) AS keep_id
    FROM normalized_t
    GROUP BY tel
    HAVING COUNT(*) > 1
)
UPDATE presente_sh.pessoa p
SET telefone = NULL
FROM dups_t d
WHERE trim(regexp_replace(p.telefone, '[^0-9+]', '', 'g')) = d.tel AND p.id <> d.keep_id;

-- 3) Criar índices únicos (parciais) para garantir unicidade daqui em diante
--    Email: case-insensitive (lower(email)), ignorando valores NULL
CREATE UNIQUE INDEX IF NOT EXISTS uq_pessoa_email
    ON presente_sh.pessoa (lower(email))
    WHERE email IS NOT NULL;

--    Telefone: já normalizado, ignorando valores NULL
CREATE UNIQUE INDEX IF NOT EXISTS uq_pessoa_telefone
    ON presente_sh.pessoa (telefone)
    WHERE telefone IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_pessoa_cpf
    ON presente_sh.pessoa (cpf)
    WHERE cpf IS NOT NULL;

-- 4) Adicionar numero_magico em evento_pessoa (<=8)
ALTER TABLE IF EXISTS presente_sh.evento_pessoa
    ADD COLUMN IF NOT EXISTS numero_magico VARCHAR(8);
