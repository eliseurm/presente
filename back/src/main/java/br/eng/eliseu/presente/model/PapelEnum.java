package br.eng.eliseu.presente.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum PapelEnum {

    ADMINISTRADOR("Administrador", "Dono do sistema, tem acesso a tudo"),
    CLIENTE("Cliente", "Pode ver seus Eventos e cadastrar seus colaboradores"),
    USUARIO("Usuário", "Acesso básico do sistema");

    private final String nome;
    private final String descricao;

    PapelEnum(String nome, String descricao) {
        this.nome = nome;
        this.descricao = descricao;
    }

    public String getNome() {
        return nome;
    }

    public String getDescricao() {
        return descricao;
    }

    @Override
    public String toString() {
        return nome;
    }

    @JsonCreator
    public static PapelEnum fromJson(String value) {
        for (PapelEnum p : PapelEnum.values()) {
            if (p.name().equalsIgnoreCase(value)) {
                return p;
            }
        }
        throw new IllegalArgumentException("Valor inválido para PapelEnum: " + value);
    }
}