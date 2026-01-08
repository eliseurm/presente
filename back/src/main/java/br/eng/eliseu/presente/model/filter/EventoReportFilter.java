package br.eng.eliseu.presente.model.filter;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventoReportFilter {

    private Long id;

    private Long clienteId;
    private Long eventoId;
    private Boolean jaEscolheu;

}

