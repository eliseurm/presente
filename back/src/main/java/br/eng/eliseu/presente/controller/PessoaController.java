package br.eng.eliseu.presente.controller;

import br.eng.eliseu.presente.model.Pessoa;
import br.eng.eliseu.presente.model.Cliente;
import br.eng.eliseu.presente.model.filter.PessoaFilter;
import br.eng.eliseu.presente.repository.ClienteRepository;
import br.eng.eliseu.presente.repository.PessoaRepository;
import br.eng.eliseu.presente.repository.UsuarioRepository;
import br.eng.eliseu.presente.service.PessoaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pessoa")
@RequiredArgsConstructor
public class PessoaController {

    private final PessoaService pessoaService;
    private final PessoaRepository pessoaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClient(#filtro.clienteId)")
    public ResponseEntity<Page<Pessoa>> listar(@Valid @ModelAttribute PessoaFilter filtro) {
        Page<Pessoa> pessoas = pessoaService.listar(filtro);
        return ResponseEntity.ok(pessoas);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CLIENTE')")
    public ResponseEntity<Pessoa> buscarPorId(@PathVariable Long id) {
        return pessoaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("""
                hasRole('ADMIN') or 
                (
                    #pessoa != null and
                    #pessoa.cliente != null and
                    #pessoa.cliente.id != null and
                    @authService.isLinkedToClient(#pessoa.cliente.id)
                )
            """)
    public ResponseEntity<Pessoa> criar(@Valid @RequestBody Pessoa pessoa) {
        Pessoa novaPessoa = pessoaService.criar(pessoa);
        return ResponseEntity.ok(novaPessoa);
    }

    @PutMapping("/{id}")
    @PreAuthorize("""
                hasRole('ADMIN') or 
                (
                    #pessoa != null and
                    #pessoa.cliente != null and
                    #pessoa.cliente.id != null and
                    @authService.isLinkedToClient(#pessoa.cliente.id)
                )
            """)
    public ResponseEntity<Pessoa> atualizar(@PathVariable Long id, @Valid @RequestBody Pessoa pessoa) {
        try {
            Pessoa pessoaAtualizada = pessoaService.atualizar(id, pessoa);
            return ResponseEntity.ok(pessoaAtualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isOwnerPessoa(#id)")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            pessoaService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/batch")
    public ResponseEntity<Map<String, Object>> deletarEmLote(@RequestBody List<Long> ids) {
        int deletados = pessoaService.deletarEmLote(ids);
        return ResponseEntity.ok(Map.of(
                "total", ids.size(),
                "deletados", deletados
        ));
    }

    // Lookup leve de pessoas (ADMIN: geral; CLIENTE: restrito ao(s) seu(s) cliente(s))
    @GetMapping("/lookup")
    @PreAuthorize("hasAnyRole('ADMIN','CLIENTE')")
    public ResponseEntity<List<Map<String, Object>>> lookup(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "clienteId", required = false) Long clienteId
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch("ROLE_ADMIN"::equals);
        List<Pessoa> pessoas;

        if (isAdmin) {
            pessoas = pessoaRepository.lookupAdmin(q);
        } else {
            // ROLE_CLIENTE: precisa estar vinculado ao clienteId quando informado
            String username = auth.getName();
            var usuarioOpt = usuarioRepository.findByUsername(username);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
            Long usuarioId = usuarioOpt.get().getId();
            if (clienteId != null) {
                // valida vínculo
                var ok = clienteRepository.findById(clienteId)
                        .map(c -> c.getUsuario() != null && usuarioId.equals(c.getUsuario().getId()))
                        .orElse(false);
                if (!ok) {
                    return ResponseEntity.status(403).body(List.of());
                }
                pessoas = pessoaRepository.lookupByCliente(clienteId, q);
            } else {
                // Agregar para todos os clientes do usuário
                var clientes = clienteRepository.findByUsuario_Id(usuarioId);
                Set<Long> cids = clientes.stream().map(Cliente::getId).collect(Collectors.toCollection(LinkedHashSet::new));
                Set<Pessoa> acumulado = new LinkedHashSet<>();
                for (Long cid : cids) {
                    acumulado.addAll(pessoaRepository.lookupByCliente(cid, q));
                }
                pessoas = List.copyOf(acumulado);
            }
        }

        // Mapear para payload leve
        List<Map<String, Object>> payload = pessoas.stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("nome", p.getNome());
            m.put("email", p.getEmail());
            m.put("telefone", p.getTelefone());
            return m;
        }).toList();

        return ResponseEntity.ok(payload);
    }
}