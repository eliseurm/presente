package br.eng.eliseu.presente.model.dto;

import br.eng.eliseu.presente.model.StatusEnum;

import java.time.LocalDateTime;

public record ClienteDto(Long id,
                         String nome,
                         String email,
                         String telefone,
                         UsuarioDto usuario,
                         String anotacoes,
                         StatusEnum status,
                         LocalDateTime criadoEm,
                         LocalDateTime alteradoEm,
                         Long version          // Essencial para o Optimistic Locking do Hibernate
) {}

