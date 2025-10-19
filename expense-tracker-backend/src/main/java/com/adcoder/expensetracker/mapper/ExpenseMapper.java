package com.adcoder.expensetracker.mapper;

import com.adcoder.expensetracker.dto.ExpenseRequest;
import com.adcoder.expensetracker.dto.ExpenseResponse;
import com.adcoder.expensetracker.model.AuthUser;
import com.adcoder.expensetracker.model.Expense;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ExpenseMapper {

    public static Expense toExpenseEntity(ExpenseRequest expenseRequest, AuthUser authUser) {
        return Expense.builder()
                .title(expenseRequest.getTitle())
                .category(expenseRequest.getCategory())
                .amount(expenseRequest.getAmount())
                .date(expenseRequest.getDate())
                .description(expenseRequest.getDescription())
                .authUser(authUser)
                .build();
    }

    public static ExpenseResponse toExpenseResponseDto(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .date(expense.getDate())
                .build();
    }
}
