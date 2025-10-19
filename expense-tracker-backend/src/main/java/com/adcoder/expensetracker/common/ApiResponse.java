package com.adcoder.expensetracker.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse <T> {
    private int statusCode;
    private String message;
    private OffsetDateTime timestamp;
    private T data;
}