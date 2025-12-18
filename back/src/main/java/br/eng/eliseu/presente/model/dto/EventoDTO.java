package br.eng.eliseu.presente.model.dto;

import br.eng.eliseu.presente.model.StatusEnum;
import com.fasterxml.jackson.annotation.JsonProperty;
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

    // Access.WRITE_ONLY: O campo só pode ser escrito (do Front para o Back). Ele será ignorado quando o Back enviar para o Front.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private List<EventoPessoaDTO> eventoPessoas;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private List<EventoProdutoDTO> eventoProdutos;

    private Long version;

}
