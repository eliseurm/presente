package br.eng.eliseu.choice.web;

import br.eng.eliseu.choice.security.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtSubjectInjectorFilter implements Filter {

    private final JwtService jwtService;

    public JwtSubjectInjectorFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        String auth = req.getHeader(HttpHeaders.AUTHORIZATION);
        if(auth != null && auth.startsWith("Bearer ")){
            try {
                String token = auth.substring(7);
                Claims claims = jwtService.parse(token);
                request.setAttribute("jwt-subject", claims.getSubject());
            } catch (Exception ignored) {}
        }
        chain.doFilter(request, response);
    }
}
