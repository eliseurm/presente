package br.eng.eliseu.presente.controller;

import br.eng.eliseu.presente.model.Evento;
import br.eng.eliseu.presente.model.EventoPessoa;
import br.eng.eliseu.presente.model.EventoProduto;
import br.eng.eliseu.presente.model.StatusEnum;
import br.eng.eliseu.presente.model.filter.EventoFilter;
import br.eng.eliseu.presente.service.EventoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/evento")
@RequiredArgsConstructor
public class EventoController {

    private final EventoService eventoService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or (#filtro.clienteId != null and @authService.isLinkedToClient(#filtro.clienteId))")
    public ResponseEntity<Page<Evento>> listar(EventoFilter filtro) {

        return ResponseEntity.ok(eventoService.listar(filtro));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    public ResponseEntity<Evento> buscarPorId(@PathVariable Long id, @RequestParam(value = "expand", required = false) String expand) {
        return eventoService.buscarPorIdComExpand(id, expand)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or ( #evento != null and #evento.cliente != null and @authService.isLinkedToClient(#evento.cliente.id) )")
    public ResponseEntity<Evento> criar(@RequestBody Evento evento) {

        return ResponseEntity.ok(eventoService.criar(evento));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    public ResponseEntity<Evento> atualizar(@PathVariable Long id, @RequestBody Evento evento) {
        try {
            Evento atualizado = eventoService.atualizar(id, evento);
            return ResponseEntity.ok(atualizado);
        } catch (RuntimeException e) {
            // Não fazer upsert aqui: comportamento correto é retornar 404 quando não encontrado
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            eventoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deletarEmLote(@RequestBody List<Long> ids) {
        int deletados = eventoService.deletarEmLote(ids);
        return ResponseEntity.ok(Map.of(
                "total", ids.size(),
                "deletados", deletados
        ));
    }

    @PostMapping("/{id}/pessoas/import")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    public ResponseEntity<Map<String, Object>> importarPessoasCsv(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        int adicionados = eventoService.importarPessoasCsv(id, file);
        return ResponseEntity.ok(Map.of("adicionados", adicionados));
    }

    // ======= Endpoints de vínculo: Pessoas =======

    public static record AddPessoaRequest(Long pessoaId, StatusEnum status) {}
    public static record UpdateStatusRequest(StatusEnum status) {}

    @PostMapping("/{id}/pessoas")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#eventoId)")
    public ResponseEntity<EventoPessoa> adicionarOuAtualizarPessoa(
            @PathVariable("id") Long eventoId,
            @RequestBody AddPessoaRequest req
    ) {
        if (req == null || req.pessoaId() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(eventoService.addOrUpdatePessoa(eventoId, req.pessoaId(), req.status()));
    }

    @PutMapping("/{id}/pessoas/{eventoPessoaId}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#eventoId)")
    public ResponseEntity<EventoPessoa> atualizarStatusPessoa(
            @PathVariable("id") Long eventoId,
            @PathVariable Long eventoPessoaId,
            @RequestBody UpdateStatusRequest req
    ) {
        if (req == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(eventoService.updatePessoaVinculo(eventoId, eventoPessoaId, req.status()));
    }

    @DeleteMapping("/{id}/pessoas/{eventoPessoaId}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#eventoId)")
    public ResponseEntity<Void> removerPessoa(
            @PathVariable("id") Long eventoId,
            @PathVariable Long eventoPessoaId
    ) {
        eventoService.removePessoaVinculo(eventoId, eventoPessoaId);
        return ResponseEntity.noContent().build();
    }

    // ======= Endpoints de vínculo: Produtos =======

    public static record AddProdutoRequest(Long produtoId, StatusEnum status) {}

    @PostMapping("/{id}/produtos")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#eventoId)")
    public ResponseEntity<EventoProduto> adicionarOuAtualizarProduto(
            @PathVariable("id") Long eventoId,
            @RequestBody AddProdutoRequest req
    ) {
        if (req == null || req.produtoId() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(eventoService.addOrUpdateProduto(eventoId, req.produtoId(), req.status()));
    }

    @PutMapping("/{id}/produtos/{eventoProdutoId}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#eventoId)")
    public ResponseEntity<EventoProduto> atualizarStatusProduto(
            @PathVariable("id") Long eventoId,
            @PathVariable Long eventoProdutoId,
            @RequestBody UpdateStatusRequest req
    ) {
        if (req == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(eventoService.updateProdutoVinculo(eventoId, eventoProdutoId, req.status()));
    }

    @DeleteMapping("/{id}/produtos/{eventoProdutoId}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#eventoId)")
    public ResponseEntity<Void> removerProduto(
            @PathVariable("id") Long eventoId,
            @PathVariable Long eventoProdutoId
    ) {
        eventoService.removeProdutoVinculo(eventoId, eventoProdutoId);
        return ResponseEntity.noContent().build();
    }

    // ======= Controle do Evento: Iniciar / Parar =======

    public static record IniciarRequest(String baseUrl) {}

    @PostMapping("/{id}/iniciar")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    public ResponseEntity<Map<String, Object>> iniciar(
            @PathVariable("id") Long id,
            @RequestBody(required = false) IniciarRequest req
    ) {
        String baseUrl = req != null ? req.baseUrl() : null;
        return ResponseEntity.ok(eventoService.iniciarEvento(id, baseUrl));
    }

    @PostMapping("/{id}/parar")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    public ResponseEntity<Map<String, Object>> parar(@PathVariable("id") Long id) {
        return ResponseEntity.ok(eventoService.pararEvento(id));
    }
}
