-- 1. Remover relacionamentos antigos de Produto (Muitos-para-Muitos)
DROP TABLE IF EXISTS produto_cor;
DROP TABLE IF EXISTS produto_tamanho;

-- 2. Criar a nova tabela ProdutoEstoque
-- Nota: Assumi o nome da tabela como 'produto_estoque' para não conflitar com 'produto'
CREATE TABLE produto_estoque (
     id BIGSERIAL NOT NULL,
     produto_id BIGINT NOT NULL,
     cor_id BIGINT NOT NULL,
     tamanho_id BIGINT NOT NULL,
     preco NUMERIC(19, 2),
     quantidade NUMERIC(19, 2),
     status VARCHAR(255),
     criado_em TIMESTAMP,
     alterado_em TIMESTAMP,
     version BIGINT DEFAULT 0,
     CONSTRAINT pk_produto_estoque PRIMARY KEY (id)
);

-- Adicionar Constraints (Foreign Keys) para ProdutoEstoque
ALTER TABLE produto_estoque
    ADD CONSTRAINT fk_estoque_produto FOREIGN KEY (produto_id) REFERENCES produto (id);
ALTER TABLE produto_estoque
    ADD CONSTRAINT fk_estoque_cor FOREIGN KEY (cor_id) REFERENCES cor (id);
ALTER TABLE produto_estoque
    ADD CONSTRAINT fk_estoque_tamanho FOREIGN KEY (tamanho_id) REFERENCES tamanho (id);

-- 3. Adicionar coluna de versionamento (@Version) nas tabelas solicitadas
-- O 'DEFAULT 0' garante que linhas existentes tenham um valor inicial

ALTER TABLE usuario ADD COLUMN version BIGINT DEFAULT 0;
ALTER TABLE produto ADD COLUMN version BIGINT DEFAULT 0;
ALTER TABLE pessoa ADD COLUMN version BIGINT DEFAULT 0;
ALTER TABLE imagem ADD COLUMN version BIGINT DEFAULT 0;
ALTER TABLE evento_produto ADD COLUMN version BIGINT DEFAULT 0;
ALTER TABLE evento_escolha ADD COLUMN version BIGINT DEFAULT 0;
ALTER TABLE evento_pessoa ADD COLUMN version BIGINT DEFAULT 0;
ALTER TABLE cor ADD COLUMN version BIGINT DEFAULT 0;
ALTER TABLE cliente ADD COLUMN version BIGINT DEFAULT 0;
ALTER TABLE chave_magica ADD COLUMN version BIGINT DEFAULT 0;