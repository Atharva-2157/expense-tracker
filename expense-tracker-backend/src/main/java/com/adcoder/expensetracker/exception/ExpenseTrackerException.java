package com.adcoder.expensetracker.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ExpenseTrackerException extends RuntimeException{
    private final HttpStatus status;

    public ExpenseTrackerException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
