package br.eng.eliseu.presente.controller;

import br.eng.eliseu.presente.model.Evento;
import br.eng.eliseu.presente.model.EventoPessoa;
import br.eng.eliseu.presente.model.EventoProduto;
import br.eng.eliseu.presente.model.StatusEnum;
import br.eng.eliseu.presente.model.filter.EventoFilter;
import br.eng.eliseu.presente.service.EventoService;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<Page<Evento>> listar(EventoFilter filtro) {

        return ResponseEntity.ok(eventoService.listar(filtro));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evento> buscarPorId(@PathVariable Long id) {
        return eventoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Evento> criar(@RequestBody Evento evento) {

        return ResponseEntity.ok(eventoService.criar(evento));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Evento> atualizar(@PathVariable Long id, @RequestBody Evento evento) {
        try {
            Evento atualizado = eventoService.atualizar(id, evento);
            return ResponseEntity.ok(atualizado);
        } catch (RuntimeException e) {
            // Fallback de upsert: se não existir, cria um novo registro
            try {
                Evento criado = eventoService.criar(evento);
                return ResponseEntity.ok(criado);
            } catch (RuntimeException ex) {
                return ResponseEntity.notFound().build();
            }
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            eventoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/batch")
    public ResponseEntity<Map<String, Object>> deletarEmLote(@RequestBody List<Long> ids) {
        int deletados = eventoService.deletarEmLote(ids);
        return ResponseEntity.ok(Map.of(
                "total", ids.size(),
                "deletados", deletados
        ));
    }

    @PostMapping("/{id}/pessoas/import")
    public ResponseEntity<Map<String, Object>> importarPessoasCsv(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        int adicionados = eventoService.importarPessoasCsv(id, file);
        return ResponseEntity.ok(Map.of("adicionados", adicionados));
    }

    // ======= Endpoints de vínculo: Pessoas =======

    public static record AddPessoaRequest(Long pessoaId, StatusEnum status) {}
    public static record UpdateStatusRequest(StatusEnum status) {}

    @PostMapping("/{id}/pessoas")
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
    public ResponseEntity<EventoPessoa> atualizarStatusPessoa(
            @PathVariable("id") Long eventoId,
            @PathVariable Long eventoPessoaId,
            @RequestBody UpdateStatusRequest req
    ) {
        if (req == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(eventoService.updatePessoaVinculo(eventoId, eventoPessoaId, req.status()));
    }

    @DeleteMapping("/{id}/pessoas/{eventoPessoaId}")
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
    public ResponseEntity<EventoProduto> atualizarStatusProduto(
            @PathVariable("id") Long eventoId,
            @PathVariable Long eventoProdutoId,
            @RequestBody UpdateStatusRequest req
    ) {
        if (req == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(eventoService.updateProdutoVinculo(eventoId, eventoProdutoId, req.status()));
    }

    @DeleteMapping("/{id}/produtos/{eventoProdutoId}")
    public ResponseEntity<Void> removerProduto(
            @PathVariable("id") Long eventoId,
            @PathVariable Long eventoProdutoId
    ) {
        eventoService.removeProdutoVinculo(eventoId, eventoProdutoId);
        return ResponseEntity.noContent().build();
    }
}
