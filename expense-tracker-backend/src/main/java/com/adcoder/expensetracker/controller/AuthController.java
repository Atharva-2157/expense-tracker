package com.adcoder.expensetracker.controller;

import com.adcoder.expensetracker.common.ApiResponse;
import com.adcoder.expensetracker.dto.*;
import com.adcoder.expensetracker.security.CookieUtil;
import com.adcoder.expensetracker.security.JwtPrincipal;
import com.adcoder.expensetracker.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.OffsetDateTime;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    private JwtPrincipal getJwtPrincipal() {
        return (JwtPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private <T> ResponseEntity<ApiResponse<T>> buildResponse(HttpStatus status, String message, T data) {
        ApiResponse<T> response = ApiResponse.<T>builder()
                .statusCode(status.value())
                .message(message)
                .timestamp(OffsetDateTime.now())
                .data(data)
                .build();
        log.info(message);
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping(
            path = "/register",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<RegisterResponse>> registerUser(@RequestBody RegisterRequest request) {
        RegisterResponse data = authService.registerUser(request);
        String message = "User '" + request.getUsername() + "' registered successfully";
        return buildResponse(HttpStatus.CREATED, message, data);
    }

    @PostMapping(
            path = "/login",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<AuthResponse>> login(AuthRequest request) {
        AuthResponse data = authService.login(request);
        ResponseCookie jwtCookie = CookieUtil.createJwtCookie(data.getAccessToken());
        String message = "User '" + request.getUsername() + "' logged in successfully";

        ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                .statusCode(HttpStatus.OK.value())
                .message(message)
                .timestamp(OffsetDateTime.now())
                .data(data)
                .build();

        log.info(message);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(response);
    }

    @GetMapping(
            path = "/me",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<RegisterResponse>> getCurrentUser() {
        JwtPrincipal principal = getJwtPrincipal();
        RegisterResponse data = authService.getCurrentUser(principal.getUserId());
        String message = "Fetched current user: " + principal.getUsername();
        return buildResponse(HttpStatus.OK, message, data);
    }

    @PostMapping(
            path = "/logout",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> logout() {
        ResponseCookie clearCookie = CookieUtil.clearJwtCookie();
        String message = "User logged out successfully";

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .statusCode(HttpStatus.OK.value())
                .message(message)
                .timestamp(OffsetDateTime.now())
                .build();

        log.info(message);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body(response);
    }
}

