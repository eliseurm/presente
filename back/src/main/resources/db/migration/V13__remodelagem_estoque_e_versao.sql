-- 1. Remover relacionamentos antigos de Produto (Muitos-para-Muitos)
DROP TABLE IF EXISTS produto_cor;
DROP TABLE IF EXISTS produto_tamanho;

-- 2. Criar a nova tabela ProdutoEstoque
-- Nota: Assumi o nome da tabela como 'produto_estoque' para não conflitar com 'produto'
CREATE TABLE IF NOT EXISTS produto_estoque (
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
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'fk_estoque_produto') THEN
       ALTER TABLE produto_estoque ADD CONSTRAINT fk_estoque_produto FOREIGN KEY (produto_id) REFERENCES produto (id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'fk_estoque_cor') THEN
       ALTER TABLE produto_estoque ADD CONSTRAINT fk_estoque_cor FOREIGN KEY (cor_id) REFERENCES cor (id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'fk_estoque_tamanho') THEN
       ALTER TABLE produto_estoque ADD CONSTRAINT fk_estoque_tamanho FOREIGN KEY (tamanho_id) REFERENCES tamanho (id);
    END IF;
END $$;

-- 3. Adicionar coluna de versionamento (@Version) nas tabelas solicitadas
-- O 'DEFAULT 0' garante que linhas existentes tenham um valor inicial

DO $$
BEGIN
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuario' AND column_name='version') THEN
   ALTER TABLE usuario ADD COLUMN version BIGINT DEFAULT 0;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='produto' AND column_name='version') THEN
   ALTER TABLE produto ADD COLUMN version BIGINT DEFAULT 0;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pessoa' AND column_name='version') THEN
   ALTER TABLE pessoa ADD COLUMN version BIGINT DEFAULT 0;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='imagem' AND column_name='version') THEN
   ALTER TABLE imagem ADD COLUMN version BIGINT DEFAULT 0;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='evento_produto' AND column_name='version') THEN
   ALTER TABLE evento_produto ADD COLUMN version BIGINT DEFAULT 0;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='evento_escolha' AND column_name='version') THEN
   ALTER TABLE evento_escolha ADD COLUMN version BIGINT DEFAULT 0;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='evento_pessoa' AND column_name='version') THEN
   ALTER TABLE evento_pessoa ADD COLUMN version BIGINT DEFAULT 0;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cor' AND column_name='version') THEN
   ALTER TABLE cor ADD COLUMN version BIGINT DEFAULT 0;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cliente' AND column_name='version') THEN
   ALTER TABLE cliente ADD COLUMN version BIGINT DEFAULT 0;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chave_magica' AND column_name='version') THEN
   ALTER TABLE chave_magica ADD COLUMN version BIGINT DEFAULT 0;
END IF;
END $$;

