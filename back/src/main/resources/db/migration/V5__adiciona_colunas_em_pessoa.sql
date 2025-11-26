-- V5: Adiciona colunas na entidade pessoa

-- 1) Adicionar coluna senha (<=8) em pessoa
ALTER TABLE IF EXISTS presente_sh.pessoa
    ADD COLUMN IF NOT EXISTS endereco VARCHAR(254),
    add column if not exists complemento varchar(254),
    add column if not exists cidade varchar(100),
    add column if not exists estado varchar(2),
    add column if not exists cep varchar(8)
;

