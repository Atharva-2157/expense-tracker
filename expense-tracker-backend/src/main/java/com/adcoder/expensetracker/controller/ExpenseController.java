package com.adcoder.expensetracker.controller;

import com.adcoder.expensetracker.common.ApiResponse;
import com.adcoder.expensetracker.dto.ExpenseRequest;
import com.adcoder.expensetracker.dto.ExpenseResponse;
import com.adcoder.expensetracker.security.JwtPrincipal;
import com.adcoder.expensetracker.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.OffsetDateTime;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
@Slf4j
public class ExpenseController {

    private final ExpenseService expenseService;

    private JwtPrincipal getCurrentUserJwtPrincipal() {
        return (JwtPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping(
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<Page<ExpenseResponse>>>  getAllExpenses(
            Pageable pageable,
            @RequestParam(required = false) String filter
    ) {
        return buildResponse(
                HttpStatus.OK,
                "Fetched all expenses",
                expenseService.getAllExpensesForUser(pageable, filter)
        );
    }

    @GetMapping(
            value = "/{id}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<ExpenseResponse>> getExpenseById(@PathVariable Long id) {
        return buildResponse(
                HttpStatus.OK,
                "Fetched expense with ID: " + id,
                expenseService.getExpenseById(id)
        );
    }

    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<ExpenseResponse>> createExpense(@RequestBody ExpenseRequest expenseRequest) {
        return buildResponse(
                HttpStatus.CREATED,
                "Expense created successfully",
                expenseService.createExpense(expenseRequest)
        );
    }

    @PutMapping(
            value = "/{id}",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpense(
            @PathVariable Long id,
            @RequestBody ExpenseRequest expenseRequest) {
        return buildResponse(
                HttpStatus.OK,
                "Expense updated successfully for ID: " + id,
                expenseService.updateExpense(id, expenseRequest)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return buildResponse(
                HttpStatus.NO_CONTENT,
                "Expense deleted successfully with ID: " + id,
                null);
    }

    private <T> ResponseEntity<ApiResponse<T>> buildResponse(HttpStatus status, String message, T data) {
        ApiResponse<T> response = ApiResponse.<T>builder()
                .statusCode(status.value())
                .message(message)
                .timestamp(OffsetDateTime.now())
                .data(data)
                .build();
        log.info("{}. User ID = {}", message, getCurrentUserJwtPrincipal().getUserId());
        return ResponseEntity.status(status).body(response);
    }
}

