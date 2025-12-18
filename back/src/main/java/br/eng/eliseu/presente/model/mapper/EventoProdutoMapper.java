package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.EventoProduto;
import br.eng.eliseu.presente.model.Produto;
import br.eng.eliseu.presente.model.dto.EventoProdutoDTO;
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
    public EventoProdutoDTO toDto(EventoProduto entity) {
        if (entity == null) {
            return null;
        }

        return EventoProdutoDTO.builder()
                .id(entity.getId())
                .produtoId(entity.getProduto() != null ? entity.getProduto().getId() : null)
                .produtoNome(entity.getProduto() != null ? entity.getProduto().getNome() : null)
                .status(entity.getStatus())
                .build();
    }

    /**
     * Converte de DTO para Entidade (Front -> Back)
     */
    public EventoProduto fromDto(EventoProdutoDTO dto) {
        if (dto == null) {
            return null;
        }

        EventoProduto entity = new EventoProduto();

        entity.setId(dto.getId());

        // Mapeia o ID do produto para uma instância de Produto
        if (dto.getProdutoId() != null) {
            Produto produto = new Produto();
            produto.setId(dto.getProdutoId());
            entity.setProduto(produto);
        }

        entity.setStatus(dto.getStatus());

        // Nota: O campo 'evento' e o 'id' da própria relação
        // geralmente são tratados na camada de Service.

        return entity;
    }

    /**
     * Converte lista de Entidades para lista de DTOs
     */
    public List<EventoProdutoDTO> toDtoList(List<EventoProduto> entities) {
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
    public List<EventoProduto> fromDtoList(List<EventoProdutoDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return new ArrayList<>();
        }
        return dtos.stream()
                .map(this::fromDto)
                .collect(Collectors.toList());
    }
}
