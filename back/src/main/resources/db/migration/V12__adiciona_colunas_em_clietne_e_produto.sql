-- 1. MUDANÇA NA TABELA (Boolean -> Enum String)
-- Adiciona uma coluna temporária para evitar conflitos de tipo durante a transição
alter table produto add column status_new varchar(20);

-- Aplica a lógica: true -> ATIVO, false -> ENCERRADO
update produto set status_new = case when status = true then 'ATIVO' else 'ENCERRADO' end;

-- Remove a coluna booleana antiga e renomeia a nova
alter table produto drop column status;
alter table produto rename column status_new to status;

-- 2. MUDANÇA NA TABELA CLIENTE (String -> Enum String)
-- Adiciona a coluna temporária
alter table cliente add column status_new varchar(20);

update cliente set status_new = case
    when status in ('true', 'T', '1', 'A', 'ATIVO') then 'ATIVO'
    else 'ENCERRADO'
end;

-- Remove a coluna de string antiga e renomeia a nova
alter table cliente drop column status;
alter table cliente rename column status_new to status;
