package br.eng.eliseu.choice.web.controller;

import br.eng.eliseu.choice.model.Usuario;
import br.eng.eliseu.choice.repository.EventoUsuarioRepository;
import br.eng.eliseu.choice.repository.UsuarioRepository;
import br.eng.eliseu.choice.security.JwtService;
import br.eng.eliseu.choice.web.dto.LoginRequest;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

import static br.eng.eliseu.choice.security.JwtAuthFilter.AUTH_COOKIE;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtService jwtService;
    private final AuthenticationManager authManager;
    private final UsuarioRepository usuarioRepo;
    private final EventoUsuarioRepository eventoUsuarioRepo;
    private final BCryptPasswordEncoder encoder;

    public AuthController(JwtService jwtService,
                          AuthenticationManager authManager,
                          UsuarioRepository usuarioRepo,
                          EventoUsuarioRepository eventoUsuarioRepo,
                          BCryptPasswordEncoder encoder) {
        this.jwtService = jwtService;
        this.authManager = authManager;
        this.usuarioRepo = usuarioRepo;
        this.eventoUsuarioRepo = eventoUsuarioRepo;
        this.encoder = encoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req,
                                   @RequestParam(name = "remember", defaultValue = "false") boolean remember) {
        // Autentica credenciais
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        if (!auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Credenciais inválidas."));
        }

        Usuario u = usuarioRepo.findByUsername(req.username()).orElseThrow();

        // Regra de CLIENTE: precisa ter evento ativo
        if (u.getPapel().name().equals("CLIENTE")) {
            boolean temAtivo = eventoUsuarioRepo.usuarioTemEventoAtivo(u.getId(), LocalDateTime.now());
            if (!temAtivo) {
                return ResponseEntity.status(401)
                        .body(Map.of("message", "Você não possui evento ativo no momento. Acesso negado."));
            }
        }

        // Emite JWT
        String jwt = jwtService.issue(u.getUsername(), Map.of(
                "uid", u.getId(),
                "role", "ROLE_" + u.getPapel().name()
        ));

        // Define cookie HttpOnly (duração conforme app.jwt.expirationSeconds; se remember=true, pode aumentar)
        long maxAge = remember ? 60L * 60L * 24L : -1L; // 1 dia ou sessão
        ResponseCookie cookie = ResponseCookie.from(AUTH_COOKIE, jwt)
                .httpOnly(true)
                .secure(true)         // true em produção com HTTPS
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAge)
                .build();

        // Corpo com informações do usuário (para o front saber o papel sem ler o cookie)
        Map<String, Object> body = Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "role", u.getPapel().name()
        );

        return ResponseEntity.ok()
                .header("Set-Cookie", cookie.toString())
                .body(body);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal User principal) {
        if (principal == null) return ResponseEntity.status(401).build();

        Usuario u = usuarioRepo.findByUsername(principal.getUsername()).orElseThrow();
        Map<String, Object> body = Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "role", u.getPapel().name()
        );
        return ResponseEntity.ok(body);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = ResponseCookie.from(AUTH_COOKIE, "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.noContent()
                .header("Set-Cookie", cookie.toString())
                .build();
    }
}
