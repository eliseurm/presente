package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.*;
import br.eng.eliseu.presente.model.dto.EventoDTO;
import br.eng.eliseu.presente.model.dto.EventoPessoaDTO;
import br.eng.eliseu.presente.model.dto.EventoProdutoDTO;
import br.eng.eliseu.presente.repository.ClienteRepository;
import br.eng.eliseu.presente.repository.EventoEscolhaRepository;
import br.eng.eliseu.presente.repository.PessoaRepository;
import br.eng.eliseu.presente.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class EventoMapper {

    @Autowired EventoEscolhaRepository eventoEscolhaRepository;
    @Autowired ClienteRepository clienteRepository;
    @Autowired PessoaRepository pessoaRepository;
    @Autowired ProdutoRepository produtoRepository;

    // Construtor para injeção de dependências
    @Autowired
    public EventoMapper(EventoEscolhaRepository eventoEscolhaRepository,
                        ClienteRepository clienteRepository,
                        PessoaRepository pessoaRepository,
                        ProdutoRepository produtoRepository) {
        this.eventoEscolhaRepository = eventoEscolhaRepository;
        this.clienteRepository = clienteRepository;
        this.pessoaRepository = pessoaRepository;
        this.produtoRepository = produtoRepository;
    }

    // Método para converter Entidade Evento para DTO
    public EventoDTO toDTO(Evento e) {
        if (e == null) return null;

        // Lógica de Negócio: Carrega em lote as escolhas ATIVAS para este evento
        Set<Long> pessoasQueJaEscolheram = Optional
                .ofNullable(eventoEscolhaRepository.findByEvento_IdAndStatus(e.getId(), StatusEnum.ATIVO))
                .orElseGet(List::of)
                .stream()
                .map(ev -> ev.getPessoa() != null ? ev.getPessoa().getId() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Mapeamento de Pessoas (usando a lógica de negócio acima)
        List<EventoPessoaDTO> pessoasDTO = Optional.ofNullable(e.getEventoPessoas()).orElseGet(List::of).stream()
                .filter(Objects::nonNull)
                .map(ep -> EventoPessoaDTO.builder()
                        .pessoaId(ep.getPessoa() != null ? ep.getPessoa().getId() : null)
                        .pessoaNome(ep.getPessoa() != null ? ep.getPessoa().getNome() : null)
                        .status(ep.getStatus())
                        .nomeMagicNumber(ep.getNomeMagicNumber())
                        .jaEscolheu(ep.getPessoa() != null && pessoasQueJaEscolheram.contains(ep.getPessoa().getId()))
                        .build())
                .collect(Collectors.toList());

        // Mapeamento de Produtos
        List<EventoProdutoDTO> produtosDTO = Optional.ofNullable(e.getEventoProdutos()).orElseGet(Set::of).stream()
                .filter(Objects::nonNull)
                .map(evPr -> EventoProdutoDTO.builder()
                        .produtoId(evPr.getProduto() != null ? evPr.getProduto().getId() : null)
                        .produtoNome(evPr.getProduto() != null ? evPr.getProduto().getNome() : null)
                        .status(evPr.getStatus())
                        .build())
                .collect(Collectors.toList());

        // Construção do DTO principal
        return EventoDTO.builder()
                .id(e.getId())
                .nome(e.getNome())
                .descricao(e.getDescricao())
                .clienteId(e.getCliente()!=null ? e.getCliente().getId() : null)
                .clienteNome(e.getCliente()!=null ? e.getCliente().getNome() : null)
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

    // Método para converter DTO para Entidade Evento (com acesso a repositórios)
    public Evento fromDTO(EventoDTO dto) {
        if (dto == null) return null;
        Evento.EventoBuilder builder = Evento.builder()
                .id(dto.getId())
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .status(dto.getStatus())
                .anotacoes(dto.getAnotacoes())
                .inicio(dto.getInicio())
                .fimPrevisto(dto.getFimPrevisto())
                .fim(dto.getFim())
                .version(dto.getVersion());

        // Cliente (requer acesso ao clienteRepository)
        if (dto.getClienteId() != null) {
            clienteRepository.findById(dto.getClienteId()).ifPresent(builder::cliente);
        } else {
            builder.cliente(null);
        }

        Evento entidade = builder.build();

        // Pessoas (requer acesso ao pessoaRepository)
        if (dto.getEventoPessoas() != null) {
            List<EventoPessoa> pessoas = new ArrayList<>();
            for (EventoPessoaDTO pDto : dto.getEventoPessoas()) {
                if (pDto == null || pDto.getPessoaId() == null) continue;
                Pessoa pessoa = pessoaRepository.findById(pDto.getPessoaId()).orElse(null);
                if (pessoa == null) continue;
                EventoPessoa ep = EventoPessoa.builder()
                        .id(pDto.getId())
                        .evento(entidade)
                        .pessoa(pessoa)
                        .status(pDto.getStatus())
                        .nomeMagicNumber(pDto.getNomeMagicNumber())
                        .build();
                pessoas.add(ep);
            }
            entidade.setEventoPessoas(pessoas);
        }

        // Produtos (requer acesso ao produtoRepository)
        if (dto.getEventoProdutos() != null) {
            Set<EventoProduto> set = new HashSet<>();
            for (EventoProdutoDTO prDto : dto.getEventoProdutos()) {
                if (prDto == null || prDto.getProdutoId() == null) continue;
                Produto pr = produtoRepository.findById(prDto.getProdutoId()).orElse(null);
                if (pr == null) continue;
                EventoProduto evp = EventoProduto.builder()
                        .id(prDto.getId())
                        .evento(entidade)
                        .produto(pr)
                        .status(prDto.getStatus())
                        .build();
                set.add(evp);
            }
            entidade.setEventoProdutos(set);
        }

        return entidade;
    }
}