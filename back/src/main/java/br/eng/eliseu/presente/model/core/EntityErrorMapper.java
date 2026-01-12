package br.eng.eliseu.presente.model.core;

import java.util.List;

public interface EntityErrorMapper {

    boolean supports(String constraintName);

    List<ApiFieldError> map(String constraintName);
}