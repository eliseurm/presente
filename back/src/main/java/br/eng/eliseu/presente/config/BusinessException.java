package br.eng.eliseu.presente.config;

import br.eng.eliseu.presente.model.core.ApiFieldError;

import java.util.ArrayList;
import java.util.List;

public class BusinessException extends RuntimeException {

    private final List<ApiFieldError> errors;

    // Construtor para mensagem simples
    public BusinessException(String message) {
        super(message);
        this.errors = new ArrayList<>();
    }

    // Construtor para erro em um campo específico
    public BusinessException(String field, String message) {
        super(message);
        this.errors = List.of(new ApiFieldError(field, message));
    }

    // Construtor para múltiplos erros
    public BusinessException(String message, List<ApiFieldError> errors) {
        super(message);
        this.errors = errors;
    }

    public List<ApiFieldError> getErrors() {
        return errors;
    }
}
