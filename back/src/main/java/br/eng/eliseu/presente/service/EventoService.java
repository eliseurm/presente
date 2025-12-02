package br.eng.eliseu.presente.service;

import br.eng.eliseu.presente.model.*;
import br.eng.eliseu.presente.model.filter.EventoFilter;
import br.eng.eliseu.presente.repository.ClienteRepository;
import br.eng.eliseu.presente.repository.EventoRepository;
import br.eng.eliseu.presente.repository.PessoaRepository;
import br.eng.eliseu.presente.repository.ProdutoRepository;
import br.eng.eliseu.presente.repository.EventoPessoaRepository;
import br.eng.eliseu.presente.repository.EventoEscolhaRepository;
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
    private final EventoPessoaRepository eventoPessoaRepository;
    private final EventoEscolhaRepository eventoEscolhaRepository;

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

    // ================= Controle do Evento: Iniciar/Parar =================

    @Transactional
    public Map<String, Object> iniciarEvento(Long eventoId, String baseUrl) {
        Evento evento = eventoRepository.findByIdExpandedAll(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado: " + eventoId));

        if (evento.getPessoas() == null || evento.getPessoas().isEmpty()) {
            return Map.of("gerados", 0, "links", List.of());
        }

        int gerados = 0;
        List<String> links = new ArrayList<>();

        for (EventoPessoa ep : evento.getPessoas()) {
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
    public Map<String, Object> pararEvento(Long eventoId) {
        Evento evento = eventoRepository.findByIdExpandedAll(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado: " + eventoId));

        if (evento.getPessoas() == null || evento.getPessoas().isEmpty()) {
            return Map.of("pausados", 0);
        }

        int pausados = 0;
        for (EventoPessoa ep : evento.getPessoas()) {
            if (ep == null) continue;
            if (ep.getNomeMagicNumber() != null && !ep.getNomeMagicNumber().isBlank()) {
                if (ep.getStatus() != StatusEnum.PAUSADO) {
                    ep.setStatus(StatusEnum.PAUSADO);
                    pausados++;
                }
            }
        }

        evento.setFim(java.time.LocalDateTime.now());
        eventoRepository.save(evento);
        return Map.of("pausados", pausados);
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

    // Suporte ao expand para GET /evento/{id}?expand=...
    @Override
    @Transactional(readOnly = true)
    public Optional<Evento> buscarPorIdComExpand(Long id, String expand) {
        boolean hasExpand = expand != null && !expand.isBlank();
        if (!hasExpand) {
            return buscarPorId(id);
        }
        // Para simplificar inicialmente, quando houver qualquer expand pedimos o objeto todo expandido.
        return eventoRepository.findByIdExpandedAll(id);
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
            // Deduplica por pessoaId (última ocorrência prevalece)
            Map<Long, EventoPessoa> byPessoa = new LinkedHashMap<>();
            for (EventoPessoa ep : entidade.getPessoas()) {
                if (ep == null) continue;
                Long pessoaId = ep.getPessoa() != null ? ep.getPessoa().getId() : null;
                if (pessoaId == null) continue;
                // Converte referência para gerenciada
                pessoaRepository.findById(pessoaId).ifPresent(ep::setPessoa);
                byPessoa.put(pessoaId, ep);
            }
            entidade.setPessoas(new ArrayList<>(byPessoa.values()));
            // back-reference será ajustada no prepararParaAtualizacao para a entidadeExistente
        }
        // Produtos (agora Set para evitar 'bag')
        if (entidade.getProdutos() != null) {
            Set<EventoProduto> normalizadas = new HashSet<>();
            for (EventoProduto eprod : entidade.getProdutos()) {
                if (eprod == null) continue;
                Long produtoId = eprod.getProduto() != null ? eprod.getProduto().getId() : null;
                if (produtoId == null) continue;
                produtoRepository.findById(produtoId).ifPresent(eprod::setProduto);
                normalizadas.add(eprod);
            }
            entidade.setProdutos(normalizadas);
            // back-reference será ajustada no prepararParaAtualizacao para a entidadeExistente
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
        entidadeExistente.setAnotacoes(entidade.getAnotacoes());
        entidadeExistente.setInicio(entidade.getInicio());
        entidadeExistente.setFimPrevisto(entidade.getFimPrevisto());
        entidadeExistente.setFim(entidade.getFim());
        entidadeExistente.setStatus(entidade.getStatus());
        // Sincroniza coleções sem usar clear()+add(), evitando inserções duplicadas e violação de unique constraint
        // ===== Pessoas (List) =====
        if (entidadeExistente.getPessoas() == null) {
            entidadeExistente.setPessoas(new ArrayList<>());
        }
        List<EventoPessoa> existentesPessoa = entidadeExistente.getPessoas();
        Map<Long, EventoPessoa> mapExistentesPorPessoa = new LinkedHashMap<>();
        for (EventoPessoa ep : existentesPessoa) {
            Long pessoaId = ep != null && ep.getPessoa() != null ? ep.getPessoa().getId() : null;
            if (pessoaId != null) mapExistentesPorPessoa.put(pessoaId, ep);
        }
        Map<Long, EventoPessoa> mapNovosPorPessoa = new LinkedHashMap<>();
        if (entidade.getPessoas() != null) {
            for (EventoPessoa epNovo : entidade.getPessoas()) {
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
        if (entidadeExistente.getProdutos() == null) {
            entidadeExistente.setProdutos(new HashSet<>());
        }
        Set<EventoProduto> existentesProd = entidadeExistente.getProdutos();
        Map<Long, EventoProduto> mapExistentesPorProduto = new LinkedHashMap<>();
        for (EventoProduto ep : existentesProd) {
            Long prodId = ep != null && ep.getProduto() != null ? ep.getProduto().getId() : null;
            if (prodId != null) mapExistentesPorProduto.put(prodId, ep);
        }
        Map<Long, EventoProduto> mapNovosPorProduto = new LinkedHashMap<>();
        if (entidade.getProdutos() != null) {
            for (EventoProduto eprodNovo : entidade.getProdutos()) {
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
