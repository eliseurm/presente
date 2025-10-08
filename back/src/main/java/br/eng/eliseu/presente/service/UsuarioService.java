package br.eng.eliseu.presente.service;

import br.eng.eliseu.presente.model.Usuario;
import br.eng.eliseu.presente.model.filter.UsuarioFilter;
import br.eng.eliseu.presente.repository.UsuarioRepository;
import br.eng.eliseu.presente.service.api.AbstractCrudService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService extends AbstractCrudService<Usuario, Long, UsuarioFilter> {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    protected UsuarioRepository getRepository() {
        return usuarioRepository;
    }

    @Override
    protected JpaSpecificationExecutor<Usuario> getSpecificationExecutor() {
        return usuarioRepository;
    }

    @Override
    protected Specification<Usuario> buildSpecification(UsuarioFilter filtro) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (filtro.getUsername() != null && !filtro.getUsername().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("username")), "%" + filtro.getUsername().toLowerCase() + "%"));
            }
            if (filtro.getPapel() != null) {
                predicates.add(cb.equal(root.get("papel"), filtro.getPapel()));
            }
            if (filtro.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filtro.getStatus()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    protected void prepararParaCriacao(Usuario entidade) {
        entidade.setId(null);
        // Se senha em texto puro foi informada, gerar o hash
        if (entidade.getSenha() != null && !entidade.getSenha().isBlank()) {
            entidade.setPasswordHash(passwordEncoder.encode(entidade.getSenha()));
        }
        // Se nenhuma senha foi informada e não há hash, define uma senha padrão temporária
        if (entidade.getPasswordHash() == null || entidade.getPasswordHash().isBlank()) {
            entidade.setPasswordHash(passwordEncoder.encode("123456"));
        }
    }

    @Override
    protected void prepararParaAtualizacao(Long id, Usuario entidade, Usuario entidadeExistente) {
        entidadeExistente.setUsername(entidade.getUsername());
        entidadeExistente.setPapel(entidade.getPapel());
        entidadeExistente.setStatus(entidade.getStatus());
        // Atualiza o hash apenas se uma nova senha foi enviada
        if (entidade.getSenha() != null && !entidade.getSenha().isBlank()) {
            entidadeExistente.setPasswordHash(passwordEncoder.encode(entidade.getSenha()));
        }
    }
}
