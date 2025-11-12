-- Criação inicial de schema e TABELAS com base nas entidades JPA
-- Observação: o Spring Boot aplica naming strategy snake_case por padrão; refletimos isso nas colunas.

CREATE SCHEMA IF NOT EXISTS presente_sh;

-- =========================
-- Tabela: usuario
-- =========================
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

-- =========================
-- Tabela: pessoa
-- =========================
CREATE TABLE IF NOT EXISTS presente_sh.pessoa (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255),
    telefone VARCHAR(255),
    status VARCHAR(64),
    criado_em TIMESTAMP,
    alterado_em TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pessoa_email ON presente_sh.pessoa (email);

-- =========================
-- Tabela: cliente
-- =========================
CREATE TABLE IF NOT EXISTS presente_sh.cliente (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255),
    telefone VARCHAR(255),
    usuario_id BIGINT,
    anotacoes TEXT,
    criado_em TIMESTAMP,
    alterado_em TIMESTAMP,
    CONSTRAINT fk_cliente_usuario FOREIGN KEY (usuario_id)
        REFERENCES presente_sh.usuario(id)
        ON UPDATE RESTRICT ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_cliente_usuario ON presente_sh.cliente (usuario_id);

-- =========================
-- Tabela: cor
-- =========================
CREATE TABLE IF NOT EXISTS presente_sh.cor (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255),
    cor_hex VARCHAR(10),
    cor_rgba VARCHAR(30)
);

-- =========================
-- Tabela: tamanho
-- =========================
CREATE TABLE IF NOT EXISTS presente_sh.tamanho (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(64),
    tamanho VARCHAR(255)
);

-- =========================
-- Tabela: imagem
-- =========================
CREATE TABLE IF NOT EXISTS presente_sh.imagem (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255),
    url VARCHAR(1024),
    arquivo BYTEA,
    criado_em TIMESTAMP,
    alterado_em TIMESTAMP
);

-- =========================
-- Tabela: produto
-- =========================
CREATE TABLE IF NOT EXISTS presente_sh.produto (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255),
    descricao TEXT,
    preco NUMERIC(19,2),
    status BOOLEAN,
    criado_em TIMESTAMP,
    alterado_em TIMESTAMP
);

