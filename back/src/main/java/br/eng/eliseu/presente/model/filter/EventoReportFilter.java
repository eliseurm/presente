package br.eng.eliseu.presente.model.filter;

import br.eng.eliseu.presente.model.core.BaseReportFilter;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventoReportFilter extends BaseReportFilter {

    private Long id;

    private Long clienteId;
    private Long eventoId;

    @Setter(AccessLevel.NONE)
    private Integer jaEscolheu; // null = todos, true = sim, false = não


    public void setJaEscolheu(Integer jaEscolheu) {
        if (jaEscolheu == null) jaEscolheu = -1;
        this.jaEscolheu = jaEscolheu;
    }

    public Integer getJaEscolheu() {
        return jaEscolheu;
    }

}

