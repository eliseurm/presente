package br.eng.eliseu.presente.model.filter;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.ArrayList;

@Getter
@Setter
public abstract class BaseFilter {
    private Integer page = 0;
    private Integer size = 10;
    // Suporta múltiplas ordenações recebidas como parâmetros repetidos no padrão Spring Data:
    // ?sort=campo1,asc&sort=campo2,desc
    // Utiliza SortSpec tipado e um Converter (ver WebConfig) para transformar "campo,dir" em SortSpec.
    private List<String> order = new ArrayList<>();
    // Campos a expandir (CSV). Ex.: "pessoas,cliente". Opcional e desabilitado por padrão.
    private String expand;
}