-- Tabelas de associação de produto
CREATE TABLE IF NOT EXISTS presente_sh.produto_tamanho (
    produto_id BIGINT NOT NULL,
    tamanho_id BIGINT NOT NULL,
    CONSTRAINT fk_produto_tamanho_produto FOREIGN KEY (produto_id)
        REFERENCES presente_sh.produto(id) ON UPDATE RESTRICT ON DELETE CASCADE,
    CONSTRAINT fk_produto_tamanho_tamanho FOREIGN KEY (tamanho_id)
        REFERENCES presente_sh.tamanho(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT uq_produto_tamanho UNIQUE (produto_id, tamanho_id)
);
CREATE INDEX IF NOT EXISTS idx_produto_tamanho_produto ON presente_sh.produto_tamanho (produto_id);
CREATE INDEX IF NOT EXISTS idx_produto_tamanho_tamanho ON presente_sh.produto_tamanho (tamanho_id);

CREATE TABLE IF NOT EXISTS presente_sh.produto_cor (
    produto_id BIGINT NOT NULL,
    cor_id BIGINT NOT NULL,
    CONSTRAINT fk_produto_cor_produto FOREIGN KEY (produto_id)
        REFERENCES presente_sh.produto(id) ON UPDATE RESTRICT ON DELETE CASCADE,
    CONSTRAINT fk_produto_cor_cor FOREIGN KEY (cor_id)
        REFERENCES presente_sh.cor(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT uq_produto_cor UNIQUE (produto_id, cor_id)
);
CREATE INDEX IF NOT EXISTS idx_produto_cor_produto ON presente_sh.produto_cor (produto_id);
CREATE INDEX IF NOT EXISTS idx_produto_cor_cor ON presente_sh.produto_cor (cor_id);

CREATE TABLE IF NOT EXISTS presente_sh.produto_imagem (
    produto_id BIGINT NOT NULL,
    imagem_id BIGINT NOT NULL,
    CONSTRAINT fk_produto_imagem_produto FOREIGN KEY (produto_id)
        REFERENCES presente_sh.produto(id) ON UPDATE RESTRICT ON DELETE CASCADE,
    CONSTRAINT fk_produto_imagem_imagem FOREIGN KEY (imagem_id)
        REFERENCES presente_sh.imagem(id) ON UPDATE RESTRICT ON DELETE CASCADE,
    CONSTRAINT uq_produto_imagem UNIQUE (produto_id, imagem_id)
);
CREATE INDEX IF NOT EXISTS idx_produto_imagem_produto ON presente_sh.produto_imagem (produto_id);
CREATE INDEX IF NOT EXISTS idx_produto_imagem_imagem ON presente_sh.produto_imagem (imagem_id);

-- =========================
-- Tabela: evento
-- =========================
CREATE TABLE IF NOT EXISTS presente_sh.evento (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255),
    descricao TEXT,
    cliente_id BIGINT,
    status VARCHAR(64),
    anotacoes TEXT,
    inicio TIMESTAMP,
    fim_previsto TIMESTAMP,
    fim TIMESTAMP,
    criado_em TIMESTAMP,
    alterado_em TIMESTAMP,
    CONSTRAINT fk_evento_cliente FOREIGN KEY (cliente_id)
        REFERENCES presente_sh.cliente(id)
        ON UPDATE RESTRICT ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_evento_cliente ON presente_sh.evento (cliente_id);

-- =========================
-- Tabela: evento_pessoa (associação)
-- =========================
CREATE TABLE IF NOT EXISTS presente_sh.evento_pessoa (
    id BIGSERIAL PRIMARY KEY,
    evento_id BIGINT NOT NULL,
    pessoa_id BIGINT NOT NULL,
    status VARCHAR(64),
    CONSTRAINT fk_evento_pessoa_evento FOREIGN KEY (evento_id)
        REFERENCES presente_sh.evento(id) ON UPDATE RESTRICT ON DELETE CASCADE,
    CONSTRAINT fk_evento_pessoa_pessoa FOREIGN KEY (pessoa_id)
        REFERENCES presente_sh.pessoa(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT uq_evento_pessoa UNIQUE (evento_id, pessoa_id)
);
CREATE INDEX IF NOT EXISTS idx_evento_pessoa_evento ON presente_sh.evento_pessoa (evento_id);
CREATE INDEX IF NOT EXISTS idx_evento_pessoa_pessoa ON presente_sh.evento_pessoa (pessoa_id);

-- =========================
-- Tabela: evento_produto (associação)
-- =========================
CREATE TABLE IF NOT EXISTS presente_sh.evento_produto (
    id BIGSERIAL PRIMARY KEY,
    evento_id BIGINT NOT NULL,
    produto_id BIGINT NOT NULL,
    status VARCHAR(64),
    CONSTRAINT fk_evento_produto_evento FOREIGN KEY (evento_id)
        REFERENCES presente_sh.evento(id) ON UPDATE RESTRICT ON DELETE CASCADE,
    CONSTRAINT fk_evento_produto_produto FOREIGN KEY (produto_id)
        REFERENCES presente_sh.produto(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT uq_evento_produto UNIQUE (evento_id, produto_id)
);
CREATE INDEX IF NOT EXISTS idx_evento_produto_evento ON presente_sh.evento_produto (evento_id);
CREATE INDEX IF NOT EXISTS idx_evento_produto_produto ON presente_sh.evento_produto (produto_id);

-- =========================
-- Tabela: chave_magica
-- =========================
CREATE TABLE IF NOT EXISTS presente_sh.chave_magica (
    id BIGSERIAL PRIMARY KEY,
    pessoa_id BIGINT NOT NULL,
    token_hash VARCHAR(255),
    token_lookup VARCHAR(255),
    expira_em TIMESTAMP,
    uso_unico BOOLEAN DEFAULT TRUE,
    utilizado TIMESTAMP,
    quantidade_acesso INTEGER,
    CONSTRAINT fk_chave_magica_pessoa FOREIGN KEY (pessoa_id)
        REFERENCES presente_sh.pessoa(id) ON UPDATE RESTRICT ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_chave_magica_lookup ON presente_sh.chave_magica (token_lookup);
