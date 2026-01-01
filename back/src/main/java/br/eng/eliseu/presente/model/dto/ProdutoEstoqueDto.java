package br.eng.eliseu.presente.model.dto;

import br.eng.eliseu.presente.model.StatusEnum;

import java.math.BigDecimal;

public record ProdutoEstoqueDto(
        Long id,
        Long produtoId,

        CorDto cor,
        TamanhoDto tamanho,

        BigDecimal preco,
        BigDecimal quantidade,
        StatusEnum status,
        Long version

) {}