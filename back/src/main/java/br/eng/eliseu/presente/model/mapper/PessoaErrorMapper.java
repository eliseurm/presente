package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.core.ApiFieldError;
import br.eng.eliseu.presente.model.core.EntityErrorMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class PessoaErrorMapper implements EntityErrorMapper {

    private static final Map<String, ApiFieldError> MAP = Map.of(
            "uq_pessoa_email",
            new ApiFieldError("email", "Já existe uma pessoa com este email"),

            "uq_pessoa_telefone",
            new ApiFieldError("telefone", "Já existe uma pessoa com este telefone"),

            "uq_pessoa_cpf",
            new ApiFieldError("cpf", "Já existe uma pessoa com este CPF")
    );

    @Override
    public boolean supports(String constraintName) {
        return MAP.containsKey(constraintName);
    }

    @Override
    public List<ApiFieldError> map(String constraintName) {
        return List.of(MAP.get(constraintName));
    }
}
