package br.eng.eliseu.presente.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProdutoTipoEnum {

    ROUPA_ADULTO("Roupa Adulto"),
    ROUPA_CRIANCA("Roupa Criança"),
    SAPATO("Sapato"),
    SANDALIA("Sandalia"),
    OBJETO("Outros Objetos"),
    TENIS("Tenis");

    private final String nome;

    ProdutoTipoEnum(String nome) {
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }

    /**
     * Serializa o enum como seu NAME (ex.: ROUPA_CRIANCA) para o JSON.
     * Mantemos toString() amigável apenas para logs.
     */
    @JsonValue
    public String toJson() {
        return name();
    }

    /**
     * Aceita tanto a KEY (NAME) quanto a descrição amigável ao desserializar do JSON.
     */
    @JsonCreator
    public static ProdutoTipoEnum fromJson(String value) {
        if (value == null) return null;
        // Tenta por NAME (KEY)
        try {
            return ProdutoTipoEnum.valueOf(value);
        } catch (IllegalArgumentException ignored) {}
        // Tenta por descrição (nome amigável), case-insensitive
        for (ProdutoTipoEnum e : values()) {
            if (e.getNome().equalsIgnoreCase(value)) {
                return e;
            }
        }
        // Último recurso: normaliza acentos simples comuns
        String normalized = value
                .replace("ç", "c")
                .replace("Ç", "C")
                .replace("ã", "a")
                .replace("Ã", "A")
                .replace("á", "a")
                .replace("Á", "A")
                .replace("é", "e")
                .replace("É", "E");
        for (ProdutoTipoEnum e : values()) {
            String enumNomeNorm = e.getNome()
                    .replace("ç", "c")
                    .replace("Ç", "C")
                    .replace("ã", "a")
                    .replace("Ã", "A")
                    .replace("á", "a")
                    .replace("Á", "A")
                    .replace("é", "e")
                    .replace("É", "E");
            if (enumNomeNorm.equalsIgnoreCase(normalized)) {
                return e;
            }
        }
        throw new IllegalArgumentException("Valor inválido para ProdutoTipoEnum: " + value);
    }

    @Override
    public String toString() {
        return nome;
    }
}