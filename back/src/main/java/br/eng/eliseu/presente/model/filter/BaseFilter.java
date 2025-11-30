package br.eng.eliseu.presente.model.filter;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class BaseFilter {
    private Integer page = 0;
    private Integer size = 10;
    private String sort = "id";
    private String direction = "DESC";
    // Campos a expandir (CSV). Ex.: "pessoas,cliente". Opcional e desabilitado por padrão.
    private String expand;
}