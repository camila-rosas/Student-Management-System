package com.sms.backend.controller;

import com.sms.backend.entity.Account;
import com.sms.backend.entity.Student;
import com.sms.backend.entity.User;
import com.sms.backend.repository.AccountRepository;
import com.sms.backend.service.AccountService;
import com.sms.backend.service.StudentService;
import com.sms.backend.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    private final StudentService studentService;
    private final UserService userService;
    private final AccountService accountService;

    @Autowired
    private AccountRepository accountRepository;

    public AccountController(StudentService studentService, UserService userService, AccountService accountService) {
        this.studentService = studentService;
        this.userService = userService;
        this.accountService = accountService;
    }

    @GetMapping("/{studentId}")
    public Account getAccount(@PathVariable int studentId){
        return accountRepository.findById(studentId).get();
    }

    @GetMapping("/my")
    public Account getMyAccount(Authentication auth) {
        User user = userService.getUserByUsername(auth.getName());
        Student student = studentService.getByUserId(user.getUserId());

        return accountRepository.findById(student.getStudentId())
                .orElseThrow();
    }


    @PostMapping("/apply-fee")
    @PreAuthorize("hasRole('ACCOUNTS')")
    public Account applyFee(@RequestParam int accountId,
                            @RequestParam double amount){
        return accountService.applyFee(accountId, amount);
    }

}
