package br.eng.eliseu.choice.web;

import br.eng.eliseu.choice.model.AccessKey;
import br.eng.eliseu.choice.model.AdminUser;
import br.eng.eliseu.choice.repo.AccessKeyRepository;
import br.eng.eliseu.choice.repo.AdminUserRepository;
import br.eng.eliseu.choice.security.JwtService;
import br.eng.eliseu.choice.service.TokenUtil;
import br.eng.eliseu.choice.web.dto.LoginRequest;
import br.eng.eliseu.choice.web.dto.LoginResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AccessKeyRepository accessKeyRepo;
    private final JwtService jwtService;
    private final TokenUtil tokenUtil;
    private final AuthenticationManager authManager;
    private final AdminUserRepository adminRepo;
    private final BCryptPasswordEncoder encoder;

    public AuthController(AccessKeyRepository accessKeyRepo, JwtService jwtService, TokenUtil tokenUtil,
                          AuthenticationManager authManager, AdminUserRepository adminRepo, BCryptPasswordEncoder encoder) {
        this.accessKeyRepo = accessKeyRepo;
        this.jwtService = jwtService;
        this.tokenUtil = tokenUtil;
        this.authManager = authManager;
        this.adminRepo = adminRepo;
        this.encoder = encoder;
    }

    @PostMapping("/exchange")
    public ResponseEntity<?> exchange(@RequestParam String token){
        String lookup = tokenUtil.lookup(token);
        AccessKey ak = accessKeyRepo.findByTokenLookup(lookup).orElseThrow();
        if(ak.getExpiresAt().isBefore(LocalDateTime.now())) return ResponseEntity.status(401).body("expired");
        if(ak.isSingleUse() && ak.getUsedAt()!=null) return ResponseEntity.status(401).body("already used");
        if(!tokenUtil.matches(token, ak.getTokenHash())) return ResponseEntity.status(401).body("invalid");

        ak.setUsesCount(ak.getUsesCount()+1);
        if(ak.isSingleUse()) ak.setUsedAt(LocalDateTime.now());
        accessKeyRepo.save(ak);

        String jwt = jwtService.issue(ak.getPerson().getId().toString(), Map.of("role","ROLE_USER"));
        return ResponseEntity.ok(new LoginResponse(jwt));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req){
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        if(auth.isAuthenticated()){
            String jwt = jwtService.issue(req.username(), Map.of("role","ROLE_ADMIN"));
            return ResponseEntity.ok(new LoginResponse(jwt));
        }
        return ResponseEntity.status(401).build();
    }
}
