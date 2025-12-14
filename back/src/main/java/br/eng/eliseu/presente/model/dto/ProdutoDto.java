package br.eng.eliseu.presente.model.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProdutoDto(
        Long id,
        String nome,
        String descricao,
        BigDecimal preco,
        Boolean status,

        // Agora usamos as listas de DTOs, não entidades JPA
        List<TamanhoDto> tamanhos,
        List<CorDto> cores,
        List<ImagemDto> imagens,

        LocalDateTime criadoEm,
        LocalDateTime alteradoEm
) {}
