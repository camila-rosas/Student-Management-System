package com.sms.backend.controller;

import com.sms.backend.entity.Account;
import com.sms.backend.entity.FinancialReport;
import com.sms.backend.repository.AccountRepository;
import com.sms.backend.repository.CourseRepository;
import com.sms.backend.repository.RegistrationRepository;
import com.sms.backend.repository.StudentRepository;
import com.sms.backend.service.RegistrationService;
import com.sms.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reports")
public class ReportController {
    @Autowired
    RegistrationRepository registrationRepository;

    @Autowired
    AccountRepository accountRepository;

    @Autowired
    ReportService reportService;

    @Autowired
    private RegistrationService registrationService;

    @GetMapping("/enrollment")
    public int enrollment() {
        return (int) registrationRepository.count();
    }

    @GetMapping("/financial")
    public Map<String, Double> financial() {
        List<Account> accounts = accountRepository.findAll();

        Map<String, Double> res = new HashMap<>();
        res.put("revenue", reportService.totalRevenue(accounts));
        res.put("outstanding", reportService.outstanding(accounts));

        return res;
    }

    @GetMapping("/enrollment/stats")
    public Map<String, Object> stats(){
        return reportService.getEnrollmentStats();
    }

    @GetMapping("/financial/full")
    public Map<String, Double> fullFinancial(){
        List<Account> accounts = accountRepository.findAll();

        Map<String, Double> res = new HashMap<>();
        res.put("revenue", reportService.totalRevenue(accounts));
        res.put("collected", reportService.collected(accounts));
        res.put("outstanding", reportService.outstanding(accounts));

        return res;
    }

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(){
        Map<String, Object> res = new HashMap<>();

        res.put("students", studentRepository.count());
        res.put("courses", courseRepository.count());
        res.put("registrations", registrationRepository.count());

        return res;
    }

    @GetMapping("/financial/report")
    public FinancialReport financialReport(){
        return reportService.generateFinancialReport();
    }
}