package br.eng.eliseu.presente.service;

import br.eng.eliseu.presente.model.*;
import br.eng.eliseu.presente.model.filter.EventoFilter;
import br.eng.eliseu.presente.repository.ClienteRepository;
import br.eng.eliseu.presente.repository.EventoRepository;
import br.eng.eliseu.presente.repository.PessoaRepository;
import br.eng.eliseu.presente.repository.ProdutoRepository;
import br.eng.eliseu.presente.service.api.AbstractCrudService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventoService extends AbstractCrudService<Evento, Long, EventoFilter> {

    private final EventoRepository eventoRepository;
    private final PessoaRepository pessoaRepository;
    private final ProdutoRepository produtoRepository;
    private final ClienteRepository clienteRepository;

    @Override
    protected EventoRepository getRepository() {
        return eventoRepository;
    }

    // ================= Vínculos: Pessoas =================

    @Transactional
    public EventoPessoa addOrUpdatePessoa(Long eventoId, Long pessoaId, StatusEnum status) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado: " + eventoId));

        Pessoa pessoa = pessoaRepository.findById(pessoaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pessoa não encontrada: " + pessoaId));

        if (evento.getPessoas() == null) {
            evento.setPessoas(new ArrayList<>());
        }

        // procura vínculo existente por pessoa
        EventoPessoa vinculo = evento.getPessoas().stream()
                .filter(ep -> ep.getPessoa() != null && Objects.equals(ep.getPessoa().getId(), pessoa.getId()))
                .findFirst()
                .orElse(null);

        if (vinculo == null) {
            vinculo = EventoPessoa.builder()
                    .evento(evento)
                    .pessoa(pessoa)
                    .status(status)
                    .build();
            evento.getPessoas().add(vinculo);
        } else {
            vinculo.setStatus(status);
        }

        eventoRepository.save(evento);
        return vinculo;
    }

    @Transactional
    public EventoPessoa updatePessoaVinculo(Long eventoId, Long eventoPessoaId, StatusEnum status) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado: " + eventoId));

        if (evento.getPessoas() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo de pessoa não encontrado no evento");
        }

        EventoPessoa vinculo = evento.getPessoas().stream()
                .filter(ep -> Objects.equals(ep.getId(), eventoPessoaId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo pessoa não encontrado: " + eventoPessoaId));

        vinculo.setStatus(status);
        eventoRepository.save(evento);
        return vinculo;
    }

    @Transactional
    public void removePessoaVinculo(Long eventoId, Long eventoPessoaId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado: " + eventoId));

        if (evento.getPessoas() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo de pessoa não encontrado no evento");
        }

        boolean removed = evento.getPessoas().removeIf(ep -> Objects.equals(ep.getId(), eventoPessoaId));
        if (!removed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo pessoa não encontrado: " + eventoPessoaId);
        }
        eventoRepository.save(evento); // orphanRemoval cuidará da deleção
    }

    // ================= Vínculos: Produtos =================

    @Transactional
    public EventoProduto addOrUpdateProduto(Long eventoId, Long produtoId, StatusEnum status) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado: " + eventoId));

        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado: " + produtoId));

        if (evento.getProdutos() == null) {
            evento.setProdutos(new HashSet<>());
        }

        // procura vínculo existente por produto
        EventoProduto probe = EventoProduto.builder().evento(evento).produto(produto).build();
        EventoProduto vinculo = evento.getProdutos().stream()
                .filter(ep -> ep.getProduto() != null && Objects.equals(ep.getProduto().getId(), produto.getId()))
                .findFirst()
                .orElse(null);

        if (vinculo == null) {
            vinculo = EventoProduto.builder()
                    .evento(evento)
                    .produto(produto)
                    .status(status)
                    .build();
            evento.getProdutos().add(vinculo);
        } else {
            vinculo.setStatus(status);
        }

        eventoRepository.save(evento);
        return vinculo;
    }

    @Transactional
    public EventoProduto updateProdutoVinculo(Long eventoId, Long eventoProdutoId, StatusEnum status) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado: " + eventoId));

        if (evento.getProdutos() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo de produto não encontrado no evento");
        }

        EventoProduto vinculo = evento.getProdutos().stream()
                .filter(ep -> Objects.equals(ep.getId(), eventoProdutoId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo produto não encontrado: " + eventoProdutoId));

        vinculo.setStatus(status);
        eventoRepository.save(evento);
        return vinculo;
    }

    @Transactional
    public void removeProdutoVinculo(Long eventoId, Long eventoProdutoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado: " + eventoId));

        if (evento.getProdutos() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo de produto não encontrado no evento");
        }

        boolean removed = evento.getProdutos().removeIf(ep -> Objects.equals(ep.getId(), eventoProdutoId));
        if (!removed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo produto não encontrado: " + eventoProdutoId);
        }
        eventoRepository.save(evento);
    }

    @Override
    protected JpaSpecificationExecutor<Evento> getSpecificationExecutor() {
        return eventoRepository;
    }

    @Override
    protected Specification<Evento> buildSpecification(EventoFilter filtro) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (filtro.getNome() != null && !filtro.getNome().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("nome")), "%" + filtro.getNome().toLowerCase() + "%"));
            }
            if (filtro.getClienteId() != null) {
                predicates.add(cb.equal(root.get("cliente").get("id"), filtro.getClienteId()));
            }
            if (filtro.getStatus() != null && !filtro.getStatus().isBlank()) {
                predicates.add(cb.equal(root.get("status"), StatusEnum.valueOf(filtro.getStatus())));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // Garantir inicialização das coleções com Open-Session-In-View desabilitado
    @Override
    @Transactional(readOnly = true)
    public Page<Evento> listar(EventoFilter filtro) {
        Page<Evento> page = super.listar(filtro);
        // Inicializa coleções dentro da transação (evita LazyInitializationException na serialização)
        page.getContent().forEach(e -> {
            if (e.getPessoas() != null) {
                e.getPessoas().size();
            }
            if (e.getProdutos() != null) {
                e.getProdutos().size();
            }
        });
        return page;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Evento> buscarPorId(Long id) {
        Optional<Evento> opt = super.buscarPorId(id);
        opt.ifPresent(e -> {
            if (e.getPessoas() != null) {
                e.getPessoas().size();
            }
            if (e.getProdutos() != null) {
                e.getProdutos().size();
            }
        });
        return opt;
    }

    private void normalizarAssociacoes(Evento entidade) {
        if (entidade == null) return;

        // Cliente
        if (entidade.getCliente() != null && entidade.getCliente().getId() != null) {
            Long clienteId = entidade.getCliente().getId();
            clienteRepository.findById(clienteId).ifPresent(entidade::setCliente);
        }

        // Pessoas
        if (entidade.getPessoas() != null) {
            List<EventoPessoa> normalizadas = new ArrayList<>();
            for (EventoPessoa ep : entidade.getPessoas()) {
                if (ep == null) continue;
                ep.setEvento(entidade);
                Long pessoaId = ep.getPessoa() != null ? ep.getPessoa().getId() : null;
                if (pessoaId != null) {
                    pessoaRepository.findById(pessoaId).ifPresent(ep::setPessoa);
                    normalizadas.add(ep);
                }
            }
            entidade.setPessoas(normalizadas);
        }
        // Produtos (agora Set para evitar 'bag')
        if (entidade.getProdutos() != null) {
            Set<EventoProduto> normalizadas = new HashSet<>();
            for (EventoProduto eprod : entidade.getProdutos()) {
                if (eprod == null) continue;
                eprod.setEvento(entidade);
                Long produtoId = eprod.getProduto() != null ? eprod.getProduto().getId() : null;
                if (produtoId != null) {
                    produtoRepository.findById(produtoId).ifPresent(eprod::setProduto);
                    normalizadas.add(eprod);
                }
            }
            entidade.setProdutos(normalizadas);
        }
    }

    @Override
    protected void prepararParaCriacao(Evento entidade) {
        entidade.setId(null);
        normalizarAssociacoes(entidade);
    }

    @Override
    protected void prepararParaAtualizacao(Long id, Evento entidade, Evento entidadeExistente) {
        // Primeiro normaliza associações no objeto "entidade" para obter referências gerenciadas
        normalizarAssociacoes(entidade);

        // Atualiza campos simples e referências já normalizadas
        entidadeExistente.setNome(entidade.getNome());
        entidadeExistente.setDescricao(entidade.getDescricao());
        entidadeExistente.setCliente(entidade.getCliente());
        entidadeExistente.setStatus(entidade.getStatus());
        entidadeExistente.setAnotacoes(entidade.getAnotacoes());
        entidadeExistente.setInicio(entidade.getInicio());
        entidadeExistente.setFimPrevisto(entidade.getFimPrevisto());
        entidadeExistente.setFim(entidade.getFim());

        // Sincroniza listas com as coleções normalizadas
        if (entidadeExistente.getPessoas() == null) {
            entidadeExistente.setPessoas(new ArrayList<>());
        }
        entidadeExistente.getPessoas().clear();
        if (entidade.getPessoas() != null) {
            entidadeExistente.getPessoas().addAll(entidade.getPessoas());
        }
        if (entidadeExistente.getProdutos() == null) {
            entidadeExistente.setProdutos(new HashSet<>());
        }
        entidadeExistente.getProdutos().clear();
        if (entidade.getProdutos() != null) {
            entidadeExistente.getProdutos().addAll(entidade.getProdutos());
        }
    }

    public int importarPessoasCsv(Long eventoId, MultipartFile file) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado: " + eventoId));

        List<EventoPessoa> adicionados = parseCsvEventoPessoa(file).stream()
                .map(ep -> {
                    ep.setEvento(evento);
                    // Substitui se já existir mesma pessoa no evento
                    evento.getPessoas().removeIf(existing -> existing.getPessoa().getId().equals(ep.getPessoa().getId()));
                    evento.getPessoas().add(ep);
                    return ep;
                })
                .collect(Collectors.toList());

        eventoRepository.save(evento);
        return adicionados.size();
    }

    private List<EventoPessoa> parseCsvEventoPessoa(MultipartFile file) {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String header = br.readLine();
            if (header == null) return List.of();
            String[] cols = header.split(",");
            int idxPessoaId = -1;
            int idxStatus = -1;
            for (int i = 0; i < cols.length; i++) {
                String c = cols[i].trim().toLowerCase();
                if (c.equals("pessoaid") || c.equals("pessoa_id") || c.equals("pessoa")) idxPessoaId = i;
                if (c.equals("status")) idxStatus = i;
            }
            if (idxPessoaId == -1) {
                throw new RuntimeException("CSV inválido: coluna pessoaId não encontrada");
            }
            List<EventoPessoa> list = new ArrayList<>();
            String line;
            while ((line = br.readLine()) != null) {
                if (line.isBlank()) continue;
                String[] parts = line.split(",");
                Long pessoaId = Long.parseLong(parts[idxPessoaId].trim());
                Pessoa pessoa = pessoaRepository.findById(pessoaId)
                        .orElseThrow(() -> new RuntimeException("Pessoa não encontrada: " + pessoaId));
                EventoPessoa ep = EventoPessoa.builder()
                        .pessoa(pessoa)
                        .status(idxStatus >= 0 && parts.length > idxStatus && !parts[idxStatus].isBlank() ? StatusEnum.valueOf(parts[idxStatus].trim()) : null)
                        .build();
                list.add(ep);
            }
            return list;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao ler CSV: " + e.getMessage(), e);
        }
    }
}
