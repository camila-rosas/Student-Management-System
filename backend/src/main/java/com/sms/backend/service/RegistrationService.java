package com.sms.backend.service;

import com.sms.backend.entity.*;
import com.sms.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistrationService {
    private final RegistrationRepository registrationRepository;

    private final CourseRepository courseRepository;

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final StudentRepository studentRepository;

    public Registration register(int studentId, int courseId){

        Student student = studentRepository.findById(studentId)
                .orElseThrow();

        Course course = courseRepository.findById(courseId)
                .orElseThrow();

        // duplicate check
        if(registrationRepository.existsByStudentAndCourse(student, course)){
            throw new RuntimeException("Already enrolled");
        }

        // capacity check
        if(course.getEnrolledCount() >= course.getEnrollmentLimit()){
            throw new RuntimeException("Course full");
        }

        // credit limit (NEW)
        int totalCredits = student.getRegistrations().stream()
                .filter(r -> r.getStatus().equals("ENROLLED"))
                .mapToInt(r -> r.getCourse().getCourseHours())
                .sum();

        if(totalCredits + course.getCourseHours() > 18){
            throw new RuntimeException("Credit limit exceeded");
        }

        Registration reg = new Registration();
        reg.setStudent(student);
        reg.setCourse(course);
        reg.setStatus("ENROLLED");
        reg.setRegistrationDate(LocalDate.now());

        course.setEnrolledCount(course.getEnrolledCount() + 1);
        courseRepository.save(course);

        // billing update
        Account acc = accountRepository.findByStudent_StudentId(studentId)
        .orElseThrow(() -> new RuntimeException("Account not found"));
        double cost = course.getCourseHours() * 300;

        acc.setCurrentBalance(acc.getCurrentBalance() + cost);
        acc.setTotalCharges(acc.getTotalCharges() + cost);

        accountRepository.save(acc);

        Transaction t = new Transaction();
        t.setAccount(acc);
        t.setAmount(cost);
        t.setType("TUITION");
        t.setDate(LocalDate.now());
        t.setDescription("Course enrollment");

        transactionRepository.save(t);

        return registrationRepository.save(reg);
    }

    public Registration dropCourse(int registrationId){

        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow();

        reg.setStatus("DROPPED");

        Account acc = accountRepository.findByStudent_StudentId(
        reg.getStudent().getStudentId()).orElseThrow();
        
        double refund = reg.getCourse().getCourseHours() * 300;
        
        acc.setCurrentBalance(acc.getCurrentBalance() - refund);
        accountRepository.save(acc);

        Course course = reg.getCourse();
        course.setEnrolledCount(course.getEnrolledCount() - 1);
        courseRepository.save(course);

        return registrationRepository.save(reg);
    }

    public List<Registration> getStudentRegistrations(Student student){
        return registrationRepository.findAll().stream()
                .filter(r -> r.getStudent().getStudentId() == student.getStudentId())
                .toList();
    }
}
