package com.sms.backend.repository;

import com.sms.backend.entity.Course;
import com.sms.backend.entity.Registration;
import com.sms.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration,Integer> {
    boolean existsByStudentAndCourse(Student student, Course course);
    int countByCourse(Course course);
}
