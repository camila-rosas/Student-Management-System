package com.sms.backend.service;



import com.sms.backend.entity.Registration;
import com.sms.backend.entity.Student;
import com.sms.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;

    public Student getByUserId(int userId){
        return studentRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public List<Registration> getStudentCourses(Student student){
        return student.getRegistrations();
    }

}
