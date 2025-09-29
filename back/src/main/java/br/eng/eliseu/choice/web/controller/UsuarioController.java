package br.eng.eliseu.choice.web.controller;

import br.eng.eliseu.choice.model.Usuario;
import br.eng.eliseu.choice.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users/me")
public class UsuarioController {

    private final UsuarioRepository usuarioRepo;
    private final BCryptPasswordEncoder encoder;

    public UsuarioController(UsuarioRepository usuarioRepo, BCryptPasswordEncoder encoder) {
        this.usuarioRepo = usuarioRepo;
        this.encoder = encoder;
    }

    @GetMapping
    public ResponseEntity<?> me(@AuthenticationPrincipal User principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        Usuario u = usuarioRepo.findByUsername(principal.getUsername()).orElseThrow();
        return ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "role", u.getPapel().name()
        ));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal User principal,
                                            @RequestBody ChangePasswordRequest req) {
        if (principal == null) return ResponseEntity.status(401).build();

        Usuario u = usuarioRepo.findByUsername(principal.getUsername()).orElseThrow();

        if (req.newPassword() == null || req.newPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "A nova senha deve ter ao menos 6 caracteres."));
        }

        if (!encoder.matches(req.currentPassword(), u.getPasswordHash())) {
            return ResponseEntity.status(400).body(Map.of("message", "Senha atual inválida."));
        }

        if (encoder.matches(req.newPassword(), u.getPasswordHash())) {
            return ResponseEntity.status(400).body(Map.of("message", "A nova senha deve ser diferente da atual."));
        }

        u.setPasswordHash(encoder.encode(req.newPassword()));
        usuarioRepo.save(u);

        return ResponseEntity.noContent().build();
    }

    public record ChangePasswordRequest(String currentPassword, String newPassword) {}
}