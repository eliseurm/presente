package br.eng.eliseu.presente.config;

import br.eng.eliseu.presente.model.config.ApiFieldError;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    @Autowired ConstraintViolationResolver  constraintViolationResolver;

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("code", "FORBIDDEN");
        body.put("message", "Access Denied");
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
    public ResponseEntity<?> handleDataIntegrity(DataIntegrityViolationException ex) {

        List<ApiFieldError> errors = constraintViolationResolver.resolve(ex);

        if (errors.isEmpty()) {
            errors = List.of(new ApiFieldError("global", "Violação de integridade"));
        }

        Map<String, Object> body = new HashMap<>();
        body.put("code", "DUPLICATE_KEY");
        body.put("message", "Violação de integridade de dados");
        body.put("errors", errors);

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
