
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

delete from flyway_schema_history where installed_rank >= 2 ;

INSERT INTO presente_sh.usuario (id, username, password_hash, papel, status, criado_em, alterado_em) VALUES (1, 'admin', '$2a$10$UX68K.ZTOT4YiWIDMRONXONP3mV9vyYdlKfT.a7hbk.0IkykAfvN2', 'ADMINISTRADOR', 'ATIVO', '2025-11-12 09:46:52.613582', '2025-11-12 09:46:52.613582');
select * from usuario ;

select * from tamanho ;

select * from usuario ;

select * from pessoa ;

select * from cliente ;

select * from evento ;

select * from chave_magica ;

select *
from evento e
join cliente c on e.cliente_id=c.id
;


select a from Evento a ;

select * from evento_pessoa ;
select * from evento_produto ;
select * from evento_escolha ;