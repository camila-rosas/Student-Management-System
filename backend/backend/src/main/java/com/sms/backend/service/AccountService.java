package com.sms.backend.service;

import com.sms.backend.entity.Account;
import com.sms.backend.entity.FinancialReport;
import com.sms.backend.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AccountService {
    @Autowired
    private AccountRepository accountRepository;

    public Account applyFee(int accountId, double amount){
        Account acc = accountRepository.findById(accountId).orElseThrow();

        acc.setCurrentBalance(acc.getCurrentBalance() + amount);
        acc.setTotalCharges(acc.getTotalCharges() + amount);

        return accountRepository.save(acc);
    }

    public Map<String, Object> getAccountSummary(){
        List<Account> accounts = accountRepository.findAll();

        double outstanding = accounts.stream()
                .mapToDouble(Account::getCurrentBalance).sum();

        long paidFull = accounts.stream()
                .filter(a -> a.getCurrentBalance() == 0)
                .count();

        Map<String, Object> res = new HashMap<>();
        res.put("totalStudents", accounts.size());
        res.put("outstanding", outstanding);
        res.put("paidFull", paidFull);

        return res;
    }
}
