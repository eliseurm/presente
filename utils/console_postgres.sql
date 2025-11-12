-- Primeiro conecte com o super usuario do banco u:'system', s:'sicsadm'

-- ---
-- Etapa 1: Limpeza (Executada do banco 'postgres' padrão)
-- ---
DROP DATABASE IF EXISTS presente_db;
DROP USER IF EXISTS presente_user;

-- ---
-- Etapa 2: Criar usuário e banco
-- ---
CREATE USER presente_user WITH ENCRYPTED PASSWORD 'Presente_pwd#123';
CREATE DATABASE presente_db;

-- Dê ao seu usuário a permissão de se CONECTAR ao novo banco
GRANT CONNECT ON DATABASE presente_db TO presente_user;
-- ---
-- Etapa 3: Criar o Schema (A FORMA CORRETA)
-- ---

-- !!! IMPORTANTE !!!
-- Conecte-se DIRETAMENTE ao banco 'presente_db' agora.
-- (No psql, você usaria: \c presente_db)
-- (Em outras ferramentas, mude sua conexão ativa para 'presente_db')

-- Agora que está DENTRO de 'presente_db', execute:

-- 1. Crie o schema (ele será de propriedade do seu usuário admin 'postgres')
CREATE SCHEMA IF NOT EXISTS presente_sh;

-- 2. Transfira a propriedade do schema para o usuário da aplicação
GRANT presente_user TO postgres;
ALTER SCHEMA presente_sh OWNER TO presente_user;






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



5d28ec36827c 9923d2bed95a acaa5d71f0b9 fc42f0be5d9b 592ae7f5b8bb 7cbcf404fd71 2fd9653a7fb0 66e4f9e2e796 0fb33cec3546 1f4f6585e0df 08203480f849 3d85fabb48d2 8d89e22bc599 27a7fc239ed2 30e816b71f43


