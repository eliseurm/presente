package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.Tamanho;
import br.eng.eliseu.presente.model.dto.TamanhoDto;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class TamanhoMapper {

    public static TamanhoDto toDto(Tamanho entity) {
        if (entity == null) return null;

        return new TamanhoDto(
                entity.getId(),
                entity.getTipo(),
                entity.getTamanho(),
                entity.getVersion()
        );
    }

    public static Tamanho fromDto(TamanhoDto dto) {
        if (dto == null) return null;

        return Tamanho.builder()
                .id(dto.id())
                .tipo(dto.tipo())
                .tamanho(dto.tamanho())
                .version(dto.version())
                .build();
    }

    public static List<TamanhoDto> toDtoList(List<Tamanho> list) {
        if (list == null || list.isEmpty()) return Collections.emptyList();
        return list.stream()
                .map(TamanhoMapper::toDto)
                .collect(Collectors.toList());
    }

    public static List<Tamanho> fromDtoList(List<TamanhoDto> list) {
        if (list == null || list.isEmpty()) return Collections.emptyList();
        return list.stream()
                .map(TamanhoMapper::fromDto)
                .collect(Collectors.toList());
    }
}