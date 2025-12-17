package br.eng.eliseu.presente.model.filter;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventoFilter extends BaseFilter {

    private Long id;
    private String nome;
    private Long clienteId;
    private String status; // usar toString do enum no filtro

}
