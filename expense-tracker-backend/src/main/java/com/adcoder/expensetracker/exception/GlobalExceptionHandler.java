package com.adcoder.expensetracker.exception;

import com.adcoder.expensetracker.common.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.OffsetDateTime;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(ExpenseTrackerException.class)
    public ResponseEntity<ApiResponse<Void>> handleExpenseTrackerException(ExpenseTrackerException ex) {
        log.error(ex.getMessage(), ex);
        return ResponseEntity
                .status(ex.getStatus())
                .body(
                        ApiResponse.<Void>builder()
                                .statusCode(ex.getStatus().value())
                                .message(ex.getMessage())
                                .timestamp(OffsetDateTime.now())
                                .build()
                );
    }
}
