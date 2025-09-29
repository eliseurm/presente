package br.eng.eliseu.choice.service;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class TokenUtil {
    private final SecureRandom random = new SecureRandom();

    public String generateToken(int bytes){
        byte[] buf = new byte[bytes];
        random.nextBytes(buf);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
    }

    public String bcrypt(String token){
        return BCrypt.hashpw(token, BCrypt.gensalt());
    }

    public boolean matches(String raw, String hash){
        return BCrypt.checkpw(raw, hash);
    }

    public String lookup(String token){
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] d = md.digest(token.getBytes(StandardCharsets.UTF_8));
            // 8 bytes (16 hex chars) lookup
            StringBuilder sb = new StringBuilder();
            for(int i=0;i<8;i++) sb.append(String.format("%02x", d[i]));
            return sb.toString();
        } catch (Exception e){
            throw new RuntimeException(e);
        }
    }
}
