package br.eng.eliseu.presente.model.filter;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventoPessoaFilter extends BaseFilter {

    private Long id;

    private Long eventoId;

    private Long pessoaId;
    private String pessoaNome;
    private String pessoaCpf;
    private String pessoaEmail;
    private String pessoaTelefone;

}
