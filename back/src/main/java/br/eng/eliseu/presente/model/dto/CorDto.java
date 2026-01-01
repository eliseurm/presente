package br.eng.eliseu.presente.model.dto;

import jakarta.persistence.Column;

public record CorDto(
        Long id,
        String nome,
        String corHex,
        String corRgbA,

        Long version

) {}
