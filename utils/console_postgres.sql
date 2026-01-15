
-- Primeiro conecte com o super usuario do banco u:'system', s:'sicsadm'
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'presente_db';
DROP DATABASE IF EXISTS presente_db;
DROP USER IF EXISTS presente_user;

CREATE USER presente_user WITH PASSWORD 'Presente_pwd#123';
CREATE DATABASE presente_db;
GRANT CREATE ON DATABASE presente_db TO presente_user;


-- Mude para presente_db mas ainda com superUsuario

DROP SCHEMA IF EXISTS presente_sh CASCADE;
CREATE SCHEMA IF NOT EXISTS presente_sh ;
GRANT USAGE ON SCHEMA presente_sh TO presente_user;
GRANT CREATE ON SCHEMA presente_sh TO presente_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA presente_sh GRANT ALL ON TABLES TO presente_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA presente_sh GRANT ALL ON SEQUENCES TO presente_user;



-- Agora mude de usuario e schema (presente_sh e presente_user)


CREATE TABLE IF NOT EXISTS presente_sh.usuario (
   id BIGSERIAL PRIMARY KEY,
   username VARCHAR(255) NOT NULL UNIQUE,
   password_hash TEXT NOT NULL,
   papel VARCHAR(64),
   status VARCHAR(64),
   criado_em TIMESTAMP,
   alterado_em TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_usuario_username ON presente_sh.usuario (username);



-- Tratar so de Shema ( superUsuario )
DROP SCHEMA IF EXISTS presente_sh CASCADE;
CREATE SCHEMA IF NOT EXISTS presente_sh AUTHORIZATION presente_user;
GRANT USAGE ON SCHEMA presente_sh TO presente_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA presente_sh GRANT ALL ON TABLES TO presente_user;
GRANT CREATE ON SCHEMA presente_sh TO presente_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA presente_sh GRANT USAGE ON SEQUENCES TO presente_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA presente_sh GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO presente_user;



-- Troca para usuario e shema (presente_user, presente_sh)

create table teste (
    codigo int,
    descricao varchar(50)
);



-- quem e dono do banco
SELECT d.datname AS database_name, pg_catalog.pg_get_userbyid(d.datdba) AS owner
FROM pg_catalog.pg_database d
-- WHERE d.datname = 'presente_db'
;

-- quem e dono do schema
SELECT n.nspname AS schema_name, pg_catalog.pg_get_userbyid(n.nspowner) AS owner
FROM pg_catalog.pg_namespace n
WHERE n.nspname = 'presente_sh'
;

-- tste de criacao de tabela
create table teste (id int, nome varchar(10));
select * from teste ;
drop table teste ;

-- 1. Veja quais processos estão ativos e "travados"
SELECT pid, query, state, wait_event_type, wait_event
FROM pg_stat_activity
WHERE query LIKE '%update%evento%' AND state != 'idle';
-- 2. Mate os processos que estão tentando atualizar a tabela (substitua o PID pelo número encontrado acima)
-- Repita para os PIDs que parecerem "presos"
SELECT pg_terminate_backend(96591);

-- Unique index da tabela
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'pessoa';

-- ##########################################################
select * from flyway_schema_history  ;

delete from flyway_schema_history where installed_rank >= 11 ;

INSERT INTO presente_sh.usuario (id, username, password_hash, papel, status, criado_em, alterado_em) VALUES (1, 'admin', '$2a$10$UX68K.ZTOT4YiWIDMRONXONP3mV9vyYdlKfT.a7hbk.0IkykAfvN2', 'ADMINISTRADOR', 'ATIVO', '2025-11-12 09:46:52.613582', '2025-11-12 09:46:52.613582');

select * from tamanho ;

select * from cor ;

select * from imagem ;

select * from produto ;
select * from produto_estoque ;

select * from usuario ;

SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE 1=1
and state != 'idle'
AND query ILIKE '%pessoa%'
AND pid <> pg_backend_pid();
REINDEX INDEX presente_sh.uq_pessoa_email;

select * from pessoa where id <= 10;

select telefone, count(*) from pessoa group by telefone having count(*) > 1;
reindex table presente_sh.pessoa;
-- delete from pessoa where id=10;

select * from cliente ;

select * from evento ;

select * from evento_pessoa where pessoa_id = 10;
select * from evento_pessoa where pessoa_id < 3;
select * from evento_produto ;
select * from evento_escolha ;

select * from chave_magica ;

select *
from evento e
join cliente c on e.cliente_id=c.id
;


select a from Evento a ;

select * from evento_pessoa where pessoa_id<=3 ;
delete from evento_pessoa where pessoa_id>=3 ;
select * from evento_produto ;
select * from evento_escolha ;

delete from evento_escolha;
delete from pessoa;
TRUNCATE TABLE evento_pessoa RESTART IDENTITY CASCADE;
TRUNCATE TABLE pessoa RESTART IDENTITY CASCADE;

ALTER TABLE pessoa DROP CONSTRAINT IF EXISTS uk_pessoa_cpf;
ALTER TABLE pessoa DROP CONSTRAINT IF EXISTS uk_pessoa_email;
ALTER TABLE pessoa DROP CONSTRAINT IF EXISTS uk_pessoa_telefone;

select
    e.nome as nomeEvento, e.descricao, e.status as statusEvento, e.inicio, e.fim_previsto, e.fim,
    p.nome as nomePessoa, p.email, p.telefone, p.cpf,
    p.endereco, p.complemento, p.cidade, p.estado, p.cep,
    ep.status as statusEventoPessoa, ep.numero_magico, ep.organo_nivel_1, ep.organo_nivel_2, ep.organo_nivel_3, ep.localtrabalho,
    case when es.id is not null then true else false end as jaEscolheu,
    es.dt_escolha, prd.nome as nomeProduto, prd.preco, tam.tipo, tam.tamanho, cor.nome as cor
from evento e
join evento_pessoa ep on e.id = ep.evento_id
join pessoa p on ep.pessoa_id = p.id
left join evento_escolha es on e.id = es.evento_id and ep.pessoa_id = es.pessoa_id
    and es.status = 'ATIVO'
    and es.dt_escolha = (select max(sub.dt_escolha) from evento_escolha sub where sub.evento_id = e.id and sub.pessoa_id = ep.pessoa_id and sub.status = 'ATIVO')
left join produto prd on es.produto_id = prd.id
left join tamanho tam on es.tamanho_id = tam.id
left join cor cor on es.cor_id = cor.id
where 1=1
and e.id = 2
and ( :jaEscolheuParam = -1 or (case when es.id is not null then 1 else 0 end = :jaEscolheuParam ))
;






update evento_escolha set status = 'PAUSADO' where status = 'ENCERRADO' ;


INSERT INTO tamanho (id, tipo, tamanho, version) VALUES (1, 'SAPATO', '40', 0);
INSERT INTO tamanho (id, tipo, tamanho, version) VALUES (2, 'SAPATO', '41', 0);
INSERT INTO tamanho (id, tipo, tamanho, version) VALUES (3, 'SAPATO', '42', 0);
INSERT INTO tamanho (id, tipo, tamanho, version) VALUES (4, 'SAPATO', '43', 0);


INSERT INTO cor (id, nome, cor_hex, cor_rgba, version) VALUES (1, 'Marrom', '#7a7458', 'rgba(122, 116, 88, 1)', 0);
INSERT INTO cor (id, nome, cor_hex, cor_rgba, version) VALUES (2, 'Camursa', '#b5a45b', 'rgba(181, 164, 91, 1)', 0);
INSERT INTO cor (id, nome, cor_hex, cor_rgba, version) VALUES (3, 'Vermelho', '#9c2828', 'rgba(156, 40, 40, 1)', 0);

INSERT INTO produto (id, nome, descricao, preco, criado_em, alterado_em, status, version) VALUES (1, 'Sandalia ', '', null, '2026-01-12 15:09:33.014900', '2026-01-12 15:09:33.014900', 'ATIVO', 0);
INSERT INTO produto (id, nome, descricao, preco, criado_em, alterado_em, status, version) VALUES (2, 'Sandalia', '', null, '2026-01-12 15:10:28.124630', '2026-01-12 15:10:28.124630', 'ATIVO', 0);


INSERT INTO produto_estoque (id, produto_id, cor_id, tamanho_id, preco, quantidade, status, criado_em, alterado_em, version) VALUES (1, 1, 3, 1, 0.00, 2.00, 'ATIVO', '2026-01-12 15:09:33.249226', '2026-01-12 15:09:33.249226', 0);
INSERT INTO produto_estoque (id, produto_id, cor_id, tamanho_id, preco, quantidade, status, criado_em, alterado_em, version) VALUES (2, 1, 3, 2, 0.00, 1.00, 'ATIVO', '2026-01-12 15:09:33.479834', '2026-01-12 15:09:33.479834', 0);
INSERT INTO produto_estoque (id, produto_id, cor_id, tamanho_id, preco, quantidade, status, criado_em, alterado_em, version) VALUES (3, 1, 3, 3, 0.00, 3.00, 'ATIVO', '2026-01-12 15:09:33.706818', '2026-01-12 15:09:33.706818', 0);
INSERT INTO produto_estoque (id, produto_id, cor_id, tamanho_id, preco, quantidade, status, criado_em, alterado_em, version) VALUES (4, 2, 2, 4, 0.00, 1.00, 'ATIVO', '2026-01-12 15:10:28.355272', '2026-01-12 15:10:28.355272', 0);
INSERT INTO produto_estoque (id, produto_id, cor_id, tamanho_id, preco, quantidade, status, criado_em, alterado_em, version) VALUES (5, 2, 2, 3, 0.00, 2.00, 'ATIVO', '2026-01-12 15:10:28.585645', '2026-01-12 15:10:28.585645', 0);
INSERT INTO produto_estoque (id, produto_id, cor_id, tamanho_id, preco, quantidade, status, criado_em, alterado_em, version) VALUES (6, 2, 2, 2, 0.00, 3.00, 'ATIVO', '2026-01-12 15:10:28.812973', '2026-01-12 15:10:28.812973', 0);


-- INSERT INTO usuario (id, username, password_hash, papel, status, criado_em, alterado_em, version) VALUES (1, 'admin', '$2a$10$PemMUY1FAWLRTKc7eSieAey4d0dBySXvSUK6YpHGCcMS0aphSoTC2', 'ADMIN', 'ATIVO', '2026-01-12 15:01:17.940662', '2026-01-12 15:01:17.940662', 0);
INSERT INTO usuario (id, username, password_hash, papel, status, criado_em, alterado_em, version) VALUES (2, 'cliente_mmo', '$2a$10$F5UJhXQZVXIBUTmBlkFjMe/XG..fh57u8/xAG3iThPJ8yFz1mfynu', 'CLIENTE', 'ATIVO', '2026-01-12 15:10:50.608350', '2026-01-12 15:10:50.608350', 0);
INSERT INTO usuario (id, username, password_hash, papel, status, criado_em, alterado_em, version) VALUES (3, 'cliente_useb', '$2a$10$V9rz7YIpPuhnRYQCr33IROBc8yud92rIZSi9aPfYHs0lqHQAChnT2', 'CLIENTE', 'ATIVO', '2026-01-12 15:11:06.519004', '2026-01-12 15:11:06.519004', 0);

INSERT INTO cliente (id, nome, email, telefone, usuario_id, anotacoes, criado_em, alterado_em, status, version) VALUES (1, 'MMO - Missao Mineira Oeste', 'mo@gmail.com', '034 984 094 101', 2, '', '2026-01-12 18:52:17.659112', '2026-01-12 18:52:17.659112', 'ATIVO', 0);
INSERT INTO cliente (id, nome, email, telefone, usuario_id, anotacoes, criado_em, alterado_em, status, version) VALUES (2, 'USeb - Uniao Sudeste Brasileira', 'useb@gmail', '0340984 094 101', 3, '', '2026-01-12 18:52:55.680392', '2026-01-12 18:52:55.680392', 'ATIVO', 0);

INSERT INTO evento (
id, nome, descricao, cliente_id,
status, inicio, fim_previsto, fim, criado_em, alterado_em, version,
prog_status, prog_atual, prog_total, prog_label)
VALUES (
1, 'Presente do dia do professor', 'Festa do dia do professor', 1,
'ATIVO', '2026-01-13 00:53:00.000000', '2026-01-17 00:53:00.000000', null, '2026-01-12 18:56:51.839195', '2026-01-14 11:58:37.008091', 112,
'CONCLUIDO', 0, 1000, 'progressArquivo');
