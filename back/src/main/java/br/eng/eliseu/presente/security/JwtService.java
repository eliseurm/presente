package br.eng.eliseu.presente.security;

import java.time.Instant;
import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final JwtEncoder encoder;

    public JwtService(JwtEncoder encoder) {
        this.encoder = encoder;
    }

    public String generateToken(Authentication authentication) {
        return generateToken(authentication, 36000L); // 10 horas (padrão)
    }

    public String generateToken(Authentication authentication, long expiryInSeconds) {
        String scope = authentication
                .getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        return generateTokenWithClaims(
                authentication.getName(),
                scope,
                Map.of(),
                expiryInSeconds
        );
    }

    public String generateTokenWithClaims(String subject, String scope, Map<String, Object> extraClaims, long expiryInSeconds) {
        Instant now = Instant.now();

        JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
                .issuer("spring-security-jwt")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiryInSeconds))
                .subject(subject)
                .claim("scope", scope);

        if (extraClaims != null) {
            extraClaims.forEach(builder::claim);
        }

        JwtClaimsSet claims = builder.build();
        return encoder.encode(JwtEncoderParameters.from(claims))
                .getTokenValue();
    }
}