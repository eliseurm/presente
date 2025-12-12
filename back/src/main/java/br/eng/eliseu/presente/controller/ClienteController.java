package br.eng.eliseu.presente.controller;

import br.eng.eliseu.presente.model.Cliente;
import br.eng.eliseu.presente.model.filter.ClienteFilter;
import br.eng.eliseu.presente.repository.ClienteRepository;
import br.eng.eliseu.presente.repository.UsuarioRepository;
import br.eng.eliseu.presente.security.AuthorizationService;
import br.eng.eliseu.presente.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/cliente")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuthorizationService authService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Cliente>> listar(ClienteFilter filtro) {

        return ResponseEntity.ok(clienteService.listar(filtro));

    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClient(#id)")
    public ResponseEntity<Cliente> buscarPorId(@PathVariable Long id) {
        return clienteService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Cliente> criar(@RequestBody Cliente cliente) {

        return ResponseEntity.ok(clienteService.criar(cliente));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClient(#id)")
    public ResponseEntity<Cliente> atualizar(@PathVariable Long id, @RequestBody Cliente cliente) {
        try {
            Cliente atualizado = clienteService.atualizar(id, cliente);
            return ResponseEntity.ok(atualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClient(#id)")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            clienteService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deletarEmLote(@RequestBody List<Long> ids) {
        int deletados = clienteService.deletarEmLote(ids);
        return ResponseEntity.ok(Map.of(
                "total", ids.size(),
                "deletados", deletados
        ));
    }

    // Endpoint escopado: retorna apenas os clientes vinculados ao usuário autenticado
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN','CLIENTE')")
    public ResponseEntity<List<Cliente>> meusClientes() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return ResponseEntity.ok(List.of());
        }

        List<Cliente> clientes = new ArrayList<>();
        if(auth.getAuthorities().stream().filter(a -> a.getAuthority().equals("ROLE_ADMIN")).findFirst().isPresent()) {
            // se for um ADMIN
            clientes = clienteRepository.findAll();
        }
        else{
            // se for um CLIENTE
            String username = auth.getName();
            var usuarioOpt = usuarioRepository.findByUsername(username);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
            Long usuarioId = usuarioOpt.get().getId();
            clientes = clienteRepository.findByUsuario_Id(usuarioId);
        }
        return ResponseEntity.ok(clientes);
    }
}
