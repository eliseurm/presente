
package br.eng.eliseu.presente.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    private final JwtService jwtService;

    public AuthenticationService(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public String authenticate(Authentication authentication) {
        return jwtService.generateToken(authentication);
    }

    public String authenticate(Authentication authentication, boolean remember) {
        // Se remember = true, token válido por 7 dias, senão 10 horas
        long expiry = remember ? 60L * 60L * 24L * 7L : 60L * 60L * 10L; // com remember 7 dias, sem remember 10 horas
//        long expiry = remember ? 120L : 60L; // 1 minuto normal, 2 minutos com remember
        return jwtService.generateToken(authentication, expiry);
    }
}