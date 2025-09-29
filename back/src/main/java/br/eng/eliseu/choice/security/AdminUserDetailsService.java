package br.eng.eliseu.choice.security;

import br.eng.eliseu.choice.model.AdminUser;
import br.eng.eliseu.choice.repo.AdminUserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminUserDetailsService implements UserDetailsService {

    private final AdminUserRepository repo;

    public AdminUserDetailsService(AdminUserRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AdminUser u = repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("not found"));
        return new User(u.getUsername(), u.getPasswordHash(), List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }
}
