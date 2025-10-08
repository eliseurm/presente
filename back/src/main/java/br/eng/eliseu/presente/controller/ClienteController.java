package br.eng.eliseu.presente.controller;

import br.eng.eliseu.presente.model.Cliente;
import br.eng.eliseu.presente.model.filter.ClienteFilter;
import br.eng.eliseu.presente.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cliente")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    public ResponseEntity<Page<Cliente>> listar(ClienteFilter filtro) {
        return ResponseEntity.ok(clienteService.listar(filtro));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscarPorId(@PathVariable Long id) {
        return clienteService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Cliente> criar(@RequestBody Cliente cliente) {
        return ResponseEntity.ok(clienteService.criar(cliente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> atualizar(@PathVariable Long id, @RequestBody Cliente cliente) {
        try {
            Cliente atualizado = clienteService.atualizar(id, cliente);
            return ResponseEntity.ok(atualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            clienteService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/batch")
    public ResponseEntity<Map<String, Object>> deletarEmLote(@RequestBody List<Long> ids) {
        int deletados = clienteService.deletarEmLote(ids);
        return ResponseEntity.ok(Map.of(
                "total", ids.size(),
                "deletados", deletados
        ));
    }
}
