package com.adcoder.expensetracker.service.impl;

import com.adcoder.expensetracker.dto.AuthRequest;
import com.adcoder.expensetracker.dto.AuthResponse;
import com.adcoder.expensetracker.dto.RegisterRequest;
import com.adcoder.expensetracker.dto.RegisterResponse;
import com.adcoder.expensetracker.exception.ExpenseTrackerException;
import com.adcoder.expensetracker.mapper.AuthMapper;
import com.adcoder.expensetracker.model.AuthUser;
import com.adcoder.expensetracker.repository.AuthUserRepository;
import com.adcoder.expensetracker.security.JwtUtil;
import com.adcoder.expensetracker.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public RegisterResponse registerUser(RegisterRequest request) {
        // Check if user already exists
        if (authUserRepository.existsByUsername(request.getUsername())) {
            throw new ExpenseTrackerException("Username already exists!", HttpStatus.CONFLICT);
        }

        if (authUserRepository.existsByEmail(request.getEmail())) {
            throw new ExpenseTrackerException("Email already exists!", HttpStatus.CONFLICT);
        }

        AuthUser user = AuthMapper.toAuthUserEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(OffsetDateTime.now());
        user.setUpdatedAt(OffsetDateTime.now());

        user = authUserRepository.save(user);

        return AuthMapper.toRegisterResponseDto(user);
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        AuthUser user = authUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ExpenseTrackerException("Invalid username or password", HttpStatus.UNAUTHORIZED));

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!passwordMatches) {
            throw new ExpenseTrackerException("Invalid username or password", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtUtil.generateToken(user);

        return AuthMapper.toAuthResponseDto(token);
    }

    @Override
    public RegisterResponse getCurrentUser(Long userId) {
        AuthUser user = authUserRepository.findById(userId)
                .orElseThrow(() -> new ExpenseTrackerException("User not found", HttpStatus.NOT_FOUND));

        return AuthMapper.toRegisterResponseDto(user);
    }
}

