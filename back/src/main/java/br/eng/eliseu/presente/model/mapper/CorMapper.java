package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.Cor;
import br.eng.eliseu.presente.model.dto.CorDto;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CorMapper {

    public static CorDto toDto(Cor entity) {
        if (entity == null) return null;

        return new CorDto(
                entity.getId(),
                entity.getNome(),
                entity.getCorHex(),
                entity.getCorRgbA(),
                entity.getVersion()
        );
    }

    public static Cor fromDto(CorDto dto) {
        if (dto == null) return null;

        return Cor.builder()
                .id(dto.id())
                .nome(dto.nome())
                .corHex(dto.corHex())
                .corRgbA(dto.corRgbA())
                .version(dto.version())
                .build();
    }

    public static List<CorDto> toDtoList(List<Cor> list) {
        if (list == null || list.isEmpty()) return Collections.emptyList();
        return list.stream()
                .map(CorMapper::toDto)
                .collect(Collectors.toList());
    }

    public static List<Cor> fromDtoList(List<CorDto> list) {
        if (list == null || list.isEmpty()) return Collections.emptyList();
        return list.stream()
                .map(CorMapper::fromDto)
                .collect(Collectors.toList());
    }
}