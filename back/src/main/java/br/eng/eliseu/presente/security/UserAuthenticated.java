package br.eng.eliseu.presente.security;

import java.util.Collection;
import java.util.List;

import br.eng.eliseu.presente.model.Usuario;
import br.eng.eliseu.presente.model.PapelEnum;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;


public class UserAuthenticated implements UserDetails {

    private final Usuario user;

    public UserAuthenticated(Usuario user) {
        this.user = user;
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        PapelEnum papel = user.getPapel();
        String roleName = switch (papel) {
            case ADMINISTRADOR -> "ROLE_ADMIN";
            case CLIENTE -> "ROLE_CLIENTE";
            case USUARIO -> "ROLE_USUARIO";
        };
        return List.of(() -> roleName);
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

}
