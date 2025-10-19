package com.adcoder.expensetracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping("/health/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("PONG");
    }
}
