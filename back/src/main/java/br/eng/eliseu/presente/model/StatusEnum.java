package br.eng.eliseu.presente.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonValue;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum StatusEnum {

    ATIVO("Ativo"),
    PAUSADO("Pausado"),
    ENCERRADO("Encerrado");

    private final String nome;

    StatusEnum(String nome) {
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }

    @JsonValue
    public String toJson() {
        return this.name();
    }

    @JsonCreator
    public static StatusEnum fromString(String value) {
        if (value == null) return null;
        for (StatusEnum status : values()) {
            if (status.name().equalsIgnoreCase(value) || status.getNome().equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown StatusEnum value: " + value);
    }

    @Override
    public String toString() {
        return nome;
    }
}