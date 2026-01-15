package br.eng.eliseu.presente.model.dto;

import br.eng.eliseu.presente.model.PapelEnum;
import br.eng.eliseu.presente.model.StatusEnum;

import java.time.LocalDateTime;

public record UsuarioDto(
        Long id,
        String username,
        String senha,
        PapelEnum papel,
        StatusEnum status,
        LocalDateTime criadoEm,
        LocalDateTime alteradoEm,
        Long version
) {}
