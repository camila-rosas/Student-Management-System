package com.sms.backend.repository;

import com.sms.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StudentRepository extends JpaRepository<Student,Integer> {
}
