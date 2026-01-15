package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.Pessoa;
import br.eng.eliseu.presente.model.dto.PessoaDto;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PessoaMapper {

    /**
     * Entidade -> DTO
     */
    public static PessoaDto toDto(Pessoa pessoa) {
        if (pessoa == null) return null;

        return new PessoaDto(
                pessoa.getId(),
                ClienteMapper.toDto(pessoa.getCliente()),
                pessoa.getNome(),
                pessoa.getCpf(),
                pessoa.getTelefone(),
                pessoa.getEmail(),
                pessoa.getStatus() != null ? pessoa.getStatus() : null,
                pessoa.getEndereco(),
                pessoa.getComplemento(),
                pessoa.getCidade(),
                pessoa.getEstado(),
                pessoa.getCep(),
                pessoa.getSenha(),
                pessoa.getCriadoEm(),
                pessoa.getAlteradoEm(),
                pessoa.getVersion()
        );
    }

    /**
     * DTO -> Entidade
     */
    public static Pessoa fromDto(PessoaDto dto) {
        return fromDto(dto, null);
    }

    public static Pessoa fromDto(PessoaDto dto, Pessoa pessoa) {
        if (dto == null || ObjectUtils.isEmpty(dto)) {
            return null;
        }

        if(pessoa == null) {
            pessoa = new Pessoa();
        }

        pessoa.setId(dto.id());
        pessoa.setCliente(ClienteMapper.fromDto(dto.cliente(), pessoa.getCliente()));
        pessoa.setNome(dto.nome());
        pessoa.setCpf(dto.cpf());
        pessoa.setTelefone(dto.telefone());
        pessoa.setEmail(dto.email());
        pessoa.setEndereco(dto.endereco());
        pessoa.setComplemento(dto.complemento());
        pessoa.setCidade(dto.cidade());
        pessoa.setEstado(dto.estado());
        pessoa.setCep(dto.cep());
        pessoa.setSenha(dto.senha());
        pessoa.setStatus(dto.status());
        pessoa.setCriadoEm(dto.criadoEm());
        pessoa.setAlteradoEm(dto.alteradoEm());

        return pessoa;
    }

    /**
     * Lista de Entidades -> Lista de DTOs
     */
    public static List<PessoaDto> toDtoList(List<Pessoa> pessoas) {
        if (pessoas == null) return List.of();
        return pessoas.stream()
                .map(PessoaMapper::toDto)
                .collect(Collectors.toList());
    }
}