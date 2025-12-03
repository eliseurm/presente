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
    private IdNomeDTO pessoa; // Para leitura: {id, nome}. Para escrita: pode vir apenas {id}
    private StatusEnum status;
    private String nomeMagicNumber; // token
}
