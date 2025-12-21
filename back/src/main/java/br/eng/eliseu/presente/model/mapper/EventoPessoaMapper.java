package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.EventoPessoa;
import br.eng.eliseu.presente.model.Pessoa;
import br.eng.eliseu.presente.model.dto.EventoPessoaDto;
import lombok.Builder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class EventoPessoaMapper {

    /**
     * Converte de Entidade para DTO (Back -> Front)
     */
    public static EventoPessoaDto toDto(EventoPessoa entity) {
        if (entity == null) {
            return null;
        }

        return EventoPessoaDto.builder()
                .id(entity.getId())
                .pessoa(PessoaMapper.toDto(entity.getPessoa()))
                .status(entity.getStatus())
                .nomeMagicNumber(entity.getNomeMagicNumber())
                .build();
    }

    public static EventoPessoaDto toDto(EventoPessoa entity, Set<Long> IDsQueJaEscolheram) {
        // 1. Aproveita o método base para criar o DTO inicial
        EventoPessoaDto dto = toDto(entity);

        if (dto == null) {
            return null;
        }

        // 2. Verifica a lógica de negócio adicional
        boolean jaEscolheu = entity.getPessoa() != null &&
                IDsQueJaEscolheram != null &&
                IDsQueJaEscolheram.contains(entity.getPessoa().getId());

        // 3. Usa o toBuilder() para criar uma nova instância com o campo preenchido
        return dto.toBuilder()
                .jaEscolheu(jaEscolheu)
                .build();
    }

    /**
     * Converte de DTO para Entidade (Front -> Back)
     */
    public static EventoPessoa fromDto(EventoPessoaDto dto) {
        if (dto == null) {
            return null;
        }

        EventoPessoa entity = new EventoPessoa();

        entity.setId(dto.getId());

        // Mapeia o ID do pessoa para uma instância de Pessoa
        if (dto.getPessoa() != null) {
            entity.setPessoa(PessoaMapper.fromDto(dto.getPessoa()));
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
    public static List<EventoPessoaDto> toDtoList(List<EventoPessoa> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }
        return entities.stream()
                .map(EventoPessoaMapper::toDto)
                .collect(Collectors.toList());
    }

    public static List<EventoPessoaDto> toDtoList(List<EventoPessoa> entidades, Set<Long> IDsQueJaEscolheram) {
        return entidades.stream()
                .map(ep -> toDto(ep, IDsQueJaEscolheram))
                .collect(Collectors.toList());
    }

    /**
     * Converte lista de DTOs para lista de Entidades
     */
    public static List<EventoPessoa> fromDtoList(List<EventoPessoaDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return new ArrayList<>();
        }
        return dtos.stream()
                .map(EventoPessoaMapper::fromDto)
                .collect(Collectors.toList());
    }
}
