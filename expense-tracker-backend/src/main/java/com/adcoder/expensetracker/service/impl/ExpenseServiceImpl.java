package com.adcoder.expensetracker.service.impl;

import com.adcoder.expensetracker.dto.ExpenseRequest;
import com.adcoder.expensetracker.dto.ExpenseResponse;
import com.adcoder.expensetracker.exception.ExpenseTrackerException;
import com.adcoder.expensetracker.mapper.ExpenseMapper;
import com.adcoder.expensetracker.model.AuthUser;
import com.adcoder.expensetracker.model.Expense;
import com.adcoder.expensetracker.repository.AuthUserRepository;
import com.adcoder.expensetracker.repository.ExpenseRepository;
import com.adcoder.expensetracker.security.JwtPrincipal;
import com.adcoder.expensetracker.service.ExpenseService;
import io.github.perplexhub.rsql.RSQLJPASupport;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final AuthUserRepository authUserRepository;

    @Override
    public ExpenseResponse createExpense(ExpenseRequest request) {
        AuthUser user = getCurrentUser();

        Expense expense = ExpenseMapper.toExpenseEntity(request, user);
        expense.setCreatedAt(OffsetDateTime.now());
        expense.setUpdatedAt(OffsetDateTime.now());

        return ExpenseMapper.toExpenseResponseDto(expenseRepository.save(expense));
    }

    @Override
    public ExpenseResponse getExpenseById(Long id) {
        Expense expense = getExpenseForCurrentUser(id);
        return ExpenseMapper.toExpenseResponseDto(expense);
    }

    @Override
    public Page<ExpenseResponse> getAllExpensesForUser(Pageable pageable, String filter) {
        AuthUser currentUser = getCurrentUser();

        Specification<Expense> spec = Specification.allOf(byUser(currentUser.getId()));

        if (filter != null && !filter.isBlank()) {
            Specification<Expense> rsqlSpec = RSQLJPASupport.toSpecification(filter);
            spec = spec.and(rsqlSpec);
        }

        Page<Expense> pageResult = expenseRepository.findAll(spec, pageable);
        return pageResult.map(ExpenseMapper::toExpenseResponseDto);
    }

    private Specification<Expense> byUser(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("authUser").get("id"), userId);
    }

    @Override
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Expense expense = getExpenseForCurrentUser(id);

        expense.setTitle(request.getTitle());
        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
        expense.setDescription(request.getDescription());
        expense.setUpdatedAt(OffsetDateTime.now());

        return ExpenseMapper.toExpenseResponseDto(expenseRepository.save(expense));
    }

    @Override
    public void deleteExpense(Long id) {
        Expense expense = getExpenseForCurrentUser(id);
        expenseRepository.delete(expense);
    }

    // ✅ Helper: Fetch expense only if it belongs to current user
    private Expense getExpenseForCurrentUser(Long expenseId) {
        AuthUser user = getCurrentUser();
        return expenseRepository.findByAuthUserAndId(user, expenseId)
                .orElseThrow(() -> new ExpenseTrackerException("Expense not found", HttpStatus.NOT_FOUND));
    }

    // ✅ Helper: Fetch current user from SecurityContext
    private AuthUser getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!(principal instanceof JwtPrincipal jwtPrincipal)) {
            throw new ExpenseTrackerException("Invalid authentication context", HttpStatus.UNAUTHORIZED);
        }

        return authUserRepository.findById(jwtPrincipal.getUserId())
                .orElseThrow(() -> new ExpenseTrackerException("User not found", HttpStatus.NOT_FOUND));
    }
}


