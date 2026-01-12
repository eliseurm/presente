package br.eng.eliseu.presente.config;

import br.eng.eliseu.presente.model.core.ApiFieldError;
import br.eng.eliseu.presente.model.core.EntityErrorMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ConstraintViolationResolver {

    private final List<EntityErrorMapper> mappers;

    public ConstraintViolationResolver(List<EntityErrorMapper> mappers) {
        this.mappers = mappers;
    }

    public List<ApiFieldError> resolve(Throwable ex) {

        String constraint = extractConstraintName(ex);

        if (constraint == null) return List.of();

        return mappers.stream()
                .filter(m -> m.supports(constraint))
                .findFirst()
                .map(m -> m.map(constraint))
                .orElse(List.of());
    }

    private String extractConstraintName(Throwable ex) {
        Throwable root = ex;
        while (root.getCause() != null) root = root.getCause();

        String msg = root.getMessage();
        if (msg == null) return null;

        Matcher matcher = Pattern.compile("constraint \"([^\"]+)\"").matcher(msg);

        return matcher.find() ? matcher.group(1) : null;
    }
}
