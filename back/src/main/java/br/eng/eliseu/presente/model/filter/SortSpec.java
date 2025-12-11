package br.eng.eliseu.presente.model.filter;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class SortSpec {

    private String field;
    private Sort.Direction direction;

}
