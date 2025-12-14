package br.eng.eliseu.presente.config;

import java.nio.charset.StandardCharsets;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.OctetSequenceKey;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.http.HttpMethod;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

@Configuration
@EnableWebSecurity
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
public class SecurityConfig {

    @Value("${jwt.public.key}")
    private RSAPublicKey key;
    @Value("${jwt.private.key}")
    private RSAPrivateKey priv;


//    @Value("${jwt.secret}")
//    private String jwtSecret;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/auth/pessoa/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/favicon.ico").permitAll()
                        // Rotas públicas (considera execução direta e atrás de proxy com prefixo /api)
                        .requestMatchers("/presente/**").permitAll()
                        .requestMatchers("/api/presente/**").permitAll()
                        // Observação: não usar padrões inválidos com múltiplos **
                        // Mantemos as duas principais variantes explícitas
                        .requestMatchers(HttpMethod.GET, "/imagem/*/arquivo").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/imagem/*/arquivo").permitAll()
                        // Cobre proxies com prefixos adicionais (ex.: /v1/api/imagem/ID/arquivo, etc.)
                        .requestMatchers(HttpMethod.GET, "/**/imagem/*/arquivo**").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(conf -> conf
                        .bearerTokenResolver(bearerTokenResolver())
                        .jwt(jwt -> jwt
                        .decoder(jwtDecoder())
                        .jwtAuthenticationConverter(jwtAuthenticationConverter())
                ));

        return http.build();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withPublicKey(this.key).build();
    }

    @Bean
    JwtEncoder jwtEncoder() {
        JWK jwk = new RSAKey.Builder(this.key).privateKey(this.priv).build();
        JWKSource<SecurityContext> jwks = new ImmutableJWKSet<>(new JWKSet(jwk));
        return new NimbusJwtEncoder(jwks);
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter gac = new JwtGrantedAuthoritiesConverter();
        // Não prefixar com SCOPE_
        gac.setAuthorityPrefix("");
        // Usar claim "scope" (string com authorities separados por espaço)
        gac.setAuthoritiesClaimName("scope");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(gac);
        return converter;
    }

    @Bean
    BearerTokenResolver bearerTokenResolver() {
        DefaultBearerTokenResolver delegate = new DefaultBearerTokenResolver();
        // Permitir também via query param se necessário (não afeta nossas rotas públicas)
        delegate.setAllowUriQueryParameter(true);

        return request -> {
            String uri = request.getRequestURI();
            String method = request.getMethod();
            String contextPath = request.getContextPath();
            String path = uri;
            if (contextPath != null && !contextPath.isEmpty() && uri != null && uri.startsWith(contextPath)) {
                path = uri.substring(contextPath.length());
            }

            // Não tentar resolver Bearer Token em rotas públicas — mesmo que venha Authorization no header
            // Usa path normalizado e também tolera ambientes com prefixo adicional (ex.: /api)
            // Tratar como público qualquer rota que contenha "/presente/" em qualquer posição
            boolean isPresentePublic = (path != null && path.contains("/presente/")) || (uri != null && uri.contains("/presente/"));
            boolean isPublicImage = "GET".equalsIgnoreCase(method)
                    && ((path != null && path.contains("/imagem/") && path.contains("/arquivo"))
                        || (uri != null && uri.contains("/imagem/") && uri.contains("/arquivo")));
            boolean isFavicon = "/favicon.ico".equals(uri);

            if (isPresentePublic || isPublicImage || isFavicon) {
                return null; // ignora qualquer Authorization e segue como anônimo
            }

            return delegate.resolve(request);
        };
    }


}