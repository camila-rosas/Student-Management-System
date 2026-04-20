package com.sms.backend.controller;

import com.sms.backend.entity.*;
import com.sms.backend.repository.AccountRepository;
import com.sms.backend.service.CourseService;
import com.sms.backend.service.RegistrationService;
import com.sms.backend.service.StudentService;
import com.sms.backend.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;
    private final UserService userService;
    private final AccountRepository accountRepository;
    private final CourseService courseService;
    private final RegistrationService registrationService;

    public StudentController(StudentService studentService,
                             UserService userService,
                             AccountRepository accountRepository,
                             CourseService courseService,
                             RegistrationService registrationService) {
        this.studentService = studentService;
        this.userService = userService;
        this.accountRepository = accountRepository;
        this.courseService = courseService;
        this.registrationService = registrationService;
    }

    // get logged in student's profile
    @GetMapping("/me")
    public Student getMyProfile(Authentication auth) {
        User user = userService.getUserByUsername(auth.getName());
        return studentService.getByUserId(user.getUserId());
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(Authentication auth) {
        User user = userService.getUserByUsername(auth.getName());
        Student student = studentService.getByUserId(user.getUserId());

        List<Registration> regs = student.getRegistrations();

        int courses = (int) regs.stream()
                .filter(r -> "ENROLLED".equals(r.getStatus()))
                .count();

        int credits = regs.stream()
                .filter(r -> "ENROLLED".equals(r.getStatus()))
                .mapToInt(r -> r.getCourse().getCourseHours())
                .sum();

        Account acc = accountRepository.findByStudent_StudentId(student.getStudentId())
                .orElseThrow(() -> new RuntimeException("Account not found for student."));

        Map<String, Object> res = new HashMap<>();
        res.put("courses", courses);
        res.put("credits", credits);
        res.put("balance", acc.getCurrentBalance());

        return res;
    }

    // browse courses
    @GetMapping("/courses")
    public List<Course> browseCourses() {
        return courseService.getAllCourses();
    }

    // enroll course
    @PostMapping("/enroll")
    public Registration enroll(Authentication auth, @RequestParam int courseId) {
        User user = userService.getUserByUsername(auth.getName());
        Student student = studentService.getByUserId(user.getUserId());

        return registrationService.register(student.getStudentId(), courseId);
    }

    // drop course
    @DeleteMapping("/drop/{id}")
    public Registration drop(@PathVariable int id) {
        return registrationService.dropCourse(id);
    }

    // view billing
    @GetMapping("/billing")
    public Account billing(Authentication auth) {
        User user = userService.getUserByUsername(auth.getName());
        Student student = studentService.getByUserId(user.getUserId());

        return accountRepository.findByStudent_StudentId(student.getStudentId())
                .orElseThrow(() -> new RuntimeException("Account not found for student."));
    }
}