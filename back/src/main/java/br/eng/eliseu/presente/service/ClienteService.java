package br.eng.eliseu.presente.service;

import br.eng.eliseu.presente.model.Cliente;
import br.eng.eliseu.presente.model.filter.ClienteFilter;
import br.eng.eliseu.presente.repository.ClienteRepository;
import br.eng.eliseu.presente.service.api.AbstractCrudService;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService extends AbstractCrudService<Cliente, Long, ClienteFilter> {

    private final ClienteRepository clienteRepository;

    @Override
    protected ClienteRepository getRepository() {
        return clienteRepository;
    }

    @Override
    protected JpaSpecificationExecutor<Cliente> getSpecificationExecutor() {
        return clienteRepository;
    }

    @Override
    protected Specification<Cliente> buildSpecification(ClienteFilter filtro) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (filtro.getNome() != null && !filtro.getNome().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("nome")), "%" + filtro.getNome().toLowerCase() + "%"));
            }
            if (filtro.getEmail() != null && !filtro.getEmail().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("email")), "%" + filtro.getEmail().toLowerCase() + "%"));
            }
            if (filtro.getTelefone() != null && !filtro.getTelefone().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("telefone")), "%" + filtro.getTelefone().toLowerCase() + "%"));
            }
            if (filtro.getUsuarioId() != null) {
                var usuarioJoin = root.join("usuario", JoinType.LEFT);
                predicates.add(cb.equal(usuarioJoin.get("id"), filtro.getUsuarioId()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    protected void prepararParaCriacao(Cliente entidade) {
        entidade.setId(null);
    }

    @Override
    protected void prepararParaAtualizacao(Long id, Cliente entidade, Cliente entidadeExistente) {
        // Se for ROLE_CLIENTE, só permitir alterar Nome e Status
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isCliente = auth != null && auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch("ROLE_CLIENTE"::equals);
        if (isCliente) {
            entidadeExistente.setNome(entidade.getNome());
            entidadeExistente.setStatus(entidade.getStatus());
            // Demais campos são ignorados para CLIENTE
            return;
        }
        // ADMIN (ou demais papéis) podem atualizar todos os campos
        entidadeExistente.setNome(entidade.getNome());
        entidadeExistente.setEmail(entidade.getEmail());
        entidadeExistente.setTelefone(entidade.getTelefone());
        entidadeExistente.setUsuario(entidade.getUsuario());
        entidadeExistente.setAnotacoes(entidade.getAnotacoes());
        entidadeExistente.setStatus(entidade.getStatus());
    }
}
