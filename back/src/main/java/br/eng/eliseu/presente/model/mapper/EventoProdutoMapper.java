package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.EventoProduto;
import br.eng.eliseu.presente.model.dto.EventoProdutoDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class EventoProdutoMapper {

    /**
     * Converte de Entidade para DTO (Back -> Front)
     */
    public EventoProdutoDto toDto(EventoProduto entity) {
        if (entity == null) {
            return null;
        }

        return EventoProdutoDto.builder()
                .id(entity.getId())
                .produto(ProdutoMapper.toDto(entity.getProduto()))
                .status(entity.getStatus())
                .build();
    }

    /**
     * Converte de DTO para Entidade (Front -> Back)
     */
    public EventoProduto fromDto(EventoProdutoDto dto) {
        if (dto == null) {
            return null;
        }

        EventoProduto entity = new EventoProduto();

        entity.setId(dto.getId());
        entity.setProduto(ProdutoMapper.fromDto(dto.getProduto()));
        entity.setStatus(dto.getStatus());

        // Nota: O campo 'evento' e o 'id' da própria relação
        // geralmente são tratados na camada de Service.

        return entity;
    }

    /**
     * Converte lista de Entidades para lista de DTOs
     */
    public List<EventoProdutoDto> toDtoList(List<EventoProduto> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Converte lista de DTOs para lista de Entidades
     */
    public List<EventoProduto> fromDtoList(List<EventoProdutoDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return new ArrayList<>();
        }
        return dtos.stream()
                .map(this::fromDto)
                .collect(Collectors.toList());
    }
}
