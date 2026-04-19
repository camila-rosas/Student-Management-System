package com.sms.backend.service;

import com.sms.backend.entity.Course;
import com.sms.backend.entity.Registration;
import com.sms.backend.entity.Student;
import com.sms.backend.repository.CourseRepository;
import com.sms.backend.repository.RegistrationRepository;
import com.sms.backend.repository.StudentRepository;
import org.springframework.stereotype.Service;

@Service
public class StudentService {
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final RegistrationRepository registrationRepository;

    public StudentService(StudentRepository studentRepository,  CourseRepository courseRepository, RegistrationRepository registrationRepository) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.registrationRepository = registrationRepository;
    }
    public Student enrollStudent(int studentId, int courseId) {
        // Get Student
        Student student = studentRepository.findById(studentId).orElseThrow();

        // Get Course
        Course course = courseRepository.findById(courseId).orElseThrow();

        // Prevent Student from enrolling twice
        if(registrationRepository.existsByStudentAndCourse(student,course)){
            throw new RuntimeException("Student already enrolled in this course!");
        }

        // Check Course capacity
        int enrolledCount = registrationRepository.countByCourse(course);
        if(enrolledCount >= course.getCapacity()){
            throw new RuntimeException("Course capacity exceeded!");
        }

        // Create Registration
        Registration registration = new Registration();
        registration.setStudent(student);
        registration.setCourse(course);

        return student;
    }
}
