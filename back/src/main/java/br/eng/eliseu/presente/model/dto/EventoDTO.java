package br.eng.eliseu.presente.model.dto;

import br.eng.eliseu.presente.model.StatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoDTO {

    private Long id;
    private String nome;
    private String descricao;

    private Long clienteId;
    private String clienteNome;

    private StatusEnum status;
    private String anotacoes;
    private LocalDateTime inicio;
    private LocalDateTime fimPrevisto;
    private LocalDateTime fim;

    private List<EventoPessoaDTO> pessoas;
    private List<EventoProdutoDTO> produtos;

    private Long version;

}
