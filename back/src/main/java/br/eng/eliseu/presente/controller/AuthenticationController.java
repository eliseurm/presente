package br.eng.eliseu.presente.controller;

import br.eng.eliseu.presente.model.Usuario;
import br.eng.eliseu.presente.repository.UsuarioRepository;
import br.eng.eliseu.presente.repository.ClienteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import br.eng.eliseu.presente.security.AuthenticationService;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;

    public AuthenticationController(
            AuthenticationService authenticationService,
            AuthenticationManager authenticationManager,
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository) {
        this.authenticationService = authenticationService;
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest loginRequest,
            @RequestParam(name = "remember", defaultValue = "false") boolean remember) {
        try {
            // Autentica o usuário
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.username(),
                            loginRequest.password()
                    )
            );

            // Busca dados completos do usuário
            Usuario usuario = usuarioRepository.findByUsername(loginRequest.username())
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            // Monta claims em PT-BR
            var clienteIds = clienteRepository.findByUsuario_Id(usuario.getId())
                    .stream().map(c -> c.getId()).toList();

            // Gera token com claims e expiração baseada no "remember me"
            String token = authenticationService.authenticateWithClaims(
                    authentication,
                    remember,
                    java.util.Map.of(
                            "usuario_id", usuario.getId(),
                            "cliente_ids", clienteIds
                    ),
                    usuario.getUsername()
            );

            // Extrai role limpo (sem ROLE_ prefix)
            String role = authentication.getAuthorities().stream()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .findFirst()
                    .orElse("");

            return ResponseEntity.ok(new LoginResponse(
                    token,
                    usuario.getId(),
                    usuario.getUsername(),
                    role,
                    remember
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(new ErrorResponse("Credenciais inválidas"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(JwtAuthenticationToken token) {
        try {
            String username = token.getName();

            Usuario usuario = usuarioRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            String role = token.getAuthorities().stream()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .findFirst()
                    .orElse("");

            return ResponseEntity.ok(new MeResponse(
                    usuario.getId(),
                    usuario.getUsername(),
                    role
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new ErrorResponse("Token inválido"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(new MessageResponse("Logout realizado com sucesso"));
    }

    // Records
    public record LoginRequest(String username, String password) {}

    public record LoginResponse(
            String token,
            Long id,
            String username,
            String role,
            boolean remember
    ) {}

    public record MeResponse(Long id, String username, String role) {}

    public record MessageResponse(String message) {}

    public record ErrorResponse(String message) {}
}