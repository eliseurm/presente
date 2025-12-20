package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.EventoPessoa;
import br.eng.eliseu.presente.model.Pessoa;
import br.eng.eliseu.presente.model.dto.EventoPessoaDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class EventoPessoaMapper {

    /**
     * Converte de Entidade para DTO (Back -> Front)
     */
    public EventoPessoaDto toDto(EventoPessoa entity) {
        if (entity == null) {
            return null;
        }

        return EventoPessoaDto.builder()
                .id(entity.getId())
                .pessoaId(entity.getPessoa() != null ? entity.getPessoa().getId() : null)
                .pessoaNome(entity.getPessoa() != null ? entity.getPessoa().getNome() : null)
                .status(entity.getStatus())
                .nomeMagicNumber(entity.getNomeMagicNumber())
                .build();
    }

    /**
     * Converte de DTO para Entidade (Front -> Back)
     */
    public EventoPessoa fromDto(EventoPessoaDto dto) {
        if (dto == null) {
            return null;
        }

        EventoPessoa entity = new EventoPessoa();

        entity.setId(dto.getId());

        // Mapeia o ID do pessoa para uma instância de Pessoa
        if (dto.getPessoaId() != null) {
            Pessoa pessoa = new Pessoa();
            pessoa.setId(dto.getPessoaId());
            entity.setPessoa(pessoa);
        }

        entity.setStatus(dto.getStatus());
        entity.setNomeMagicNumber(dto.getNomeMagicNumber());

        // Nota: O campo 'evento' e o 'id' da própria relação
        // geralmente são tratados na camada de Service.

        return entity;
    }

    /**
     * Converte lista de Entidades para lista de DTOs
     */
    public List<EventoPessoaDto> toDtoList(List<EventoPessoa> entities) {
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
    public List<EventoPessoa> fromDtoList(List<EventoPessoaDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return new ArrayList<>();
        }
        return dtos.stream()
                .map(this::fromDto)
                .collect(Collectors.toList());
    }
}
