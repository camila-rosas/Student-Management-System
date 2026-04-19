package com.sms.backend.controller;

import com.sms.backend.entity.Student;
import com.sms.backend.repository.StudentRepository;
import com.sms.backend.service.StudentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentRepository studentRepository;
    private final StudentService studentService;

    public StudentController(StudentService studentService,  StudentRepository studentRepository) {
        this.studentService = studentService;
        this.studentRepository = studentRepository;
    }

    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        return studentRepository.save(student);
    }

    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @PostMapping("/{studentId}/enroll/{courseId}")
    public Student enrollStudent(
            @PathVariable int studentId,
            @PathVariable int courseId) {

        return studentService.enrollStudent(studentId, courseId);
    }
}
