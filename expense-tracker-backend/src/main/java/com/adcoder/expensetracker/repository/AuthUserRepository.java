package com.adcoder.expensetracker.repository;

import com.adcoder.expensetracker.model.AuthUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AuthUserRepository extends JpaRepository<AuthUser, Long> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<AuthUser> findByUsername(String username);
}
