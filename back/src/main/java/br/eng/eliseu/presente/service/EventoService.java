package br.eng.eliseu.presente.service;

import br.eng.eliseu.presente.model.*;
import br.eng.eliseu.presente.model.filter.EventoFilter;
import br.eng.eliseu.presente.model.filter.EventoPessoaFilter;
import br.eng.eliseu.presente.model.filter.EventoReportFilter;
import br.eng.eliseu.presente.model.mapper.EventoMapper;
import br.eng.eliseu.presente.model.mapper.EventoPessoaMapper;
import br.eng.eliseu.presente.model.mapper.PessoaMapper;
import br.eng.eliseu.presente.repository.ClienteRepository;
import br.eng.eliseu.presente.repository.EventoRepository;
import br.eng.eliseu.presente.repository.PessoaRepository;
import br.eng.eliseu.presente.repository.ProdutoRepository;
import br.eng.eliseu.presente.repository.EventoPessoaRepository;
import br.eng.eliseu.presente.repository.EventoEscolhaRepository;
import br.eng.eliseu.presente.service.api.AbstractCrudService;
import br.eng.eliseu.presente.model.dto.*;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventoService extends AbstractCrudService<Evento, Long, EventoFilter> {

    @PersistenceContext private EntityManager entityManager;
    @Autowired private PlatformTransactionManager transactionManager;

    private final EventoRepository eventoRepository;
    private final PessoaRepository pessoaRepository;
    private final ProdutoRepository produtoRepository;
    private final ClienteRepository clienteRepository;
    private final EventoPessoaRepository eventoPessoaRepository;
    private final EventoEscolhaRepository eventoEscolhaRepository;

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    private Thread thread;

    @Override
    protected EventoRepository getRepository() {
        return eventoRepository;
    }

    // ================= Vínculos: Pessoas =================

    @Transactional
    public EventoPessoa addOrUpdateEventoPessoa(Long eventoId, EventoPessoaDto eventoPessoaDto) {

        if(ObjectUtils.isEmpty(eventoPessoaDto)){
            return null;
        }

        // 1. Busca o Evento (Pai)
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado: " + eventoId));

        EventoPessoa eventoPessoa;

        // 2. Lógica para EventoPessoa (A relação entre Evento e Pessoa)
        if (eventoPessoaDto.getId() != null) {
            // Se tem ID, buscamos a existente para atualizar (Merge manual)

            EventoPessoaFilter filter = new EventoPessoaFilter();
            filter.setId(eventoPessoaDto.getId());
            eventoPessoa = eventoPessoaRepository.findByIdWithPessoa(filter)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Associação não encontrada: " + eventoPessoaDto.getId()));

            // Merge do dto
            eventoPessoa = EventoPessoaMapper.fromDto(eventoPessoaDto, eventoPessoa);
        }
        else {
            // Se não tem ID, criamos uma nova instância e associamos ao evento
            eventoPessoa = EventoPessoaMapper.fromDto(eventoPessoaDto);
            eventoPessoa.setEvento(evento);


            Pessoa pessoa;
            if (eventoPessoaDto.getPessoa() != null && eventoPessoaDto.getPessoa().id() != null) {
                // Busca a pessoa no banco para garantir que temos a versão com o campo '@Version' correto
                pessoa = pessoaRepository.findById(eventoPessoaDto.getPessoa().id())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pessoa não encontrada, id: " + eventoPessoaDto.getPessoa().id()));

                // Merge manual da pessoa
                pessoa = PessoaMapper.fromDto(eventoPessoaDto.getPessoa(), pessoa);
            }
            else {
                // Se for uma pessoa totalmente nova (sem ID no DTO da pessoa)
                pessoa = PessoaMapper.fromDto(eventoPessoaDto.getPessoa());
                if(pessoa != null) {
                    pessoa = pessoaRepository.save(pessoa);
                }
            }

            eventoPessoa.setPessoa(pessoa);

        }

        eventoPessoa = eventoPessoaRepository.save(eventoPessoa);
        return eventoPessoa;
    }

    @Transactional
    public EventoPessoa updatePessoaVinculo(Long eventoId, Long eventoPessoaId, StatusEnum status) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado: " + eventoId));

        if (evento.getEventoPessoas() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo de pessoa não encontrado no evento");
        }

        EventoPessoa vinculo = evento.getEventoPessoas().stream()
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

        if (evento.getEventoPessoas() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo de pessoa não encontrado no evento");
        }

        boolean removed = evento.getEventoPessoas().removeIf(ep -> Objects.equals(ep.getId(), eventoPessoaId));
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

        if (evento.getEventoProdutos() == null) {
            evento.setEventoProdutos(new HashSet<>());
        }

        // procura vínculo existente por produto
        EventoProduto probe = EventoProduto.builder().evento(evento).produto(produto).build();
        EventoProduto vinculo = evento.getEventoProdutos().stream()
                .filter(ep -> ep.getProduto() != null && Objects.equals(ep.getProduto().getId(), produto.getId()))
                .findFirst()
                .orElse(null);

        if (vinculo == null) {
            vinculo = EventoProduto.builder()
                    .evento(evento)
                    .produto(produto)
                    .status(status)
                    .build();
            evento.getEventoProdutos().add(vinculo);
        } else {
            vinculo.setStatus(status);
        }

        eventoRepository.save(evento);
        return vinculo;
    }

    // ================= Controle do Evento: Iniciar/Parar =================

    @Transactional
    public Map<String, Object> iniciarEvento(Long eventoId, String baseUrl) {
        Evento evento = eventoRepository.findByIdExpandedAll(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado: " + eventoId));

        if (evento.getEventoPessoas() == null || evento.getEventoPessoas().isEmpty()) {
            return Map.of("gerados", 0, "links", List.of());
        }

        int gerados = 0;
        List<String> links = new ArrayList<>();

        for (EventoPessoa ep : evento.getEventoPessoas()) {
            if (ep == null) continue;
            if (ep.getStatus() == StatusEnum.ATIVO) {
                if (ep.getNomeMagicNumber() == null || ep.getNomeMagicNumber().isBlank()) {
                    String token = gerarNomeMagicNumber(ep.getPessoa());
                    ep.setNomeMagicNumber(token);
                    gerados++;
                    if (baseUrl != null && !baseUrl.isBlank()) {
                        links.add(formatarLink(baseUrl, token));
                    }
                }
            }
        }

        if (evento.getInicio() == null) {
            evento.setInicio(java.time.LocalDateTime.now());
        }

        eventoRepository.save(evento);
        return Map.of(
                "gerados", gerados,
                "links", links
        );
    }

    @Transactional
    public Map<String, Object> pausarEvento(Long eventoId) {

        Evento evento = eventoRepository.findByIdExpandedAll(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado: " + eventoId));

        if (evento.getEventoPessoas() == null || evento.getEventoPessoas().isEmpty()) {
            return Map.of("pausados", 0);
        }

        int pausados = 0;
        for (EventoPessoa ep : evento.getEventoPessoas()) {
            if (ep == null) continue;
            if (ep.getNomeMagicNumber() != null && !ep.getNomeMagicNumber().isBlank()) {
                if (ep.getStatus() != StatusEnum.PAUSADO) {
                    ep.setStatus(StatusEnum.PAUSADO);
                    pausados++;
                }
            }
        }

//        evento.setFim(java.time.LocalDateTime.now());
        eventoRepository.save(evento);
        return Map.of("pausados", pausados);
    }

    @Transactional
    public EventoDto pararEvento(Long eventoId) {

        Evento evento = eventoRepository.findByIdExpandedAll(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado: " + eventoId));

        evento.setFim(java.time.LocalDateTime.now());
        evento = eventoRepository.save(evento);

        return EventoMapper.toDTO(evento);
    }

    private static String gerarNomeMagicNumber(Pessoa pessoa) {
        String primeiroNome = "";
        if (pessoa != null && pessoa.getNome() != null) {
            String[] partes = pessoa.getNome().trim().split("\\s+");
            if (partes.length > 0) primeiroNome = partes[0];
        }
        if (primeiroNome.isBlank()) primeiroNome = "Convidado";

        String code8 = gerarCodigoAlfaNum(8);
        return primeiroNome + "_" + code8;
    }

    private static String gerarCodigoAlfaNum(int tam) {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem confusões como I, O, 0, 1
        StringBuilder sb = new StringBuilder(tam);
        java.util.concurrent.ThreadLocalRandom rnd = java.util.concurrent.ThreadLocalRandom.current();
        for (int i = 0; i < tam; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private static String formatarLink(String baseUrl, String token) {
        String base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        return base + "/presente/" + token;
    }

    @Transactional
    public EventoProduto updateProdutoVinculo(Long eventoId, Long eventoProdutoId, StatusEnum status) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado: " + eventoId));

        if (evento.getEventoProdutos() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo de produto não encontrado no evento");
        }

        EventoProduto vinculo = evento.getEventoProdutos().stream()
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

        if (evento.getEventoProdutos() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo de produto não encontrado no evento");
        }

        boolean removed = evento.getEventoProdutos().removeIf(ep -> Objects.equals(ep.getId(), eventoProdutoId));
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
            if (filtro.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filtro.getStatus()));
            }

            // Suporte condicional a expand na listagem
            // Quando expand contém relações, aplicamos fetch joins para evitar LazyInitializationException
            String expand = filtro.getExpand();
            if (expand != null && !expand.isBlank()) {
                String csv = expand;
                // normaliza para comparação simples
                java.util.Set<String> exps = java.util.Arrays.stream(csv.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(String::toLowerCase)
                        .collect(java.util.stream.Collectors.toSet());

                boolean distinct = false;
                if (exps.contains("cliente")) {
                    root.fetch("cliente", jakarta.persistence.criteria.JoinType.LEFT);
                }
                if (exps.contains("pessoas")) {
                    var pessoasFetch = root.fetch("pessoas", jakarta.persistence.criteria.JoinType.LEFT);
                    try { pessoasFetch.fetch("pessoa", jakarta.persistence.criteria.JoinType.LEFT); } catch (IllegalArgumentException ignored) {}
                    distinct = true; // to-many
                }
                if (exps.contains("produtos")) {
                    var produtosFetch = root.fetch("produtos", jakarta.persistence.criteria.JoinType.LEFT);
                    try { produtosFetch.fetch("produto", jakarta.persistence.criteria.JoinType.LEFT); } catch (IllegalArgumentException ignored) {}
                    distinct = true; // to-many
                }
                if (distinct) {
                    query.distinct(true);
                }
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
            if (e.getEventoPessoas() != null) {
                e.getEventoPessoas().size();
                // Inicializa referências aninhadas necessárias para a serialização
                for (EventoPessoa ep : e.getEventoPessoas()) {
                    try {
                        if (ep != null && ep.getPessoa() != null) {
                            ep.getPessoa().getId(); // toca o proxy para inicializar
                        }
                    } catch (Exception ignore) {}
                }
            }
            if (e.getEventoProdutos() != null) {
                e.getEventoProdutos().size();
                // Inicializa referências aninhadas necessárias para a serialização
                for (EventoProduto epr : e.getEventoProdutos()) {
                    try {
                        if (epr != null && epr.getProduto() != null) {
                            epr.getProduto().getId(); // toca o proxy para inicializar
                        }
                    } catch (Exception ignore) {}
                }
            }
            if (e.getEventoEscolhas() != null) {
                e.getEventoEscolhas().size();
            }
            // Inicializa cliente (caso esteja lazy)
            try {
                if (e.getCliente() != null) e.getCliente().getId();
            }
            catch (Exception ignore) {}
        });
        return page;
    }

    // Suporte ao expand para GET /evento/{id}?expand=...
    @Override
    @Transactional(readOnly = true)
    public Optional<Evento> buscarPorIdComExpand(Long id, String expand) {
        boolean hasExpand = expand != null && !expand.isBlank();
        if (!hasExpand) {
//            return buscarPorId(id);
            return super.buscarPorId(id);
        }
        // Carrega a entidade base e inicializa coleções solicitadas evitando fetch join múltiplo
        Optional<Evento> opt = eventoRepository.findById(id);
        opt.ifPresent(e -> {
            String csv = expand.toLowerCase();
            if (csv.contains("pessoas") && e.getEventoPessoas() != null) {
                // Inicializa a coleção e suas dependências necessárias para serialização
                e.getEventoPessoas().size();
                for (EventoPessoa ep : e.getEventoPessoas()) {
                    try { if (ep != null && ep.getPessoa() != null) { ep.getPessoa().getId(); } } catch (Exception ignore) {}
                }
            }
            if (csv.contains("produtos") && e.getEventoProdutos() != null) {
                // Inicializa a coleção e suas dependências necessárias para serialização
                e.getEventoProdutos().size();
                for (EventoProduto epr : e.getEventoProdutos()) {
                    try { if (epr != null && epr.getProduto() != null) { epr.getProduto().getId(); } } catch (Exception ignore) {}
                }
            }
            if (csv.contains("cliente") && e.getCliente() != null) {
                // nada a fazer – já carregado por proxy ao acessar algum campo, mas garantimos acesso
                e.getCliente().getId();
            }
        });
        return opt;
    }

/*
    private void normalizarAssociacoes(Evento entidade) {
        if (entidade == null) return;

        // Cliente
        if (entidade.getCliente() != null && entidade.getCliente().getId() != null) {
            Long clienteId = entidade.getCliente().getId();
            clienteRepository.findById(clienteId).ifPresent(entidade::setCliente);
        }

        // Pessoas
        if (entidade.getEventoPessoas() != null) {
            // Deduplica por pessoaId (última ocorrência prevalece)
            Map<Long, EventoPessoa> byPessoa = new LinkedHashMap<>();
            for (EventoPessoa ep : entidade.getEventoPessoas()) {
                if (ep == null) continue;
                Long pessoaId = ep.getPessoa() != null ? ep.getPessoa().getId() : null;
                if (pessoaId == null) continue;
                // Converte referência para gerenciada
                pessoaRepository.findById(pessoaId).ifPresent(ep::setPessoa);
                byPessoa.put(pessoaId, ep);
            }
            entidade.setEventoPessoas(new ArrayList<>(byPessoa.values()));
            // back-reference será ajustada no prepararParaAtualizacao para a entidadeExistente
        }
        // Produtos (agora Set para evitar 'bag')
        if (entidade.getEventoProdutos() != null) {
            Set<EventoProduto> normalizadas = new HashSet<>();
            for (EventoProduto eprod : entidade.getEventoProdutos()) {
                if (eprod == null) continue;
                Long produtoId = eprod.getProduto() != null ? eprod.getProduto().getId() : null;
                if (produtoId == null) continue;
                produtoRepository.findById(produtoId).ifPresent(eprod::setProduto);
                normalizadas.add(eprod);
            }
            entidade.setEventoProdutos(normalizadas);
            // back-reference será ajustada no prepararParaAtualizacao para a entidadeExistente
        }
    }
*/

    private void normalizarAssociacoes(Evento evento) {
        // 1. CLIENTE: Use getReferenceById para evitar SELECT desnecessário e resolver o erro de Version null
        if (evento.getCliente() != null && evento.getCliente().getId() != null) {
            evento.setCliente(clienteRepository.getReferenceById(evento.getCliente().getId()));
        }

        // 2. PESSOAS: Busca em lote (Bulk Fetch) - Reduz N selects para apenas 1
        if (evento.getEventoPessoas() != null && !evento.getEventoPessoas().isEmpty()) {
            List<Long> pessoaIds = evento.getEventoPessoas().stream()
                    .map(ep -> ep.getPessoa().getId())
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();

            // Busca todas as pessoas de uma vez e coloca num mapa para acesso rápido (O(1))
            Map<Long, Pessoa> pessoasMap = pessoaRepository.findAllById(pessoaIds).stream()
                    .collect(Collectors.toMap(Pessoa::getId, p -> p));

            evento.getEventoPessoas().forEach(ep -> {
                ep.setEvento(evento);
                if (ep.getPessoa() != null && ep.getPessoa().getId() != null) {
                    Pessoa p = pessoasMap.get(ep.getPessoa().getId());
                    if (p != null) {
                        p.setNome(ep.getPessoa().getNome());
                        p.setCpf(ep.getPessoa().getCpf());
                        p.setEmail(ep.getPessoa().getEmail());
                        p.setTelefone(ep.getPessoa().getTelefone());

                        ep.setPessoa(p);
                    };
                }
//                if (ep.getNomeMagicNumber() == null) {
//                    ep.setNomeMagicNumber(UUID.randomUUID().toString());
//                }
            });
        }

        // 3. PRODUTOS: Mesma lógica de lote
        if (evento.getEventoProdutos() != null && !evento.getEventoProdutos().isEmpty()) {
            List<Long> produtoIds = evento.getEventoProdutos().stream()
                    .map(ep -> ep.getProduto().getId())
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();

            Map<Long, Produto> produtosMap = produtoRepository.findAllById(produtoIds).stream()
                    .collect(Collectors.toMap(Produto::getId, p -> p));

            evento.getEventoProdutos().forEach(ep -> {
                ep.setEvento(evento);
                if (ep.getProduto() != null && ep.getProduto().getId() != null) {
                    Produto prod = produtosMap.get(ep.getProduto().getId());
                    if (prod != null) ep.setProduto(prod);
                }
            });
        }
    }

    @Transactional(readOnly = true)
    public Page<EventoDto> listarDTO(EventoFilter filtro) {
        // PASSO 1: Busca a página de entidades 'Evento' do banco de dados
        Page<Evento> page = listar(filtro);

        // PASSO 2: Mapeamento de cada entidade para DTO
        return page.map(evento -> {
            // A conversão propriamente dita
            EventoDto dto = EventoMapper.toDTO(evento);
            return dto;
        });
    }

    @Transactional(readOnly = true)
    public Optional<EventoDto> buscarPorIdDTO(Long id, String expand) {
        return buscarPorIdComExpand(id, expand).map(EventoMapper::toDTO);
    }

    @Transactional
    public EventoDto criarDTO(EventoDto dto) {
        Evento e = EventoMapper.fromDTO(dto);
        Evento salvo = criar(e);
        return EventoMapper.toDTO(salvo);
    }

    @Transactional
    public Evento atualizarEvento(Long id, Evento evento) {
        return atualizar(id, evento);
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
        entidadeExistente.setAnotacoes(entidade.getAnotacoes());
        entidadeExistente.setInicio(entidade.getInicio());
        entidadeExistente.setFimPrevisto(entidade.getFimPrevisto());
        entidadeExistente.setFim(entidade.getFim());
        entidadeExistente.setStatus(entidade.getStatus());
        // Sincroniza coleções sem usar clear()+add(), evitando inserções duplicadas e violação de unique constraint
        // ===== Pessoas (List) =====
        if (entidadeExistente.getEventoPessoas() == null) {
            entidadeExistente.setEventoPessoas(new ArrayList<>());
        }
        List<EventoPessoa> existentesPessoa = entidadeExistente.getEventoPessoas();
        Map<Long, EventoPessoa> mapExistentesPorPessoa = new LinkedHashMap<>();
        for (EventoPessoa ep : existentesPessoa) {
            Long pessoaId = ep != null && ep.getPessoa() != null ? ep.getPessoa().getId() : null;
            if (pessoaId != null) mapExistentesPorPessoa.put(pessoaId, ep);
        }
        Map<Long, EventoPessoa> mapNovosPorPessoa = new LinkedHashMap<>();
        if (entidade.getEventoPessoas() != null) {
            for (EventoPessoa epNovo : entidade.getEventoPessoas()) {
                if (epNovo == null || epNovo.getPessoa() == null || epNovo.getPessoa().getId() == null) continue;
                mapNovosPorPessoa.put(epNovo.getPessoa().getId(), epNovo);
            }
        }
        // Atualiza existentes e remove os que não vieram no payload
        Iterator<EventoPessoa> itExistentes = existentesPessoa.iterator();
        while (itExistentes.hasNext()) {
            EventoPessoa atual = itExistentes.next();
            Long pessoaId = atual.getPessoa() != null ? atual.getPessoa().getId() : null;
            if (pessoaId == null || !mapNovosPorPessoa.containsKey(pessoaId)) {
                // remover vínculo ausente
                itExistentes.remove();
                continue;
            }
            // atualizar campos mutáveis do vínculo
            EventoPessoa fonte = mapNovosPorPessoa.get(pessoaId);
            atual.setStatus(fonte.getStatus());
            atual.setNomeMagicNumber(fonte.getNomeMagicNumber());
            // back-reference garantida
            atual.setEvento(entidadeExistente);
            // já consumido
            mapNovosPorPessoa.remove(pessoaId);
        }
        // Adiciona apenas os novos que não existiam
        for (Map.Entry<Long, EventoPessoa> entry : mapNovosPorPessoa.entrySet()) {
            EventoPessoa fonte = entry.getValue();
            EventoPessoa novo = new EventoPessoa();
            novo.setEvento(entidadeExistente);
            novo.setPessoa(fonte.getPessoa()); // referência já gerenciada em normalizarAssociacoes
            novo.setStatus(fonte.getStatus());
            novo.setNomeMagicNumber(fonte.getNomeMagicNumber());
            existentesPessoa.add(novo);
        }

        // ===== Produtos (Set) =====
        if (entidadeExistente.getEventoProdutos() == null) {
            entidadeExistente.setEventoProdutos(new HashSet<>());
        }
        Set<EventoProduto> existentesProd = entidadeExistente.getEventoProdutos();
        Map<Long, EventoProduto> mapExistentesPorProduto = new LinkedHashMap<>();
        for (EventoProduto ep : existentesProd) {
            Long prodId = ep != null && ep.getProduto() != null ? ep.getProduto().getId() : null;
            if (prodId != null) mapExistentesPorProduto.put(prodId, ep);
        }
        Map<Long, EventoProduto> mapNovosPorProduto = new LinkedHashMap<>();
        if (entidade.getEventoProdutos() != null) {
            for (EventoProduto eprodNovo : entidade.getEventoProdutos()) {
                if (eprodNovo == null || eprodNovo.getProduto() == null || eprodNovo.getProduto().getId() == null) continue;
                mapNovosPorProduto.put(eprodNovo.getProduto().getId(), eprodNovo);
            }
        }
        // Atualiza existentes e remove ausentes
        Iterator<EventoProduto> itProd = existentesProd.iterator();
        while (itProd.hasNext()) {
            EventoProduto atual = itProd.next();
            Long prodId = atual.getProduto() != null ? atual.getProduto().getId() : null;
            if (prodId == null || !mapNovosPorProduto.containsKey(prodId)) {
                itProd.remove();
                continue;
            }
            EventoProduto fonte = mapNovosPorProduto.get(prodId);
            atual.setStatus(fonte.getStatus());
            atual.setEvento(entidadeExistente);
            // consumir
            mapNovosPorProduto.remove(prodId);
        }
        // Adiciona novos vínculos de produto
        for (Map.Entry<Long, EventoProduto> entry : mapNovosPorProduto.entrySet()) {
            EventoProduto fonte = entry.getValue();
            EventoProduto novo = new EventoProduto();
            novo.setEvento(entidadeExistente);
            novo.setProduto(fonte.getProduto()); // já gerenciada
            novo.setStatus(fonte.getStatus());
            existentesProd.add(novo);
        }
    }

    @Transactional(readOnly = true)
    public Page<EventoPessoaDto> listEventoPessoasPaginado(EventoPessoaFilter filtro) {

        if (filtro.getEventoId() == null) return Page.empty();

        if (filtro.getPessoaCpf() != null) filtro.setPessoaCpf(filtro.getPessoaCpf().replaceAll("\\D", ""));
        if (filtro.getPessoaNome() != null && filtro.getPessoaNome().isBlank()) filtro.setPessoaNome(null);
        if (filtro.getPessoaEmail() != null && filtro.getPessoaEmail().isBlank()) filtro.setPessoaEmail(null);
        if (filtro.getPessoaTelefone() != null && filtro.getPessoaTelefone().isBlank()) filtro.setPessoaTelefone(null);

        Sort sort = getSort(filtro.getOrder());

        Pageable pageable;
        if (filtro.getSize() <= 0) {
            // Traz tudo se o tamanho for 0 ou negativo
            pageable = PageRequest.of(0, Integer.MAX_VALUE, sort);
        }
        else {
            pageable = PageRequest.of(
                    filtro.getPage(),
                    filtro.getSize(),
                    sort
            );
        }

        // Busca paginada no repositório
        Page<EventoPessoa> page = eventoPessoaRepository.findByEventoIdWithPessoa(filtro, pageable);

        // Otimização: Busca IDs de quem já escolheu em lote
        Set<Long> pessoasQueJaEscolheram = eventoEscolhaRepository.findByEvento_IdAndStatus(filtro.getEventoId(), StatusEnum.ATIVO).stream()
                .map(ev -> ev.getPessoa().getId())
                .collect(Collectors.toSet());

        return page.map(ep -> EventoPessoaMapper.toDto(ep, pessoasQueJaEscolheram));
    }

    // Método auxiliar para pegar valor com segurança (evita ArrayIndexOutOfBounds)
    private String obterValor(String[] cols, Map<String, Integer> mapa, String nomeColuna) {
        Integer index = mapa.get(nomeColuna);
        // Se a coluna não existe no cabeçalho OU a linha atual é mais curta que o índice
        if (index == null || index >= cols.length) {
            return "";
        }
        return cols[index].trim();
    }

    public static String calcularDigitosVerificadores(String cpf) {
        if (cpf == null) {
            throw new IllegalArgumentException("CPF não pode ser nulo");
        }

        // 1. Remove tudo que não for número
        String numeros = cpf.replaceAll("\\D", "");

        // 2. Valida se tem o mínimo necessário para calcular (9 dígitos base)
        if (numeros.length() < 9) {
            numeros = String.format("%9s", numeros).replace(' ', '0');
        }

        // Pega apenas os 9 primeiros dígitos para iniciar o cálculo
        String base = numeros.substring(0, 9);

        // 3. Cálculo do 1º Dígito (peso começa em 10)
        int digito1 = calcularDigitoRotina(base, 10);

        // 4. Cálculo do 2º Dígito (adiciona o digito1 à base, peso começa em 11)
        int digito2 = calcularDigitoRotina(base + digito1, 11);

        return base + String.valueOf(digito1) + String.valueOf(digito2);
    }

    /**
     * Método auxiliar que realiza o cálculo do Módulo 11.
     */
    private static int calcularDigitoRotina(String str, int pesoInicial) {
        int soma = 0;
        int peso = pesoInicial;

        for (int i = 0; i < str.length(); i++) {
            // Converte char numérico para int ('0' tem valor 48 na tabela ASCII)
            int num = str.charAt(i) - '0';
            soma += num * peso;
            peso--;
        }

        int resto = soma % 11;

        // Regra do CPF: Se resto < 2, dígito é 0. Senão, é 11 - resto.
        return (resto < 2) ? 0 : 11 - resto;
    }

/*
    @Transactional
    public ImportacaoResultadoDto importarPessoasCsv(Long eventoId, MultipartFile file) {
        List<String> logs = new ArrayList<>();
        int adicionados = 0;

        if (file == null || file.isEmpty()) {
            logs.add("O arquivo está vazio ou não foi enviado.");
            return ImportacaoResultadoDto.builder().adicionados(0).logErros(logs).build();
        }

        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado."));
        Cliente cliente = evento.getCliente();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            int linhaNum = 0;

            // Se o CSV tiver cabeçalho, descomente:
            // br.readLine();

            while ((line = br.readLine()) != null) {
                linhaNum++;
                if (line.trim().isEmpty()) continue;

                String[] cols = line.split(","); // Ajuste para ";" se necessário

                if (cols.length < 4) {
                    logs.add("Linha " + linhaNum + ": Falta de informação (Esperado: Nome, CPF, Telefone, Email).");
                    continue;
                }

                String nome = cols[0].trim();
                String cpfRaw = cols[1].trim();
                String telefone = cols[2].trim();
                String email = cols[3].trim();

                // Validações
                if (nome.isEmpty()) {
                    logs.add("Linha " + linhaNum + ": Nome está vazio.");
                    continue;
                }

                String cpfNumerico = cpfRaw.replaceAll("\\D", "");
                if (cpfNumerico.length() != 11) {
                    logs.add("Linha " + linhaNum + ": CPF incorreto (" + cpfRaw + "). Deve ter 11 dígitos.");
                    continue;
                }

                if (!email.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
                    logs.add("Linha " + linhaNum + ": Email incorreto (" + email + ").");
                    continue;
                }

                String telNumerico = telefone.replaceAll("\\D", "");
                if (telNumerico.length() < 8 || telNumerico.length() > 15) {
                    logs.add("Linha " + linhaNum + ": Telefone incorreto (" + telefone + ").");
                    continue;
                }

                // Busca ou Cria Pessoa
                Pessoa pessoa = pessoaRepository.findByCpf(cpfNumerico).orElse(null);

                if (pessoa == null) {
                    if (pessoaRepository.findByEmail(email).isPresent()) {
                        logs.add("Linha " + linhaNum + ": Email já utilizado por outra pessoa (" + email + ").");
                        continue;
                    }
                    try {
                        pessoa = Pessoa.builder()
                                .nome(nome)
                                .cpf(cpfNumerico)
                                .telefone(telefone)
                                .email(email)
                                .cliente(cliente)
                                .status(StatusEnum.ATIVO)
                                .build();
                        pessoa = pessoaRepository.save(pessoa);
                    } catch (Exception e) {
                        logs.add("Linha " + linhaNum + ": Erro ao salvar pessoa (dados duplicados).");
                        continue;
                    }
                }

                // Vincula ao Evento
                if (eventoPessoaRepository.existsByEventoAndPessoa(evento, pessoa)) {
                    logs.add("Linha " + linhaNum + ": CPF já cadastrado neste evento (" + cpfRaw + ").");
                    continue;
                }

                EventoPessoa vinculo = EventoPessoa.builder()
                        .evento(evento)
                        .pessoa(pessoa)
                        .status(StatusEnum.ATIVO)
                        .build();
                eventoPessoaRepository.save(vinculo);
                adicionados++;
            }
        } catch (IOException e) {
            logs.add("Erro fatal ao ler arquivo: " + e.getMessage());
        }

        return ImportacaoResultadoDto.builder()
                .adicionados(adicionados)
                .logErros(logs)
                .build();
    }
*/


/*
    public int importarPessoasCsv(Long eventoId, MultipartFile file) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado: " + eventoId));

        List<EventoPessoa> adicionados = parseCsvEventoPessoa(file).stream()
                .map(ep -> {
                    ep.setEvento(evento);
                    // Substitui se já existir mesma pessoa no evento
                    evento.getEventoPessoas().removeIf(existing -> existing.getPessoa().getId().equals(ep.getPessoa().getId()));
                    evento.getEventoPessoas().add(ep);
                    return ep;
                })
                .collect(Collectors.toList());

        eventoRepository.save(evento);
        return adicionados.size();
    }
*/

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

    public byte[] gerarRelatorioPdf(EventoReportFilter filter) throws Exception {

        // 1. BUSCAR DADOS (Simulação - adapte para sua busca real com Specifications)
        Evento evento = eventoRepository.findById(filter.getEventoId())
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));

        // Busque as pessoas baseado nos filtros (jaEscolheu, clienteId, etc)
//        List<EventoPessoa> pessoas = eventoPessoaRepository.findByEvento_Id(filter.getEventoId());
//        List<EventoPessoa> pessoas = eventoPessoaRepository.findByEventoIdWithPessoa(filter);
        filter.setJaEscolheu(filter.getJaEscolheu());
        List<EventoRelatorioDto> relatorio = eventoPessoaRepository.findByEventoIdWithFilter(filter);

        InputStream stream = null;
        if("EVENTO_PESSOAS_INFO".equals(filter.getNomeRelatorio())){
            stream = getClass().getResourceAsStream("/relatorios/evento_pessoa_info.jrxml");
        }
        else if("EVENTO_ETIQUETAS_CORREIOS".equals(filter.getNomeRelatorio())){
            stream = getClass().getResourceAsStream("/relatorios/evento_etiqueta.jrxml");
        }

        if (stream == null) {
            throw new RuntimeException("Arquivo .jrxml não encontrado em /resources/relatorios/");
        }

        JasperReport report = JasperCompileManager.compileReport(stream);

        // 3. PREENCHER PARÂMETROS
        Date dataInicioConvertida = null;
        if (evento.getInicio() != null) {
            dataInicioConvertida = Date.from(evento.getInicio().atZone(ZoneId.systemDefault()).toInstant());
        }

        Map<String, Object> params = new HashMap<>();
        params.put("TITULO", "Relatório: " + evento.getNome());
        params.put("DATA_INICIO", dataInicioConvertida);
        params.put("NOME_CLIENTE", evento.getCliente() != null ? evento.getCliente().getNome() : "");

        // 4. CRIAR O DATASOURCE (A lista de pessoas)
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(relatorio);

        // 5. GERAR O PRINT (Juntar Template + Parâmetros + Dados)
        JasperPrint print = JasperFillManager.fillReport(report, params, dataSource);

        // 6. EXPORTAR PARA PDF (Byte Array)
        return JasperExportManager.exportReportToPdf(print);
    }

    public ProgressoTarefaDto iniciaImportarArquivoCsv(Long eventoId, MultipartFile file) {
        List<String> logsIniciais = new ArrayList<>();

        if (file == null || file.isEmpty()) {
            logsIniciais.add("O arquivo está vazio ou não foi enviado.");
            return ProgressoTarefaDto.builder()
                    .status("ERRO")
                    .logErros(logsIniciais)
                    .build();
        }

        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado."));

        try {
            // Lemos todas as linhas antes de abrir a thread para garantir que o MultipartFile não seja descartado
            List<String> todasAsLinhas = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))
                    .lines().collect(Collectors.toList());

            if (todasAsLinhas.size() <= 1) {
                logsIniciais.add("Arquivo sem dados (apenas cabeçalho ou vazio).");
                return ProgressoTarefaDto.builder()
                        .status("ERRO")
                        .logErros(logsIniciais)
                        .build();
            }

            // Inicializa o estado no banco para o polling do front-end encontrar
            evento.setProgLabel("progressArquivo");
            evento.setProgStatus("PROCESSANDO");
            evento.setProgTotal(todasAsLinhas.size() - 1); // Desconta o cabeçalho
            evento.setProgAtual(0);
            eventoRepository.saveAndFlush(evento);

            // DISPARA A THREAD MANUAL: O processo continua aqui dentro mesmo se o Request acabar
            thread = new Thread(() -> {
                executarProcessamentoCsv(eventoId, todasAsLinhas);
            });

            thread.start();

            // RETORNA IMEDIATAMENTE: O usuário recebe isso e começa o setInterval no Angular
            return ProgressoTarefaDto.builder()
                    .status("PROCESSANDO")
                    .atual(0)
                    .total(todasAsLinhas.size() - 1)
                    .build();

        }
        catch (IOException e) {
            logsIniciais.add("Falha ao ler arquivo: " + e.getMessage());
            return ProgressoTarefaDto.builder()
                    .status("ERRO")
                    .logErros(logsIniciais)
                    .build();
        }
    }

    private void executarProcessamentoCsv(Long eventoId, List<String> todasAsLinhas) {
        // 1. Setup Inicial
        Evento evento = eventoRepository.findById(eventoId).orElse(null);
        if (evento == null) return;

        Cliente cliente = evento.getCliente();
        List<String> logs = new ArrayList<>();
        int adicionados = 0;

        try {
            // 2. Processamento do Cabeçalho
            String headerLine = todasAsLinhas.get(0).replace("\uFEFF", "");
            String separador = headerLine.contains(";") ? ";" : ",";
            String[] headers = headerLine.split(separador);

            Map<String, Integer> mapaColunas = new HashMap<>();
            for (int i = 0; i < headers.length; i++) {
                mapaColunas.put(headers[i].trim().toLowerCase(), i);
            }

            // 3. Carregamento de Caches (Maps)
            List<Pessoa> pessoaList = pessoaRepository.findByCliente(cliente);
            Map<String, Pessoa> pessoaCpfMap = new HashMap<>(pessoaList.stream()
                    .filter(p -> p.getCpf() != null)
                    .collect(Collectors.toMap(Pessoa::getCpf, p -> p, (existente, novo) -> existente)));

            Map<String, Pessoa> pessoaEmailMap = new HashMap<>(pessoaList.stream()
                    .filter(p -> p.getEmail() != null)
                    .collect(Collectors.toMap(Pessoa::getEmail, p -> p, (existente, novo) -> existente)));

            Map<String, Pessoa> pessoaTelefoneMap = new HashMap<>(pessoaList.stream()
                    .filter(p -> p.getTelefone() != null)
                    .collect(Collectors.toMap(Pessoa::getTelefone, p -> p, (existente, novo) -> existente)));


            List<EventoPessoa> eventoPessoaList = eventoPessoaRepository.findByEventoId(eventoId);
            Map<Long, EventoPessoa> eventoPessoaMap = new HashMap<>(eventoPessoaList.stream()
                    .filter(ep -> ep.getPessoa() != null)
                    .collect(Collectors.toMap(ep -> ep.getPessoa().getId(), ep -> ep, (existente, novo) -> existente)));



            List<Pessoa> lotePessoas = new ArrayList<>();
            List<EventoPessoa> loteVinculos = new ArrayList<>();

            // 4. Loop de Dados
            for (int i = 1; i < todasAsLinhas.size(); i++) {

                // VERIFICAÇÃO CRÍTICA: Se alguém chamou thread.interrupt(), a thread para aqui
                if (thread.isInterrupted()) {
                    logs.add("Processamento interrompido pelo usuário.");
                    eventoRepository.finalizarProgresso(eventoId, "CONCLUIDO", 0);
                    return; // Sai do loop com segurança
                }

                String lineStr = todasAsLinhas.get(i);
                if (lineStr.trim().isEmpty()) continue;

                String[] cols = lineStr.split(separador, -1);

                // Extração
                String nome = obterValor(cols, mapaColunas, "nome");
                String cpfRaw = obterValor(cols, mapaColunas, "cpf");
                String telefone = obterValor(cols, mapaColunas, "telefone");
                String email = obterValor(cols, mapaColunas, "email");
                String organoNivel1 = obterValor(cols, mapaColunas, "uniao");
                String organoNivel2 = obterValor(cols, mapaColunas, "associacao");
                String organoNivel3 = obterValor(cols, mapaColunas, "escola_igreja");
                String localTrabalho = obterValor(cols, mapaColunas, "localtrabalho");

                // Validações Básicas
                if (nome.isEmpty()) {
                    logs.add("Linha " + (i + 1) + ": Coluna 'Nome' está vazia.");
                    eventoRepository.atualizarApenasProgresso(eventoId, i);
                    continue;
                }

                String cpfNumerico = cpfRaw.replaceAll("\\D", "");
                if (cpfNumerico.length() < 11) {
                    cpfNumerico = calcularDigitosVerificadores(cpfNumerico);
                }

                if (cpfNumerico.length() != 11) {
                    logs.add("Linha " + (i + 1) + ": CPF incorreto (" + cpfRaw + ").");
                    eventoRepository.atualizarApenasProgresso(eventoId, i);
                    continue;
                }

                try {
                    // Lógica de Pessoa
                    Pessoa pessoaCpf = pessoaCpfMap.get(cpfNumerico);
                    Pessoa pessoaEmail = pessoaCpfMap.get(email);
                    Pessoa pessoaTelefone = pessoaCpfMap.get(telefone);

                    if (pessoaCpf == null && (pessoaEmail != null || pessoaTelefone != null)) {
                        logs.add("Linha " + (i + 1) + ": E-mail ou Telefone já usado por outro CPF [" + email + ", " + telefone + "].");
                        continue; // Pula para não dar erro de UNIQUE no banco
                    }

                    boolean isNovaPessoa = false;
                    if (pessoaCpf == null) {
                        pessoaCpf = Pessoa.builder()
                                .nome(nome)
                                .cpf(cpfNumerico)
                                .telefone(telefone)
                                .email(email)
                                .cliente(cliente)
                                .status(StatusEnum.ATIVO)
                                .build();

                        lotePessoas.add(pessoaCpf);
                        pessoaCpfMap.put(cpfNumerico, pessoaCpf);
                        pessoaEmailMap.put(email, pessoaCpf);
                        pessoaTelefoneMap.put(telefone, pessoaCpf);
                        isNovaPessoa = true;
                    }

                    // Lógica de Vínculo
                    // Se a pessoa já existia e já está no evento, pulamos
                    if (!isNovaPessoa && pessoaCpf.getId() != null && eventoPessoaMap.containsKey(pessoaCpf.getId())) {
                        logs.add("Linha " + (i + 1) + ": Pessoa já cadastrada (" + nome + ").");
                    }
                    else {
                        EventoPessoa vinculo = EventoPessoa.builder()
                                .evento(evento)
                                .pessoa(pessoaCpf)
                                .status(StatusEnum.ATIVO)
                                .organoNivel1(organoNivel1)
                                .organoNivel2(organoNivel2)
                                .organoNivel3(organoNivel3)
                                .localTrabalho(localTrabalho)
                                .build();

                        loteVinculos.add(vinculo);
                        adicionados++;
                    }

                    // 5. PROCESSAMENTO DO LOTE (Batch)
                    if (loteVinculos.size() >= 10 || i == todasAsLinhas.size() - 1) {

                        // Atualiza o progresso (Este método no Repository DEVE ter @Transactional(propagation = Propagation.REQUIRES_NEW))
                        eventoRepository.atualizarApenasProgresso(eventoId, i);


                        // Criamos um executor de transação manual
                        TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);

                        transactionTemplate.execute(status -> {
                            // Passo A: Salvar Pessoas
                            if (!lotePessoas.isEmpty()) {
                                pessoaRepository.saveAll(lotePessoas);
                            }

                            // Passo B: Salvar Vínculos
                            if (!loteVinculos.isEmpty()) {
                                eventoPessoaRepository.saveAll(loteVinculos);
                            }

                            // Passo C: Forçar envio e limpar cache DENTRO da transação
                            entityManager.flush();
                            entityManager.clear();
                            return null;
                        });

                        // <--- Aqui o COMMIT acontece e o banco libera os locks (destrava)

                        // Atualiza o mapa de vínculos para a memória não se perder após o clear
                        for (EventoPessoa evp : loteVinculos) {
                            if (evp.getPessoa() != null) eventoPessoaMap.put(evp.getPessoa().getId(), evp);
                        }

                        lotePessoas.clear();
                        loteVinculos.clear();

                        // Recarregar o objeto evento que foi "limpo" pelo clear()
                        evento = eventoRepository.findById(eventoId).orElse(null);

                        try {
                            Thread.sleep(300); // Respiro para o banco respirar entre transações
                        } catch (InterruptedException ex) {
                            Thread.currentThread().interrupt();
                        }

                    }
                }
                catch (Exception e) {
                    logs.add("Linha " + (i + 1) + ": Erro: " + e.getMessage());
                }

            }

            // 6. Finalização
            eventoRepository.finalizarProgresso(eventoId, "CONCLUIDO", todasAsLinhas.size() - 1);

        }
        catch (Exception e) {
            eventoRepository.finalizarProgresso(eventoId, "ERRO", 0);
        }
    }

