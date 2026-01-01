package br.eng.eliseu.presente.model.dto;

import java.time.LocalDateTime;

public record ImagemDto(
        Long id,
        String nome,
        String url,
        byte[] arquivo,
        LocalDateTime criadoEm,
        LocalDateTime alteradoEm,

        Long version

) {}
