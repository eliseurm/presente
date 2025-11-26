package br.eng.eliseu.presente.security;

import br.eng.eliseu.presente.model.Cliente;
import br.eng.eliseu.presente.model.Evento;
import br.eng.eliseu.presente.repository.ClienteRepository;
import br.eng.eliseu.presente.repository.EventoRepository;
import br.eng.eliseu.presente.repository.PessoaRepository;
import br.eng.eliseu.presente.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service("authService")
public class AuthorizationService {

    private final ClienteRepository clienteRepository;
    private final EventoRepository eventoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PessoaRepository pessoaRepository;

    public AuthorizationService(ClienteRepository clienteRepository,
                                EventoRepository eventoRepository,
                                UsuarioRepository usuarioRepository,
                                PessoaRepository pessoaRepository) {
        this.clienteRepository = clienteRepository;
        this.eventoRepository = eventoRepository;
        this.usuarioRepository = usuarioRepository;
        this.pessoaRepository = pessoaRepository;
    }

    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch("ROLE_ADMIN"::equals);
    }

    public boolean isLinkedToClient(Long clientId) {
        if (clientId == null) return false;
        if (isAdmin()) return true;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;

        boolean isClienteRole = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch("ROLE_CLIENTE"::equals);
        if (!isClienteRole) return false;

        String username = auth.getName();
        var userOpt = usuarioRepository.findByUsername(username);
        if (userOpt.isEmpty()) return false;
        Long usuarioId = userOpt.get().getId();

        Optional<Cliente> clienteOpt = clienteRepository.findById(clientId);
        return clienteOpt.map(c -> c.getUsuario() != null && usuarioId.equals(c.getUsuario().getId())).orElse(false);
    }

    public boolean isLinkedToClientByEventoId(Long eventoId) {
        if (eventoId == null) return false;
        if (isAdmin()) return true;

        Optional<Evento> evento = eventoRepository.findById(eventoId);
        return evento.map(ev -> ev.getCliente() != null && isLinkedToClient(ev.getCliente().getId())).orElse(false);
    }

    public boolean isOwnerPessoa(Long pessoaId) {
        if (pessoaId == null) return false;
        if (isAdmin()) return true;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;

        boolean isUsuarioRole = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch("ROLE_USUARIO"::equals);
        if (!isUsuarioRole) return false;

        return pessoaRepository.findById(pessoaId).map(p -> {
            String subject = auth.getName();
            // Para login de Pessoa, o subject deverá ser telefone ou email
            return subject != null && (subject.equalsIgnoreCase(p.getEmail()) || subject.equals(p.getTelefone()));
        }).orElse(false);
    }
}
