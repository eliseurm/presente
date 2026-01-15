package br.eng.eliseu.presente.model.dto;

import br.eng.eliseu.presente.model.StatusEnum;

import java.time.LocalDateTime;

public record PessoaDto(
        Long id,

        ClienteDto cliente,

        String nome,
        String cpf,
        String telefone,
        String email,

        StatusEnum status,

        String endereco,
        String complemento,
        String cidade,
        String estado,
        String cep,

        String senha,

        LocalDateTime criadoEm,
        LocalDateTime alteradoEm,

        Long version

) {}