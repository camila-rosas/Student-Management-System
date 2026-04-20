package com.sms.backend.controller;

import com.sms.backend.entity.Registration;
import com.sms.backend.entity.Student;
import com.sms.backend.entity.User;
import com.sms.backend.repository.RegistrationRepository;
import com.sms.backend.service.RegistrationService;
import com.sms.backend.service.StudentService;
import com.sms.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registration")
@RequiredArgsConstructor
public class RegistrationController {
    private final RegistrationService registrationService;
    private final UserService userService;
    private final StudentService studentService;
    private final RegistrationRepository registrationRepository;


    @PostMapping
    public Registration register(
            @RequestParam int studentId,
            @RequestParam int courseId
    ){
        return registrationService.register(studentId, courseId);
    }

    @GetMapping("/my")
    public List<Registration> myCourses(Authentication auth){
        User user = userService.getUserByUsername(auth.getName());
        Student student = studentService.getByUserId(user.getUserId());

        return registrationService.getStudentRegistrations(student);
    }

    @DeleteMapping("/drop/{id}")
    public Registration drop(@PathVariable int id){
        return registrationService.dropCourse(id);
    }

    @PostMapping("/enroll")
    public Registration enroll(
            @RequestParam int studentId,
            @RequestParam int courseId
    ){
        return registrationService.register(studentId, courseId);
    }
}
