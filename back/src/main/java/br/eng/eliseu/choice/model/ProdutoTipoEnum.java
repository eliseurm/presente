package br.eng.eliseu.choice.model;

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


    @Override
    public String toString() {
        return nome;
    }
}