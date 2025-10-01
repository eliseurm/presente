package br.eng.eliseu.presente.controller;

import br.eng.eliseu.presente.model.Cor;
import br.eng.eliseu.presente.model.filter.CorFilter;
import br.eng.eliseu.presente.service.CorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cor")
@RequiredArgsConstructor
public class CorController {

    private final CorService corService;

    @GetMapping
    public ResponseEntity<Page<Cor>> listar(CorFilter filtro) {
        Page<Cor> cores = corService.listar(filtro);
        return ResponseEntity.ok(cores);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cor> buscarPorId(@PathVariable Long id) {
        return corService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Cor> criar(@RequestBody Cor cor) {
        Cor novaCor = corService.criar(cor);
        return ResponseEntity.ok(novaCor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cor> atualizar(@PathVariable Long id, @RequestBody Cor cor) {
        try {
            Cor corAtualizada = corService.atualizar(id, cor);
            return ResponseEntity.ok(corAtualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            corService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/batch")
    public ResponseEntity<Map<String, Object>> deletarEmLote(@RequestBody List<Long> ids) {
        int deletados = corService.deletarEmLote(ids);
        return ResponseEntity.ok(Map.of(
                "total", ids.size(),
                "deletados", deletados
        ));
    }
}