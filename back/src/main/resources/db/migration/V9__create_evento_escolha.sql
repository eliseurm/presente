-- Criação da tabela evento_escolha (se ainda não existir)
-- Compatível com a entidade br.eng.eliseu.presente.model.EventoEscolha

CREATE TABLE IF NOT EXISTS evento_escolha (
    id BIGSERIAL PRIMARY KEY,

    evento_id   BIGINT NOT NULL,
    pessoa_id   BIGINT NOT NULL,
    produto_id  BIGINT NOT NULL,
    cor_id      BIGINT NOT NULL,
    tamanho_id  BIGINT NOT NULL,

    dt_escolha  TIMESTAMP WITHOUT TIME ZONE
);

-- Índices úteis para as buscas por evento/pessoa e ordenação por data
CREATE INDEX IF NOT EXISTS idx_evento_escolha_evento_pessoa ON evento_escolha(evento_id, pessoa_id);
CREATE INDEX IF NOT EXISTS idx_evento_escolha_dt ON evento_escolha(dt_escolha DESC);

-- FKs básicas (assumindo nomes de tabelas conforme demais entidades)
DO $$
BEGIN
    -- evento
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.constraint_name = 'fk_evento_escolha_evento' AND tc.table_name = 'evento_escolha'
    ) THEN
        ALTER TABLE evento_escolha
            ADD CONSTRAINT fk_evento_escolha_evento
            FOREIGN KEY (evento_id) REFERENCES evento(id) ON DELETE CASCADE;
    END IF;

    -- pessoa
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.constraint_name = 'fk_evento_escolha_pessoa' AND tc.table_name = 'evento_escolha'
    ) THEN
        ALTER TABLE evento_escolha
            ADD CONSTRAINT fk_evento_escolha_pessoa
            FOREIGN KEY (pessoa_id) REFERENCES pessoa(id) ON DELETE CASCADE;
    END IF;

    -- produto
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.constraint_name = 'fk_evento_escolha_produto' AND tc.table_name = 'evento_escolha'
    ) THEN
        ALTER TABLE evento_escolha
            ADD CONSTRAINT fk_evento_escolha_produto
            FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE RESTRICT;
    END IF;

    -- cor
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.constraint_name = 'fk_evento_escolha_cor' AND tc.table_name = 'evento_escolha'
    ) THEN
        ALTER TABLE evento_escolha
            ADD CONSTRAINT fk_evento_escolha_cor
            FOREIGN KEY (cor_id) REFERENCES cor(id) ON DELETE RESTRICT;
    END IF;

    -- tamanho
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.constraint_name = 'fk_evento_escolha_tamanho' AND tc.table_name = 'evento_escolha'
    ) THEN
        ALTER TABLE evento_escolha
            ADD CONSTRAINT fk_evento_escolha_tamanho
            FOREIGN KEY (tamanho_id) REFERENCES tamanho(id) ON DELETE RESTRICT;
    END IF;
END $$;
