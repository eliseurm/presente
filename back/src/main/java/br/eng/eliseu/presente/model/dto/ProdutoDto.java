package br.eng.eliseu.presente.model.dto;

import br.eng.eliseu.presente.model.StatusEnum;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProdutoDto(

        Long id,
        String nome,
        String descricao,
        BigDecimal preco,
        StatusEnum status,

        LocalDateTime criadoEm,
        LocalDateTime alteradoEm,

        // Access.WRITE_ONLY: O campo só pode ser escrito (do Front para o Back). Ele será ignorado quando o Back enviar para o Front.
        @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
        List<ProdutoEstoqueDto> estoques,

        @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
        List<ImagemDto> imagens,

        Long version

) {}
