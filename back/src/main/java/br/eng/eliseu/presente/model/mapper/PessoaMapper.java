package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.Pessoa;
import br.eng.eliseu.presente.model.Cliente;
import br.eng.eliseu.presente.model.dto.PessoaDto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PessoaMapper {

    /**
     * Entidade -> DTO
     */
    public PessoaDto toDto(Pessoa pessoa) {
        if (pessoa == null) return null;

        return new PessoaDto(
                pessoa.getId(),
                pessoa.getCliente() != null ? pessoa.getCliente().getId() : null,
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
                pessoa.getAlteradoEm()
        );
    }

    /**
     * DTO -> Entidade
     */
    public Pessoa fromDto(PessoaDto dto) {
        if (dto == null) return null;

        Pessoa pessoa = new Pessoa();
        // Em Records, acessamos como métodos: dto.id() em vez de dto.getId()
        pessoa.setId(dto.id());

        if (dto.clienteId() != null) {
            Cliente cliente = new Cliente();
            cliente.setId(dto.clienteId());
            pessoa.setCliente(cliente);
        }

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
    public List<PessoaDto> toDtoList(List<Pessoa> pessoas) {
        if (pessoas == null) return List.of();
        return pessoas.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}