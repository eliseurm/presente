package br.eng.eliseu.presente.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class EventoProdutoConsolidadoDto {

    private String nomeProduto;
    private String descricao;
    private BigDecimal preco;

    private String cor;
    private String tamanho;
    private Long quantidade;

    public EventoProdutoConsolidadoDto(String nomeProduto, String descricao, BigDecimal preco, String cor, String tamanho, Long quantidade) {
        this.nomeProduto = nomeProduto;
        this.descricao = descricao;
        this.preco = preco;
        this.cor = cor;
        this.tamanho = tamanho;
        this.quantidade = quantidade;
    }

}
