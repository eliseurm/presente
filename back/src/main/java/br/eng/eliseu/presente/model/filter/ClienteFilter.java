package br.eng.eliseu.presente.model.filter;

import br.eng.eliseu.presente.model.core.BaseFilter;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClienteFilter extends BaseFilter {
    private String nome;
    private String email;
    private String telefone;
    private Long usuarioId;
}
