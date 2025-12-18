package br.eng.eliseu.presente.model.dto;

import br.eng.eliseu.presente.model.StatusEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record PessoaDTO(
        Long id,

        Long clienteId,

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
        LocalDateTime alteradoEm

) {}