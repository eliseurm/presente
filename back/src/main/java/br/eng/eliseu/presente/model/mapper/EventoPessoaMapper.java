package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.EventoPessoa;
import br.eng.eliseu.presente.model.Pessoa;
import br.eng.eliseu.presente.model.dto.EventoPessoaDto;
import lombok.Builder;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

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

        if (entity == null) return null;


        boolean jaEscolheu = entity.getPessoa() != null &&
                IDsQueJaEscolheram != null &&
                IDsQueJaEscolheram.contains(entity.getPessoa().getId());

        return EventoPessoaDto.builder()
                .id(entity.getId())
                .pessoa(PessoaMapper.toDto(entity.getPessoa())) // Aqui a Pessoa já deve estar em cache (Fetch)
                .status(entity.getStatus())
                .nomeMagicNumber(entity.getNomeMagicNumber())
                .jaEscolheu(jaEscolheu)
                .version(entity.getVersion())
                .build();
    }

    /**
     * Converte de DTO para Entidade (Front -> Back)
     */
    public static EventoPessoa fromDto(EventoPessoaDto dto) {
        return fromDto(dto, null);
    }

    public static EventoPessoa fromDto(EventoPessoaDto dto, EventoPessoa eventoPessoa) {
        if (dto == null || ObjectUtils.isEmpty(dto)) {
            return new EventoPessoa();
        }

        if (eventoPessoa == null) {
            eventoPessoa = new EventoPessoa();
        }

        eventoPessoa.setId(dto.getId());

        // Mapeia o ID do pessoa para uma instância de Pessoa
        if (dto.getPessoa() != null) {
            eventoPessoa.setPessoa(PessoaMapper.fromDto(dto.getPessoa(), eventoPessoa.getPessoa()));
        }

        eventoPessoa.setStatus(dto.getStatus());
        eventoPessoa.setNomeMagicNumber(dto.getNomeMagicNumber());

        return eventoPessoa;
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
