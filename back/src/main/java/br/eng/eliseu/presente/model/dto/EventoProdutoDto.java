package br.eng.eliseu.presente.model.dto;

import br.eng.eliseu.presente.model.StatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoProdutoDto {

    private Long id;

//    private Long produtoId;
//    private String produtoNome;
    private ProdutoDto produto;

    private StatusEnum status;

    private Long version;
}
