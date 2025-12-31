package br.eng.eliseu.presente.controller;

import br.eng.eliseu.presente.model.*;
import br.eng.eliseu.presente.model.dto.*;
import br.eng.eliseu.presente.model.mapper.EventoEscolhaMapper;
import br.eng.eliseu.presente.model.mapper.EventoPessoaMapper;
import br.eng.eliseu.presente.model.mapper.PessoaMapper;
import br.eng.eliseu.presente.model.mapper.ProdutoMapper;
import br.eng.eliseu.presente.security.AuthorizationService;
import br.eng.eliseu.presente.repository.*;
import br.eng.eliseu.presente.service.ImagemService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

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
    private final AuthorizationService authService;
    private final ImagemService imagemService;

    public static record EscolherRequest(Long produtoId, Long tamanhoId, Long corId) {}

    public static record ResumoResponse(
            Long eventoId,
            String eventoNome,
            LocalDateTime dataPrevista,
            EventoPessoaDto eventoPessoa,
            List<ProdutoCompletoDto> produtos,
            EventoEscolhaDto ultimaEscolha,
            boolean podeRefazer,
            boolean expirado,
            String mensagem
    ) {}

    public static record HistoricoResponse(List<EventoEscolha> anteriores) {}

    // GET /presente/{token} (JSON)
    @GetMapping(path = "/{token}", produces = "application/json")
    @Transactional(readOnly = true)
    public ResponseEntity<ResumoResponse> carregar(@PathVariable("token") String token) {

        System.out.println("LOG: Requisicao para validar token CHEGOU no controller. Token: " + token); // Adicione isto

        EventoPessoa ep = eventoPessoaRepository.findByNomeMagicNumber(token).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Token inválido"));

        Evento evento = eventoRepository.findByIdExpandedAll(ep.getEvento().getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado"));

        List<Produto> produtos = produtoRepository.findProdutosComColecoesProntas(evento, StatusEnum.ATIVO);

        // Última escolha
        EventoEscolha ultimaEscolha = eventoEscolhaRepository.findTopByEvento_IdAndPessoa_IdOrderByDataEscolhaDesc(evento.getId(), ep.getPessoa().getId()).orElse(null);

        boolean expirado = evento.getFimPrevisto() != null && LocalDateTime.now().isAfter(evento.getFimPrevisto());
        boolean podeRefazer = !expirado; // regra: botão visível somente se não expirado
        String mensagem = null;
        if (expirado && ultimaEscolha == null) {
            mensagem = "O tempo para escolha expirou. Nenhuma escolha foi registrada.";
        }

        EventoPessoaDto eventoPessoaDto = EventoPessoaMapper.toDto(ep);

        ResumoResponse resp = new ResumoResponse(
                evento.getId(),
                evento.getNome(),
                evento.getFimPrevisto(),
                eventoPessoaDto,
                ProdutoMapper.toDtoListCompleto(produtos),
                EventoEscolhaMapper.toDto(ultimaEscolha),
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
        String html = """
            <!doctype html>
            <html lang="pt-BR">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Escolha do Presente</title>
              <link rel="stylesheet" href="/presente/styles.css">
            </head>
            <body>
              <main class="container">
                <h1>Escolha do Presente</h1>
                <div id="app">Carregando...</div>
              </main>
              <script>window.PRESENTE_TOKEN='%s';</script>
              <script type="module" src="/presente/app.js"></script>
            </body>
            </html>
            """.formatted(safeToken);
        return ResponseEntity.ok(html);
    }

    // POST /presente/{token}/escolher
    @PostMapping("/{token}/escolher")
    @Transactional
    public ResponseEntity<EventoEscolha> escolher(@PathVariable("token") String token, @RequestBody EscolherRequest req) {

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
        boolean produtoPermitido = Optional.ofNullable(evento.getEventoProdutos()).orElseGet(Set::of).stream()
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
//        boolean tamanhoOk = produto.getTamanhos() == null || produto.getTamanhos().stream().anyMatch(t -> Objects.equals(t.getId(), tamanho.getId()));
//        boolean corOk = produto.getCores() == null || produto.getCores().stream().anyMatch(c -> Objects.equals(c.getId(), cor.getId()));
//        if (!tamanhoOk || !corOk) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tamanho/Cor não disponíveis para o produto");
//        }

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

    // POST /presente/salvar (recebe um objeto EventoEscolha "carregado")
    @PostMapping("/salvar")
    @Transactional
    public ResponseEntity<EventoEscolhaDto> salvarEscolha(@P("escolha") @RequestBody EventoEscolha escolha) {

        if (escolha == null
                || escolha.getEvento() == null || escolha.getEvento().getId() == null
                || escolha.getPessoa() == null || escolha.getPessoa().getId() == null
                || escolha.getProduto() == null || escolha.getProduto().getId() == null
                || escolha.getTamanho() == null || escolha.getTamanho().getId() == null
                || escolha.getCor() == null || escolha.getCor().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados incompletos para a escolha");
        }

        // Autorização programática: ADMIN ou usuário vinculado ao cliente do evento
        if (!(authService.isAdmin() || authService.isEscolhaAtiva(escolha))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "O Evento esta Encerrado");
        }

        // Carrega entidades gerenciadas
        Evento evento = eventoRepository.findByIdExpandedAll(escolha.getEvento().getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Evento inexistente"));
        Pessoa pessoa = Optional.ofNullable(escolha.getPessoa().getId()).flatMap(id -> Optional.ofNullable(evento.getEventoPessoas()).orElseGet(java.util.List::of).stream().map(EventoPessoa::getPessoa).filter(Objects::nonNull).filter(p -> Objects.equals(p.getId(), id)).findFirst()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pessoa não vinculada ao evento"));
        Produto produto = produtoRepository.findById(escolha.getProduto().getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Produto inexistente"));
        Tamanho tamanho = tamanhoRepository.findById(escolha.getTamanho().getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tamanho inexistente"));
        Cor cor = corRepository.findById(escolha.getCor().getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cor inexistente"));

        // Regras
        if (evento.getFimPrevisto() != null && LocalDateTime.now().isAfter(evento.getFimPrevisto())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "O tempo para escolha expirou");
        }
        boolean produtoPermitido = Optional.ofNullable(evento.getEventoProdutos()).orElseGet(Set::of).stream()
                .filter(Objects::nonNull)
                .anyMatch(evProd -> evProd.getProduto() != null && Objects.equals(evProd.getProduto().getId(), produto.getId()));
        if (!produtoPermitido) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Produto não vinculado ao evento");
        }
//        boolean tamanhoOk = produto.getTamanhos() == null || produto.getTamanhos().stream().anyMatch(t -> Objects.equals(t.getId(), tamanho.getId()));
//        boolean corOk = produto.getCores() == null || produto.getCores().stream().anyMatch(c -> Objects.equals(c.getId(), cor.getId()));
//        if (!tamanhoOk || !corOk) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tamanho/Cor não disponíveis para o produto");
//        }

        EventoEscolha nova = EventoEscolha.builder()
                .evento(evento)
                .pessoa(pessoa)
                .produto(produto)
                .tamanho(tamanho)
                .cor(cor)
                .dataEscolha(LocalDateTime.now())
                .alteradoEm(LocalDateTime.now())
                .status(StatusEnum.ATIVO)
                .build();

        EventoEscolha salva = eventoEscolhaRepository.save(nova);
        EventoEscolhaDto dto = EventoEscolhaMapper.toDto(salva);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/limpar")
    @Transactional
    public ResponseEntity limparEscolha(@RequestBody EventoEscolha escolha) {

        EventoEscolha entidadeExistente ;
        if (escolha!=null && escolha.getId()!=null) {
            entidadeExistente = eventoEscolhaRepository.findById(escolha.getId()).orElseThrow(() -> new EntityNotFoundException("Escolha não encontrada com o ID: " + escolha.getId()));
        }
        else if(escolha!=null && escolha.getEvento()!=null && escolha.getEvento().getId()!=null && escolha.getPessoa()!=null && escolha.getPessoa().getId()!=null){
            entidadeExistente = eventoEscolhaRepository.findTopByEvento_IdAndPessoa_IdOrderByDataEscolhaDesc(escolha.getEvento().getId(), escolha.getPessoa().getId()).orElseThrow(() -> new EntityNotFoundException("Escolha não encontrada para: " + escolha.getPessoa().getNome()));
        }
        else {
            return ResponseEntity.badRequest().body("ID da escolha não pode ser nulo para limpeza.");
        }

        // 3. Aplicar APENAS as alterações desejadas na entidade gerenciada
        entidadeExistente.setStatus(StatusEnum.PAUSADO);
        entidadeExistente.setAlteradoEm(LocalDateTime.now());

        // ATENCAO: O método save é desnecessário aqui

        return ResponseEntity.ok().build();

    }

    // Retorna uma lista de historicos de escolhas, tira da lista a escolha ativa
    @GetMapping("/{token}/historico")
    @Transactional(readOnly = true)
    public ResponseEntity<HistoricoResponse> historicoEscolha(@PathVariable("token") String token) {

        EventoPessoa ep = eventoPessoaRepository.findByNomeMagicNumber(token).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Token inválido"));

        List<EventoEscolha> escolhasEncerradas = eventoEscolhaRepository.findByEvento_IdAndPessoa_IdAndStatusOrderByDataEscolhaDesc(ep.getEvento().getId(), ep.getPessoa().getId(), StatusEnum.PAUSADO);
        if (escolhasEncerradas.isEmpty()) {
            return ResponseEntity.ok(new HistoricoResponse(List.of()));
        }

        return ResponseEntity.ok(new HistoricoResponse(escolhasEncerradas));
    }

    @GetMapping("/imagem/{id}/arquivo")
    public ResponseEntity<Resource> buscarPorId(@PathVariable Long id) {
        return imagemService.buscarPorId(id)
                .map(img -> {
                    byte[] dados = img.getArquivo();
                    if (dados == null) {
                        return ResponseEntity.notFound().<Resource>build();
                    }
                    Resource resource = new ByteArrayResource(dados);
                    String filename = img.getNome() != null ? img.getNome() : ("imagem-" + id);
                    MediaType contentType = MediaType.APPLICATION_OCTET_STREAM;
                    try {
                        // Tenta inferir o content type pelo nome do arquivo
                        String lowered = filename.toLowerCase();
                        if (lowered.endsWith(".png")) contentType = MediaType.IMAGE_PNG;
                        else if (lowered.endsWith(".jpg") || lowered.endsWith(".jpeg")) contentType = MediaType.IMAGE_JPEG;
                        else if (lowered.endsWith(".gif")) contentType = MediaType.IMAGE_GIF;
                    } catch (Exception ignored) {}

                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                            .contentType(contentType)
                            .body(resource);
                })
                .orElse(ResponseEntity.notFound().<Resource>build());
    }


}
