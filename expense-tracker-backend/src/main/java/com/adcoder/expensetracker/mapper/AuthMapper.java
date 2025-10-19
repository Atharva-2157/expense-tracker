package com.adcoder.expensetracker.mapper;

import com.adcoder.expensetracker.dto.AuthResponse;
import com.adcoder.expensetracker.dto.RegisterRequest;
import com.adcoder.expensetracker.dto.RegisterResponse;
import com.adcoder.expensetracker.model.AuthUser;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class AuthMapper {
    public static AuthUser toAuthUserEntity(RegisterRequest registerRequest) {
        return AuthUser.builder()
                .username(registerRequest.getUsername())
                .password(registerRequest.getPassword())
                .email(registerRequest.getEmail())
                .build();
    }

    public static RegisterResponse toRegisterResponseDto(AuthUser authUser) {
        return RegisterResponse.builder()
                .id(authUser.getId())
                .email(authUser.getEmail())
                .username(authUser.getUsername())
                .build();
    }

    public static AuthResponse toAuthResponseDto(String token) {
        return AuthResponse.builder()
                .accessToken(token)
                .build();
    }
}
