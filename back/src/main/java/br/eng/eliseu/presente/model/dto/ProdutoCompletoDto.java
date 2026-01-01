package br.eng.eliseu.presente.model.dto;

import br.eng.eliseu.presente.model.StatusEnum;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProdutoCompletoDto(

        Long id,
        String nome,
        String descricao,
        BigDecimal preco,
        StatusEnum status,

        LocalDateTime criadoEm,
        LocalDateTime alteradoEm,

        List<ProdutoEstoqueDto> estoques,
        List<ImagemDto> imagens,

        Long version

) {}
