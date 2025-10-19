package com.adcoder.expensetracker.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;
import java.util.Objects;

public class JwtAuthenticationToken extends AbstractAuthenticationToken {
    private final transient JwtPrincipal jwtPrincipal;

    public JwtAuthenticationToken(JwtPrincipal jwtPrincipal, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.jwtPrincipal = jwtPrincipal;
        super.setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return jwtPrincipal;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        JwtAuthenticationToken that = (JwtAuthenticationToken) o;
        return Objects.equals(jwtPrincipal, that.jwtPrincipal);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), jwtPrincipal);
    }
}
