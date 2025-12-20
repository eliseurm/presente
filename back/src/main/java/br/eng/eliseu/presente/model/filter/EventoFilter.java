package br.eng.eliseu.presente.model.filter;

import br.eng.eliseu.presente.model.StatusEnum;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventoFilter extends BaseFilter {

    private Long id;
    private String nome;
    private Long clienteId;
    private StatusEnum status;

}
