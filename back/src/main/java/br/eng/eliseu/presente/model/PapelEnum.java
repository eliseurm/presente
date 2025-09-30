package br.eng.eliseu.presente.model;

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
}