/*
    @Async // Faz o método rodar em uma thread separada
    @Transactional
    public ProgressoTarefaDto enviarEmailsAssincrono(Long eventoId) {

        List<String> logs = new ArrayList<>();
        int enviados = 0;

        Evento evento = eventoRepository.findById(eventoId).orElseThrow();
        List<EventoPessoa> eventoPessoaList = evento.getEventoPessoas();

        // Inicializa o estado no banco
        evento.setProgLabel("progressEmail");
        evento.setProgStatus("PROCESSANDO");
        evento.setProgTotal(eventoPessoaList.size());
        evento.setProgAtual(0);
        eventoRepository.saveAndFlush(evento);

        for (int i = 0; i < eventoPessoaList.size(); i++) {

            EventoPessoa ep = eventoPessoaList.get(i);

            if (ep.getPessoa() != null) {
                if (ep.getPessoa().getEmail()==null || ep.getPessoa().getEmail().isEmpty()) {
                    logs.add(ep.getPessoa().getNome()+" nao tem e-mail cadastrado");
                    continue;
                }
                if (ep.getNomeMagicNumber()==null || ep.getNomeMagicNumber().isEmpty()) {
                    logs.add(ep.getPessoa().getNome()+" nao tem Numero Magico cadastrado");
                    continue;
                }

                try {
                    enviarEmailIndividual(ep, evento);

                    // ATUALIZA O BANCO A CADA PASSO
                    // Usamos saveAndFlush para garantir que o progresso seja persistido IMEDIATAMENTE
                    evento.setProgAtual(i + 1);
                    eventoRepository.saveAndFlush(evento);
                } catch (Exception e) {
                    System.err.println("Erro ao enviar para: " + ep.getPessoa().getEmail());
                }

                enviados++;
            }
        }

        // Finaliza
        evento.setProgStatus("CONCLUIDO");
        eventoRepository.saveAndFlush(evento);

        return ProgressoTarefaDto.builder()
                .status(evento.getProgStatus())
                .atual(evento.getProgAtual())
                .total(evento.getProgTotal())
                .logErros(logs)
                .build();

    }
*/

    public ProgressoTarefaDto iniciaEnvioEmails(Long eventoId) {
        // 1. Busca o evento e valida as pessoas (fora da thread para resposta rápida)
        Evento evento = eventoRepository.findByIdExpandedAll(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado"));

        if (evento.getEventoPessoas() == null || evento.getEventoPessoas().isEmpty()) {
            return ProgressoTarefaDto.builder()
                    .status("CONCLUIDO")
                    .logErros(List.of("Não há pessoas vinculadas a este evento."))
                    .build();
        }

        // 2. Inicializa o estado no banco (essencial para o getStatusProgresso funcionar)
        evento.setProgLabel("progressEmail");
        evento.setProgStatus("PROCESSANDO");
        evento.setProgTotal(evento.getEventoPessoas().size());
        evento.setProgAtual(0);
        eventoRepository.saveAndFlush(evento);

        // 3. Dispara a thread manual (mesmo objeto usado no CSV)
        thread = new Thread(() -> {
            executarProcessamentoEnvioEmails(eventoId);
        });
        thread.start();

        // 4. Retorna imediatamente para o front-end iniciar o polling
        return ProgressoTarefaDto.builder()
                .status("PROCESSANDO")
                .atual(0)
                .total(evento.getEventoPessoas().size())
                .build();
    }

    private void executarProcessamentoEnvioEmails(Long eventoId) {
        // Busca o evento dentro da thread para garantir que os dados estejam frescos
        Evento evento = eventoRepository.findByIdExpandedAll(eventoId).orElse(null);
        if (evento == null) return;

        List<EventoPessoa> eventoPessoaList = evento.getEventoPessoas();
        List<String> logs = new ArrayList<>();

        try {
            for (int i = 0; i < eventoPessoaList.size(); i++) {

                // VERIFICAÇÃO CRÍTICA: Permite que o método pararProgresso() interrompa o envio
                if (thread.isInterrupted()) {
                    eventoRepository.finalizarProgresso(eventoId, "INTERROMPIDO", i);
                    return;
                }

                EventoPessoa ep = eventoPessoaList.get(i);

                if (ep.getPessoa() != null) {
                    // Validações antes de tentar o envio
                    if (ep.getPessoa().getEmail() == null || ep.getPessoa().getEmail().isEmpty()) {
                        logs.add("Sem e-mail cadastrado: "+ep.getPessoa().getNome());
                    }
                    else if (ep.getNomeMagicNumber() == null || ep.getNomeMagicNumber().isEmpty()) {
                        logs.add("Sem Número Mágico: "+ep.getPessoa().getNome());
                    }
                    else {
                        try {
                            // Envia o e-mail (Método privado que você já possui)
                            enviarEmailIndividual(ep, evento, logs);
                        }
                        catch (Exception e) {
                            logs.add("Erro ao enviar para " + ep.getPessoa().getEmail() + ": " + e.getMessage());
                        }
                    }
                }

                // Atualiza o progresso no banco a cada iteração
                eventoRepository.atualizarApenasProgresso(eventoId, i + 1);

                // Pequeno respiro opcional para não sobrecarregar o servidor de SMTP
                try { Thread.sleep(500); } catch (InterruptedException ex) { thread.interrupt(); }
            }

            // Finaliza o progresso como concluído
            eventoRepository.finalizarProgresso(eventoId, "CONCLUIDO", eventoPessoaList.size());

        }
        catch (Exception e) {
            eventoRepository.finalizarProgresso(eventoId, "ERRO", 0);
        }
    }

    private void enviarEmailIndividual(EventoPessoa ep, Evento evento, List<String> logs) {
        try {
            Context context = new Context();
            context.setVariable("nome", ep.getPessoa().getNome());
            context.setVariable("eventoNome", evento.getNome());
            context.setVariable("linkMagico", "http://localhost:8080/presente/" + ep.getNomeMagicNumber());

            String body = templateEngine.process("carta_convite", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");

            helper.setTo(ep.getPessoa().getEmail());
            helper.setSubject("Convite Especial: " + evento.getNome());
            helper.setText(body, true);

            mailSender.send(mimeMessage);

            // Log de sucesso opcional
            System.out.println("E-mail enviado com sucesso para: " + ep.getPessoa().getEmail());
            logs.add("SUCESSO: email enviado ( " + ep.getPessoa().getEmail() + " )");

        }
        catch (MailException | MessagingException e) {
            // Aqui você captura o erro e vê a mensagem no console
            System.err.println("FALHA AO ENVIAR EMAIL para " + ep.getPessoa().getEmail() + ": " + e.getMessage());
            logs.add("ERRO: email ( " + ep.getPessoa().getEmail() + " ) : " + e.getMessage());
        }
    }

    @Transactional
    public ProgressoTarefaDto getStatusProgresso(Long eventoId) {

        // Se a thread nao existir ou ja terminou o trabalho
        if (thread == null || !thread.isAlive()) {
            eventoRepository.finalizarProgresso(eventoId, "CONCLUIDO", 0);
        }

        Evento evento = eventoRepository.findById(eventoId).orElseThrow();

        return ProgressoTarefaDto.builder()
                .status(evento.getProgStatus())
                .atual(evento.getProgAtual())
                .total(evento.getProgTotal())
                .build();
    }

    public ProgressoTarefaDto pararProgresso(Long eventoId) {
        boolean parouDeFato = false;
        if (thread != null && thread.isAlive()) {
            thread.interrupt();

            // Espera ativa curta para tentar confirmar a parada antes de responder ao front-end
            int tentativas = 0;
            while (thread.isAlive() && tentativas < 10) { // Tenta por +/- 2.5 segundos
                try {
                    thread.join(1000);
                    tentativas++;
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }

                // Verifica o estado final após a tentativa de join
                parouDeFato = (thread == null || !thread.isAlive());
                if (parouDeFato) break;
            }
        }

        // Se não parou de fato, o status no banco deve ser "CANCELANDO"
        // para o usuário saber que o sistema ainda está limpando os recursos.
        String statusFinal = parouDeFato ? "INTERROMPIDO" : "PARANDO";

        eventoRepository.finalizarProgresso(eventoId, statusFinal, 0);

        Evento evento = eventoRepository.findById(eventoId).orElseThrow();

        return ProgressoTarefaDto.builder()
                .progressoId(evento.getProgLabel())
                .status(evento.getProgStatus())
                .atual(evento.getProgAtual())
                .total(evento.getProgTotal())
                .build();
    }

}
