package br.eng.eliseu.presente.security;

import br.eng.eliseu.presente.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDetailsServiceImpl(UsuarioRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // --- Busca usuario e senha do banco
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .map(user -> new UserAuthenticated(user))
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado: " + username));
    }


    // --- Para fim de testes simplicicados, usuario e senha fixas
//    @Override
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//        // TODO: Buscar do banco de dados via Repository
//        // Por enquanto, usuário de exemplo:
//        if ("admin".equals(username)) {
//            return User.builder()
//                    .username("admin")
//                    .password(passwordEncoder.encode("admin123")) // Senha: admin123
//                    .roles("ADMINISTRADOR")
//                    .build();
//        }
//
//        throw new UsernameNotFoundException("Usuário não encontrado: " + username);
//    }


}
