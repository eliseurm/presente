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
public class EventoPessoaDTO {

    private Long pessoaId;
    private String pessoaNome;

    private StatusEnum status;
    private String nomeMagicNumber; // token

    // Somente leitura: indica se a pessoa já possui uma escolha ATIVA neste evento
    private Boolean jaEscolheu;
}
