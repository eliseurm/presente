package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.Cliente;
import br.eng.eliseu.presente.model.dto.ClienteDto;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ClienteMapper {

    public static ClienteDto toDto(Cliente entity) {
        if (entity == null) return null;

        return new ClienteDto(
                entity.getId(),
                entity.getNome(),
                entity.getEmail(),
                entity.getTelefone(),
                UsuarioMapper.toDto(entity.getUsuario()),
                entity.getAnotacoes(),
                entity.getStatus(),
                entity.getCriadoEm(),
                entity.getAlteradoEm(),
                entity.getVersion()
        );
    }

    public static Cliente fromDto(ClienteDto dto) {
        if (dto == null) return null;

        return fromDto(dto, null);
    }

    public static Cliente fromDto(ClienteDto dto, Cliente cliente) {
        if (dto == null) return null;

        if(cliente == null) {
            cliente = new Cliente();
        }

        cliente.setId(dto.id());
        cliente.setNome(dto.nome());
        cliente.setEmail(dto.email());
        cliente.setTelefone(dto.telefone());
        cliente.setAnotacoes(dto.anotacoes());
        cliente.setStatus(dto.status());
        cliente.setCriadoEm(dto.criadoEm());
        cliente.setAlteradoEm(dto.alteradoEm());
        cliente.setVersion(dto.version()); // Garante que a versão volte para a entidade

        if(dto.usuario() != null && !ObjectUtils.isEmpty(dto.usuario())) {
            cliente.setUsuario(UsuarioMapper.fromDto(dto.usuario()));
        }

        return cliente;
    }

    public static List<ClienteDto> toDtoList(List<Cliente> entities) {
        if (entities == null) return List.of();
        return entities.stream().map(ClienteMapper::toDto).collect(Collectors.toList());
    }

    public static List<Cliente> fromDtoList(List<ClienteDto> dtos) {
        if (dtos == null) return List.of();
        return dtos.stream().map(ClienteMapper::fromDto).collect(Collectors.toList());
    }

}
