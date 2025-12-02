package br.eng.eliseu.presente.controller;

import br.eng.eliseu.presente.model.*;
import br.eng.eliseu.presente.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/presente")
@RequiredArgsConstructor
public class PresenteController {

    private final EventoPessoaRepository eventoPessoaRepository;
    private final EventoRepository eventoRepository;
    private final EventoEscolhaRepository eventoEscolhaRepository;
    private final ProdutoRepository produtoRepository;
    private final TamanhoRepository tamanhoRepository;
    private final CorRepository corRepository;

    public static record EscolherRequest(Long produtoId, Long tamanhoId, Long corId) {}

    public static record ResumoResponse(
            Long eventoId,
            String eventoNome,
            LocalDateTime dataPrevista,
            Long pessoaId,
            String pessoaNome,
            List<Produto> produtos,
            EventoEscolha ultimaEscolha,
            boolean podeRefazer,
            boolean expirado,
            String mensagem
    ) {}

    public static record HistoricoResponse(List<EventoEscolha> anteriores) {}

    // GET /presente/{token} (JSON)
    @GetMapping(path = "/{token}", produces = "application/json")
    @Transactional(readOnly = true)
    public ResponseEntity<ResumoResponse> carregar(@PathVariable("token") String token) {
        EventoPessoa ep = eventoPessoaRepository.findByNomeMagicNumber(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Token inválido"));

        Evento evento = eventoRepository.findByIdExpandedAll(ep.getEvento().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado"));

        // Produtos associados ao evento
        List<Produto> produtos = Optional.ofNullable(evento.getProdutos()).orElseGet(Set::of).stream()
                .filter(Objects::nonNull)
                .filter(evProd -> evProd.getStatus() == null || evProd.getStatus() == StatusEnum.ATIVO)
                .map(EventoProduto::getProduto)
                .filter(Objects::nonNull)
                .distinct()
                .peek(p -> {
                    // Inicializa coleções necessárias para a tela (tamanhos, cores, imagens)
                    if (p.getTamanhos() != null) p.getTamanhos().size();
                    if (p.getCores() != null) p.getCores().size();
                    if (p.getImagens() != null) p.getImagens().size();
                })
                .collect(Collectors.toList());

        // Última escolha
        EventoEscolha ultima = eventoEscolhaRepository
                .findTopByEvento_IdAndPessoa_IdOrderByDataEscolhaDesc(evento.getId(), ep.getPessoa().getId())
                .orElse(null);

        boolean expirado = evento.getFimPrevisto() != null && LocalDateTime.now().isAfter(evento.getFimPrevisto());
        boolean podeRefazer = !expirado; // regra: botão visível somente se não expirado
        String mensagem = null;
        if (expirado && ultima == null) {
            mensagem = "O tempo para escolha expirou. Nenhuma escolha foi registrada.";
        }

        ResumoResponse resp = new ResumoResponse(
                evento.getId(),
                evento.getNome(),
                evento.getFimPrevisto(),
                ep.getPessoa().getId(),
                ep.getPessoa().getNome(),
                produtos,
                ultima,
                podeRefazer,
                expirado,
                mensagem
        );
        return ResponseEntity.ok(resp);
    }

    // GET /presente/{token} (HTML) — quando o navegador solicitar text/html
    @GetMapping(path = "/{token}", produces = "text/html")
    public ResponseEntity<String> carregarPagina(@PathVariable("token") String token) {
        String safeToken = org.springframework.web.util.HtmlUtils.htmlEscape(token);
        String html = "" +
                "<!doctype html>" +
                "<html lang=\"pt-BR\">" +
                "<head>" +
                "  <meta charset=\"utf-8\">" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
                "  <title>Escolha do Presente</title>" +
                "  <link rel=\"stylesheet\" href=\"/presente/styles.css\">" +
                "</head>" +
                "<body>" +
                "  <main class=\"container\">" +
                "    <h1>Escolha do Presente</h1>" +
                "    <div id=\"app\">Carregando...</div>" +
                "  </main>" +
                "  <script>window.PRESENTE_TOKEN='" + safeToken + "';</script>" +
                "  <script type=\"module\" src=\"/presente/app.js\"></script>" +
                "</body>" +
                "</html>";
        return ResponseEntity.ok(html);
    }

    // POST /presente/{token}/escolher
    @PostMapping("/{token}/escolher")
    @Transactional
    public ResponseEntity<EventoEscolha> escolher(
            @PathVariable("token") String token,
            @RequestBody EscolherRequest req
    ) {
        if (req == null || req.produtoId() == null || req.tamanhoId() == null || req.corId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados incompletos para a escolha");
        }

        EventoPessoa ep = eventoPessoaRepository.findByNomeMagicNumber(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Token inválido"));

        Evento evento = eventoRepository.findByIdExpandedAll(ep.getEvento().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado"));

        // Regra de data: bloquear alterações após fimPrevisto
        if (evento.getFimPrevisto() != null && LocalDateTime.now().isAfter(evento.getFimPrevisto())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "O tempo para escolha expirou");
        }

        // Validar produto pertence ao evento
        boolean produtoPermitido = Optional.ofNullable(evento.getProdutos()).orElseGet(Set::of).stream()
                .filter(Objects::nonNull)
                .anyMatch(evProd -> evProd.getProduto() != null && Objects.equals(evProd.getProduto().getId(), req.produtoId()));
        if (!produtoPermitido) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Produto não vinculado ao evento");
        }

        Produto produto = produtoRepository.findById(req.produtoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Produto inexistente"));
        Tamanho tamanho = tamanhoRepository.findById(req.tamanhoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tamanho inexistente"));
        Cor cor = corRepository.findById(req.corId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cor inexistente"));

        // Validar se tamanho/cor existem no produto
        boolean tamanhoOk = produto.getTamanhos() == null || produto.getTamanhos().stream().anyMatch(t -> Objects.equals(t.getId(), tamanho.getId()));
        boolean corOk = produto.getCores() == null || produto.getCores().stream().anyMatch(c -> Objects.equals(c.getId(), cor.getId()));
        if (!tamanhoOk || !corOk) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tamanho/Cor não disponíveis para o produto");
        }

        EventoEscolha escolha = EventoEscolha.builder()
                .evento(evento)
                .pessoa(ep.getPessoa())
                .produto(produto)
                .tamanho(tamanho)
                .cor(cor)
                .dataEscolha(LocalDateTime.now())
                .build();

        EventoEscolha salva = eventoEscolhaRepository.save(escolha);
        return ResponseEntity.ok(salva);
    }

    // GET /presente/{token}/historico
    @GetMapping("/{token}/historico")
    @Transactional(readOnly = true)
    public ResponseEntity<HistoricoResponse> historico(@PathVariable("token") String token) {
        EventoPessoa ep = eventoPessoaRepository.findByNomeMagicNumber(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Token inválido"));

        List<EventoEscolha> todas = eventoEscolhaRepository
                .findByEvento_IdAndPessoa_IdOrderByDataEscolhaDesc(ep.getEvento().getId(), ep.getPessoa().getId());
        if (todas.isEmpty()) {
            return ResponseEntity.ok(new HistoricoResponse(List.of()));
        }
        // Remover a última (mais recente), retornar anteriores
        List<EventoEscolha> anteriores = new ArrayList<>(todas);
        anteriores.remove(0);
        return ResponseEntity.ok(new HistoricoResponse(anteriores));
    }
}
