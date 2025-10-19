package com.adcoder.expensetracker.security;

import com.adcoder.expensetracker.exception.ExpenseTrackerException;
import com.adcoder.expensetracker.model.AuthUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@Setter
@ConfigurationProperties(prefix = "security.jwt")
public class JwtUtil {
    private String secret;
    private Long duration;

    @PostConstruct
    private void initializeDefaults() {
        if (this.secret == null || this.secret.isBlank()) {
            log.info("No JWT secret found in properties. Generating one...");
            generateSecretKey();
        } else {
            log.info("Using JWT secret from application.properties");
        }

        if(this.duration == null || this.duration == 0) {
            log.info("No JWT expiration duration found in properties. Assigning default ...");
            this.duration = 15L;
        } else {
            log.info("Using JWT expiration duration from application.properties");
        }
    }

    private SecretKey getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private void generateSecretKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance("HmacSHA256");
            SecretKey secretKey = keyGenerator.generateKey();
            this.secret = Base64.getEncoder().encodeToString(secretKey.getEncoded());
        } catch (NoSuchAlgorithmException e) {
            throw new ExpenseTrackerException("Error in generating security.jwt.secret",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public String generateToken(AuthUser authUser) {

        Map<String, Object> claims = Map.of(
                "uid", authUser.getId()
        );

        long timeInMillis = System.currentTimeMillis();

        return Jwts.builder()
                .issuedAt(new Date(timeInMillis))
                .expiration(new Date(timeInMillis + Duration.of(duration, ChronoUnit.MINUTES).toMillis()))
                .subject(authUser.getUsername())
                .claims(claims)
                .signWith(getKey())
                .compact();
    }

    public Claims extractAllClaims(String token) {
        JwtParser jwtParser = Jwts.parser()
                .verifyWith(getKey())
                .build();
        return jwtParser.parseSignedClaims(token).getPayload();
    }

    public boolean validateToken(String token) {
        boolean isValid;
        try {
            Claims claims = extractAllClaims(token);
            isValid = claims.getExpiration() != null && claims.getExpiration().after(new java.util.Date());
        } catch (JwtException ex) {
            isValid = false;
        }
        return isValid;
    }

    public JwtPrincipal createJwtPrincipal(String token) {
        Claims claims = extractAllClaims(token);
        return JwtPrincipal.builder()
                .userId(claims.get("uid", Long.class))
                .username(claims.getSubject())
                .build();
    }

    public List<GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }
}
