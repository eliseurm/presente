package br.eng.eliseu.presente.controller;

import br.eng.eliseu.presente.model.Tamanho;
import br.eng.eliseu.presente.model.filter.TamanhoFilter;
import br.eng.eliseu.presente.service.TamanhoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tamanho")
@RequiredArgsConstructor
public class TamanhoController {

    private final TamanhoService tamanhoService;

    @GetMapping
    public ResponseEntity<Page<Tamanho>> listar(TamanhoFilter filtro) {
        Page<Tamanho> tamanhos = tamanhoService.listar(filtro);
        return ResponseEntity.ok(tamanhos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tamanho> buscarPorId(@PathVariable Long id) {
        return tamanhoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Tamanho> criar(@RequestBody Tamanho tamanho) {
        Tamanho novaTamanho = tamanhoService.criar(tamanho);
        return ResponseEntity.ok(novaTamanho);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tamanho> atualizar(@PathVariable Long id, @RequestBody Tamanho tamanho) {
        try {
            Tamanho tamanhoAtualizado = tamanhoService.atualizar(id, tamanho);
            return ResponseEntity.ok(tamanhoAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            tamanhoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/batch")
    public ResponseEntity<Map<String, Object>> deletarEmLote(@RequestBody List<Long> ids) {
        int deletados = tamanhoService.deletarEmLote(ids);
        return ResponseEntity.ok(Map.of("total", ids.size(), "deletados", deletados
        ));
    }
}