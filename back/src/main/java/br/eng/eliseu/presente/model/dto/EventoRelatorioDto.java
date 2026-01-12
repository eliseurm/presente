package br.eng.eliseu.presente.model.dto;

import br.eng.eliseu.presente.model.ProdutoTipoEnum;
import br.eng.eliseu.presente.model.StatusEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
//@NoArgsConstructor
//@AllArgsConstructor // Este construtor é o que o Hibernate usará no "new EventoRelatorioDto(...)"
public class EventoRelatorioDto {

    // Dados do Evento
    private String nomeEvento;
    private String descricao;
    private StatusEnum statusEvento;
    private LocalDateTime inicio;
    private LocalDateTime fimPrevisto;
    private LocalDateTime fim;

    // Dados da Pessoa (Convidado)
    private String nomePessoa;
    private String email;
    private String telefone;
    private String cpf;

    private String endereco;
    private String complemento;
    private String cidade;
    private String estado;
    private String cep;

    // Dados do Vínculo (EventoPessoa)
    private StatusEnum statusEventoPessoa;
    private String numeroMagico;
    private String organoNivel1;
    private String organoNivel2;
    private String organoNivel3;
    private String localTrabalho;

    // Dados da Escolha
    private Boolean jaEscolheu;
    private LocalDateTime dtEscolha;

    // Dados do Produto/Atributos
    private String nomeProduto;
    private BigDecimal preco;
    private ProdutoTipoEnum tipoTamanho;
    private String tamanho;
    private String cor;

    public EventoRelatorioDto(
            String nomeEvento, String descricao, StatusEnum statusEvento, LocalDateTime inicio, LocalDateTime fimPrevisto, LocalDateTime fim,
            String nomePessoa, String email, String telefone, String cpf,
            String endereco, String complemento, String cidade, String estado, String cep,
            StatusEnum statusEventoPessoa, String numeroMagico, String organoNivel1, String organoNivel2, String organoNivel3, String localTrabalho,
            Boolean jaEscolheu,
            LocalDateTime dtEscolha, String nomeProduto, BigDecimal preco, ProdutoTipoEnum tipoTamanho, String tamanho, String cor) {


        this.nomeEvento = nomeEvento;
        this.descricao = descricao;
        this.statusEvento = statusEvento;
        this.inicio = inicio;
        this.fimPrevisto = fimPrevisto;
        this.fim = fim;
        this.nomePessoa = nomePessoa;
        this.email = email;
        this.telefone = telefone;
        this.cpf = cpf;
        this.endereco = endereco;
        this.complemento = complemento;
        this.cidade = cidade;
        this.estado = estado;
        this.cep = cep;
        this.statusEventoPessoa = statusEventoPessoa;
        this.numeroMagico = numeroMagico;
        this.organoNivel1 = organoNivel1;
        this.organoNivel2 = organoNivel2;
        this.organoNivel3 = organoNivel3;
        this.localTrabalho = localTrabalho;
        this.jaEscolheu = jaEscolheu;
        this.dtEscolha = dtEscolha;
        this.nomeProduto = nomeProduto;
        this.preco = preco;
        this.tipoTamanho = tipoTamanho;
        this.tamanho = tamanho;
        this.cor = cor;
    }
}

