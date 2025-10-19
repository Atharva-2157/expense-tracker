package com.adcoder.expensetracker.service;

import com.adcoder.expensetracker.dto.ExpenseRequest;
import com.adcoder.expensetracker.dto.ExpenseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ExpenseService {
    ExpenseResponse createExpense(ExpenseRequest request);
    ExpenseResponse getExpenseById(Long id);
    Page<ExpenseResponse> getAllExpensesForUser(Pageable pageable, String filters);
    ExpenseResponse updateExpense(Long id, ExpenseRequest request);
    void deleteExpense(Long id);
}
