package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.Pessoa;
import br.eng.eliseu.presente.model.dto.PessoaDto;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

import java.util.List;
import java.util.Optional;
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

    public static Pessoa fromDto(PessoaDto dto, Pessoa pessoaExistente) {
        if (dto == null || ObjectUtils.isEmpty(dto)) {
            return null;
        }

        // Criamos uma nova variável final que recebe ou a existente ou uma nova
        final Pessoa pessoaFinal = (pessoaExistente != null) ? pessoaExistente : new Pessoa();

        // Agora a Lambda funciona porque a variável 'pessoa' é final
        Optional.ofNullable(dto.cliente())
                .ifPresent(c -> pessoaFinal.setCliente(ClienteMapper.fromDto(c, pessoaFinal.getCliente())));

        Optional.ofNullable(dto.nome()).ifPresent(pessoaFinal::setNome);
        Optional.ofNullable(dto.cpf()).ifPresent(pessoaFinal::setCpf);
        Optional.ofNullable(dto.telefone()).ifPresent(pessoaFinal::setTelefone);
        Optional.ofNullable(dto.email()).ifPresent(pessoaFinal::setEmail);
        Optional.ofNullable(dto.endereco()).ifPresent(pessoaFinal::setEndereco);
        Optional.ofNullable(dto.complemento()).ifPresent(pessoaFinal::setComplemento);
        Optional.ofNullable(dto.cidade()).ifPresent(pessoaFinal::setCidade);
        Optional.ofNullable(dto.estado()).ifPresent(pessoaFinal::setEstado);
        Optional.ofNullable(dto.cep()).ifPresent(pessoaFinal::setCep);
        Optional.ofNullable(dto.senha()).ifPresent(pessoaFinal::setSenha);
        Optional.ofNullable(dto.status()).ifPresent(pessoaFinal::setStatus);
        Optional.ofNullable(dto.criadoEm()).ifPresent(pessoaFinal::setCriadoEm);
        Optional.ofNullable(dto.alteradoEm()).ifPresent(pessoaFinal::setAlteradoEm);

        return pessoaFinal;
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