package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.Cliente;
import br.eng.eliseu.presente.model.dto.ClienteDto;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

import java.util.List;
import java.util.Optional;
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

    public static Cliente fromDto(ClienteDto dto, Cliente clienteExistente) {
        if (dto == null) return null;

        // Define a variável final para ser usada com segurança dentro das lambdas
        final Cliente clienteFinal = (clienteExistente != null) ? clienteExistente : new Cliente();

        // Mapeamento do objeto Usuario usando Lambda e a variável final 'cliente'
        Optional.ofNullable(dto.usuario())
                .filter(u -> !ObjectUtils.isEmpty(u))
                .ifPresent(u -> clienteFinal.setUsuario(UsuarioMapper.fromDto(u)));

        // Mapeamento condicional (só seta se o valor no DTO não for nulo)
        Optional.ofNullable(dto.id()).ifPresent(clienteFinal::setId);
        Optional.ofNullable(dto.nome()).ifPresent(clienteFinal::setNome);
        Optional.ofNullable(dto.email()).ifPresent(clienteFinal::setEmail);
        Optional.ofNullable(dto.telefone()).ifPresent(clienteFinal::setTelefone);
        Optional.ofNullable(dto.anotacoes()).ifPresent(clienteFinal::setAnotacoes);
        Optional.ofNullable(dto.status()).ifPresent(clienteFinal::setStatus);
        Optional.ofNullable(dto.criadoEm()).ifPresent(clienteFinal::setCriadoEm);
        Optional.ofNullable(dto.alteradoEm()).ifPresent(clienteFinal::setAlteradoEm);
        Optional.ofNullable(dto.version()).ifPresent(clienteFinal::setVersion);

        return clienteFinal;
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
