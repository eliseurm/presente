package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.*;
import br.eng.eliseu.presente.model.dto.EventoDto;
import br.eng.eliseu.presente.model.dto.EventoPessoaDto;
import br.eng.eliseu.presente.model.dto.EventoProdutoDto;

import java.util.*;
import java.util.stream.Collectors;

public class EventoMapper {

    // --- TO DTO ---

    /**
     * Versão simplificada: mapeia o evento sem a lógica de 'jaEscolheu'
     */
    public static EventoDto toDTO(Evento e) {
        return toDTO(e, Collections.emptySet(), false);
    }

    /**
     * Versão sobrecarregada: recebe a lista de IDs de quem já escolheu vinda do Service
     */
    public static EventoDto toDTO(Evento e, Set<Long> pessoasQueJaEscolheram, Boolean completo) {
        if (e == null) return null;

        // Mapeamento de Pessoas usando o Mapper específico (que agora lida com jaEscolheu)
        List<EventoPessoaDto> pessoasDTO = completo ? EventoPessoaMapper.toDtoList(e.getEventoPessoas(), pessoasQueJaEscolheram) : null;

        // Mapeamento de Produtos usando o Mapper específico
        List<EventoProdutoDto> produtosDTO = completo ? EventoProdutoMapper.toDtoList(Optional.ofNullable(e.getEventoProdutos()).orElseGet(Set::of).stream().toList()) : null;

        return EventoDto.builder()
                .id(e.getId())
                .nome(e.getNome())
                .descricao(e.getDescricao())
                .clienteId(e.getCliente() != null ? e.getCliente().getId() : null)
                .clienteNome(e.getCliente() != null ? e.getCliente().getNome() : null)
                .status(e.getStatus())
                .anotacoes(e.getAnotacoes())
                .inicio(e.getInicio())
                .fimPrevisto(e.getFimPrevisto())
                .fim(e.getFim())
                .eventoPessoas(pessoasDTO)
                .eventoProdutos(produtosDTO)
                .version(e.getVersion())
                .build();
    }

    public static List<EventoDto> toDTOList(List<Evento> eventos) {
        return Optional.ofNullable(eventos).orElseGet(List::of).stream()
                .map(EventoMapper::toDTO)
                .collect(Collectors.toList());
    }

    // --- FROM DTO ---

    /**
     * Converte DTO para Entidade.
     * Como o método é estático, as entidades dependentes (Cliente, Pessoa, Produto)
     * devem ser instanciadas apenas com ID para que o JPA as associe ou
     * resolva via EntityManager.
     */
    public static Evento fromDTO(EventoDto dto) {
        if (dto == null) return null;

        Evento entidade = Evento.builder()
                .id(dto.getId())
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .status(dto.getStatus())
                .anotacoes(dto.getAnotacoes())
                .inicio(dto.getInicio())
                .fimPrevisto(dto.getFimPrevisto())
                .fim(dto.getFim())
                .version(dto.getVersion())
                .build();

        // Mapeamento de Cliente (Apenas referência por ID)
        if (dto.getClienteId() != null) {
            entidade.setCliente(Cliente.builder().id(dto.getClienteId()).build());
        }

        // Mapeamento de Pessoas (Criação de referências)
        if (dto.getEventoPessoas() != null) {
            entidade.setEventoPessoas(dto.getEventoPessoas().stream()
                    .filter(pDto -> pDto != null && pDto.getPessoa() != null)
                    .map(pDto -> EventoPessoa.builder()
                            .id(pDto.getId())
                            .evento(entidade)
                            .pessoa(Pessoa.builder().id(pDto.getPessoa().id()).build())
                            .status(pDto.getStatus())
                            .nomeMagicNumber(pDto.getNomeMagicNumber())
                            .build())
                    .collect(Collectors.toList()));
        }

        // Mapeamento de Produtos (Criação de referências)
        if (dto.getEventoProdutos() != null) {
            entidade.setEventoProdutos(dto.getEventoProdutos().stream()
                    .filter(prDto -> prDto != null && prDto.getProduto() != null)
                    .map(prDto -> EventoProduto.builder()
                            .id(prDto.getId())
                            .evento(entidade)
                            .produto(Produto.builder().id(prDto.getProduto().id()).build())
                            .status(prDto.getStatus())
                            .build())
                    .collect(Collectors.toSet()));
        }

        return entidade;
    }

    public static List<Evento> fromDTOList(List<EventoDto> dtos) {
        return Optional.ofNullable(dtos).orElseGet(List::of).stream()
                .map(EventoMapper::fromDTO)
                .collect(Collectors.toList());
    }

}