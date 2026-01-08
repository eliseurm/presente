
-- Primeiro conecte com o super usuario do banco u:'system', s:'sicsadm'
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'presente_db';
DROP DATABASE IF EXISTS presente_db;
DROP USER IF EXISTS presente_user;

CREATE USER presente_user WITH PASSWORD 'Presente_pwd#123';
CREATE DATABASE presente_db;
GRANT CREATE ON DATABASE presente_db TO presente_user;

-- Mude para presente_db mas ainda com superUsuario

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



-- ##########################################################
select * from flyway_schema_history  ;

delete from flyway_schema_history where installed_rank >= 11 ;

INSERT INTO presente_sh.usuario (id, username, password_hash, papel, status, criado_em, alterado_em) VALUES (1, 'admin', '$2a$10$UX68K.ZTOT4YiWIDMRONXONP3mV9vyYdlKfT.a7hbk.0IkykAfvN2', 'ADMINISTRADOR', 'ATIVO', '2025-11-12 09:46:52.613582', '2025-11-12 09:46:52.613582');

select * from usuario ;

select * from tamanho ;

select * from imagem ;

select * from produto ;
select * from produto_estoque ;

select * from usuario ;

select * from pessoa ;

select * from cliente ;

select * from evento ;

select * from evento_pessoa where pessoa_id < 3;
select * from evento_produto ;
select * from evento_escolha ;

select * from chave_magica ;

select *
from evento e
join cliente c on e.cliente_id=c.id
;


select a from Evento a ;

select * from evento_pessoa ;
delete from evento_pessoa where pessoa_id>=3 ;
select * from evento_produto ;
select * from evento_escolha ;


select
--     e.id as evento_id, ep.pessoa_id, es.dt_escolha, es.status,
    -- Adicione aqui os campos da escolha que você quer ver (ex: es.opcao_id)
    case
        when es.id is not null then true
        else false
        end as jaEscolheu
, *
from evento e
join evento_pessoa ep on e.id = ep.evento_id
left join evento_escolha es on e.id = es.evento_id and ep.pessoa_id = es.pessoa_id
    and es.status = 'ATIVO'
    and es.dt_escolha = (select max(sub.dt_escolha) from evento_escolha sub where sub.evento_id = e.id and sub.pessoa_id = ep.pessoa_id and sub.status = 'ATIVO')
where 1=1
and e.id = 2
;






update evento_escolha set status = 'PAUSADO' where status = 'ENCERRADO' ;

INSERT INTO presente_sh.produto (nome, descricao, preco, status, criado_em, alterado_em) VALUES ('Sapato Paula Bahia 005', 'Sapato tipo sandalia', null, true, '2025-12-11 15:15:37.536125', '2025-12-11 15:15:37.536125');
INSERT INTO presente_sh.produto (nome, descricao, preco, status, criado_em, alterado_em) VALUES ('Sandalia Lorraci 005', 'Sandalia linda', null, true, '2025-12-11 15:16:27.655429', '2025-12-11 15:16:27.655429');
INSERT INTO presente_sh.produto (nome, descricao, preco, status, criado_em, alterado_em) VALUES ('Tenis 005', 'Tenis', null, true, '2025-12-19 15:14:03.328825', '2025-12-19 15:14:03.328825');
INSERT INTO presente_sh.produto (nome, descricao, preco, status, criado_em, alterado_em) VALUES ('Chinelo 005', 'Chinelo', null, true, '2025-12-19 15:14:49.410483', '2025-12-19 15:14:49.410483');
INSERT INTO presente_sh.produto (nome, descricao, preco, status, criado_em, alterado_em) VALUES ('chinelo 005', 'chinelo 2', null, true, '2025-12-19 15:15:26.617391', '2025-12-19 15:15:26.617391');
INSERT INTO presente_sh.produto (nome, descricao, preco, status, criado_em, alterado_em) VALUES ('Sapato Paula Bahia 006', 'Sapato tipo sandalia', null, true, '2025-12-11 15:15:37.536125', '2025-12-11 15:15:37.536125');
INSERT INTO presente_sh.produto (nome, descricao, preco, status, criado_em, alterado_em) VALUES ('Sandalia Lorraci 006', 'Sandalia linda', null, true, '2025-12-11 15:16:27.655429', '2025-12-11 15:16:27.655429');
INSERT INTO presente_sh.produto (nome, descricao, preco, status, criado_em, alterado_em) VALUES ('Tenis 006', 'Tenis', null, true, '2025-12-19 15:14:03.328825', '2025-12-19 15:14:03.328825');
INSERT INTO presente_sh.produto (nome, descricao, preco, status, criado_em, alterado_em) VALUES ('Chinelo 006', 'Chinelo', null, true, '2025-12-19 15:14:49.410483', '2025-12-19 15:14:49.410483');
INSERT INTO presente_sh.produto (nome, descricao, preco, status, criado_em, alterado_em) VALUES ('chinelo 006', 'chinelo 2', null, true, '2025-12-19 15:15:26.617391', '2025-12-19 15:15:26.617391');
INSERT INTO presente_sh.produto (nome, descricao, preco, status, criado_em, alterado_em) VALUES ('Sapato Paula Bahia 007', 'Sapato tipo sandalia', null, true, '2025-12-11 15:15:37.536125', '2025-12-11 15:15:37.536125');
INSERT INTO presente_sh.produto (nome, descricao, preco, status, criado_em, alterado_em) VALUES ('Sandalia Lorraci 007', 'Sandalia linda', null, true, '2025-12-11 15:16:27.655429', '2025-12-11 15:16:27.655429');
INSERT INTO presente_sh.produto (nome, descricao, preco, status, criado_em, alterado_em) VALUES ('Tenis 007', 'Tenis', null, true, '2025-12-19 15:14:03.328825', '2025-12-19 15:14:03.328825');
INSERT INTO presente_sh.produto (nome, descricao, preco, status, criado_em, alterado_em) VALUES ('Chinelo 007', 'Chinelo', null, true, '2025-12-19 15:14:49.410483', '2025-12-19 15:14:49.410483');
INSERT INTO presente_sh.produto (nome, descricao, preco, status, criado_em, alterado_em) VALUES ('chinelo 007', 'chinelo 2', null, true, '2025-12-19 15:15:26.617391', '2025-12-19 15:15:26.617391');
