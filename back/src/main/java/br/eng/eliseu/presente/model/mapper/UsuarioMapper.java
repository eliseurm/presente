package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.Usuario;
import br.eng.eliseu.presente.model.dto.UsuarioDto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UsuarioMapper {

    public static UsuarioDto toDto(Usuario entity) {
        if (entity == null) return null;

        return new UsuarioDto(
                entity.getId(),
                entity.getUsername(),
                null, // Nunca enviamos a senha ou o hash para o frontend
                entity.getPapel(),
                entity.getStatus(),
                entity.getCriadoEm(),
                entity.getAlteradoEm(),
                entity.getVersion()
        );
    }

    public static Usuario fromDto(UsuarioDto dto) {
        if (dto == null) return null;

        Usuario entity = new Usuario();
        entity.setId(dto.id());
        entity.setUsername(dto.username());
        entity.setSenha(dto.senha()); // Seta o campo @Transient para o Service processar o Hash
        entity.setPapel(dto.papel());
        entity.setStatus(dto.status());
        entity.setCriadoEm(dto.criadoEm());
        entity.setAlteradoEm(dto.alteradoEm());
        entity.setVersion(dto.version());

        return entity;
    }

    public static List<UsuarioDto> toDtoList(List<Usuario> entities) {
        if (entities == null) return List.of();
        return entities.stream()
                .map(UsuarioMapper::toDto)
                .collect(Collectors.toList());
    }

    public static List<Usuario> fromDtoList(List<UsuarioDto> dtos) {
        if (dtos == null) return List.of();
        return dtos.stream()
                .map(UsuarioMapper::fromDto)
                .collect(Collectors.toList());
    }
}

