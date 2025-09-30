package br.eng.eliseu.presente.model;

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


    @Override
    public String toString() {
        return nome;
    }
}