package com.sms.backend.service;

import com.sms.backend.entity.*;
import com.sms.backend.repository.AccountRepository;
import com.sms.backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {
    private final AccountRepository accountRepository;

    private static final double COST_PER_CREDIT = 300;

    public ReportService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public double calculateTuition(List<Registration> regs){
        return regs.stream()
                .mapToDouble(r -> r.getCourse().getCourseHours()*COST_PER_CREDIT)
                .sum();
    }

    public double totalRevenue(List<Account> accounts){
        return accounts.stream().mapToDouble(Account::getTotalPayments).sum();
    }

    public double outstanding(List<Account> accounts){
        return accounts.stream().mapToDouble(Account::getCurrentBalance).sum();
    }

    public double collected(List<Account> accounts){
        return accounts.stream()
                .mapToDouble(Account::getTotalPayments)
                .sum();
    }

    @Autowired
    private CourseRepository courseRepository;

    public Map<String, Object> getEnrollmentStats(){

        List<Course> courses = courseRepository.findAll();

        int totalCapacity = courses.stream()
                .mapToInt(Course::getEnrollmentLimit).sum();

        int enrolled = courses.stream()
                .mapToInt(Course::getEnrolledCount).sum();

        double rate = totalCapacity == 0 ? 0 :
                (double) enrolled / totalCapacity * 100;

        Map<String, Object> res = new HashMap<>();
        res.put("activeCourses", courses.size());
        res.put("activeEnrollments", enrolled);
        res.put("capacity", totalCapacity);
        res.put("rate", rate);

        return res;
    }

    public EnrollmentReport generateEnrollmentReport(){
        List<Course> courses = courseRepository.findAll();

        EnrollmentReport report = new EnrollmentReport();

        report.setActiveCourses(courses.size());
        report.setTotalCapacity(
                courses.stream().mapToInt(Course::getEnrollmentLimit).sum()
        );
        report.setActiveEnrollments(
                courses.stream().mapToInt(Course::getEnrolledCount).sum()
        );

        return report;
    }

    public FinancialReport generateFinancialReport() {
        List<Account> accounts = accountRepository.findAll();

        FinancialReport report = new FinancialReport();

        report.setTotalRevenue(
                accounts.stream().mapToDouble(Account::getTotalPayments).sum()
        );

        report.setOutstandingBalance(
                accounts.stream().mapToDouble(Account::getCurrentBalance).sum()
        );

        report.setPaymentsReceived(
                accounts.stream().mapToDouble(Account::getTotalPayments).sum()
        );

        return report;
    }
}
