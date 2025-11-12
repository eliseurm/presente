
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


select * from usuario ;


-- Projeto extrato
-- No postgres Conectado com super usuario
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'extrato_db';
DROP DATABASE IF EXISTS extrato_db;
DROP USER IF EXISTS extrato_user;

CREATE USER extrato_user WITH PASSWORD 'Extrato_pwd#123';
CREATE DATABASE extrato_db;
GRANT CREATE ON DATABASE extrato_db TO extrato_user;

-- Mude para extrato_db mas ainda com superUsuario

CREATE SCHEMA IF NOT EXISTS extrato_sh ;
GRANT USAGE ON SCHEMA extrato_sh TO extrato_user;
GRANT CREATE ON SCHEMA extrato_sh TO extrato_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA extrato_sh GRANT ALL ON TABLES TO extrato_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA extrato_sh GRANT ALL ON SEQUENCES TO extrato_user;

CREATE TABLE IF NOT EXISTS extrato_sh.usuario (
id BIGSERIAL PRIMARY KEY,
username VARCHAR(255) NOT NULL UNIQUE,
password_hash TEXT NOT NULL,
papel VARCHAR(64),
status VARCHAR(64),
criado_em TIMESTAMP,
alterado_em TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_usuario_username ON extrato_sh.usuario (username);



