package com.adcoder.expensetracker.service;

import com.adcoder.expensetracker.dto.AuthRequest;
import com.adcoder.expensetracker.dto.AuthResponse;
import com.adcoder.expensetracker.dto.RegisterRequest;
import com.adcoder.expensetracker.dto.RegisterResponse;

public interface AuthService {
    RegisterResponse registerUser(RegisterRequest request);
    AuthResponse login(AuthRequest request);
    RegisterResponse getCurrentUser(Long userId);
}
