package br.eng.eliseu.presente.config;

import br.eng.eliseu.presente.model.core.ApiFieldError;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    @Autowired ConstraintViolationResolver  constraintViolationResolver;

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusiness(BusinessException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("code", "BUSINESS_ERROR");
        body.put("message", ex.getMessage());

        // Se a exceção contiver erros de campo, adicionamos ao corpo
        if (ex.getErrors() != null && !ex.getErrors().isEmpty()) {
            body.put("errors", ex.getErrors());
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("code", "FORBIDDEN");
        body.put("message", "Acesso negado");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {

        List<Map<String, String>> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::toError)
                .collect(Collectors.toList());

        int total = errors.size();

        // Pega no máximo os 3 primeiros
        List<Map<String, String>> firstErrors = errors.stream()
                .limit(3)
                .collect(Collectors.toList());

        // Monta mensagem resumida
        String resumo = firstErrors.stream()
                .map(e -> e.get("field") + ": " + e.get("error"))
                .collect(Collectors.joining("; "));

        if (total > 3) {
            resumo += " (3 de " + total + ")";
        }

        Map<String, Object> body = new HashMap<>();
        body.put("code", "BAD_REQUEST");
        body.put("message", resumo);
        body.put("errors", errors); // mantém todos os erros

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraint(ConstraintViolationException ex) {
        List<Map<String, String>> errors = ex.getConstraintViolations().stream()
                .map(this::toError)
                .collect(Collectors.toList());
        Map<String, Object> body = new HashMap<>();
        body.put("code", "BAD_REQUEST");
        body.put("message", "Violação de restrição");
        body.put("errors", errors);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(EntityNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("code", "NOT_FOUND");
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Recurso não encontrado");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrity(DataIntegrityViolationException ex) {

        // 1. Tenta resolver erros genéricos com seu resolver atual
        List<ApiFieldError> errors = constraintViolationResolver.resolve(ex);
        String mensagem = "Violação de integridade de dados";

        // 2. Verifica especificamente o caso do CPF
        // O "uq_pessoa_cpf" é o nome da constraint que apareceu no seu log anterior
        if (ex.getMessage() != null && ex.getMessage().contains("uq_pessoa_cpf")) {
            mensagem = "Este CPF já está cadastrado para outra pessoa.";
            // Adiciona um erro específico para o campo CPF se a lista estiver vazia
            if (errors.isEmpty()) {
                errors = List.of(new ApiFieldError("cpf", mensagem));
            }
        }
        else if (errors.isEmpty()) {
            // Caso genérico se o resolver não encontrou nada
            errors = List.of(new ApiFieldError("global", mensagem));
        }

        Map<String, Object> body = new HashMap<>();
        body.put("code", "DUPLICATE_KEY");
        body.put("message", mensagem);
        body.put("errors", errors);
        body.put("timestamp", LocalDateTime.now()); // Adicionei timestamp que é útil

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    private Map<String, String> toError(FieldError fe) {
        Map<String, String> m = new HashMap<>();
        m.put("field", fe.getField());
        m.put("error", fe.getDefaultMessage());
        return m;
    }

    private Map<String, String> toError(ConstraintViolation<?> cv) {
        Map<String, String> m = new HashMap<>();
        m.put("field", cv.getPropertyPath() != null ? cv.getPropertyPath().toString() : null);
        m.put("error", cv.getMessage());
        return m;
    }
}
