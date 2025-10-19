package com.adcoder.expensetracker.repository;

import com.adcoder.expensetracker.model.AuthUser;
import com.adcoder.expensetracker.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long>, JpaSpecificationExecutor<Expense> {
    Optional<Expense> findByAuthUserAndId(AuthUser user, Long id);
}
