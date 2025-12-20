package br.eng.eliseu.presente.model.filter;

import br.eng.eliseu.presente.model.StatusEnum;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PessoaFilter extends BaseFilter {

    private Long id;

    @NotNull(message = "clienteId é obrigatório")
    private Long clienteId;

    private String nome;
    private String email;
    private String telefone;
    private StatusEnum status;

}