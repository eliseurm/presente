package br.eng.eliseu.presente.model.filter;

import br.eng.eliseu.presente.model.PapelEnum;
import br.eng.eliseu.presente.model.StatusEnum;
import br.eng.eliseu.presente.model.core.BaseFilter;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsuarioFilter extends BaseFilter {
    private String username;
    private PapelEnum papel;
    private StatusEnum status;
}
