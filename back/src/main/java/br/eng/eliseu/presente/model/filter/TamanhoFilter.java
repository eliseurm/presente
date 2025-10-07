package br.eng.eliseu.presente.model.filter;

import br.eng.eliseu.presente.model.ProdutoTipoEnum;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TamanhoFilter extends BaseFilter {

    private ProdutoTipoEnum tipo;

    private String tamanho;

}