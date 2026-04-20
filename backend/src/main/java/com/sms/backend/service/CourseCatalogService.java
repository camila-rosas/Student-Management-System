package com.sms.backend.service;

import com.sms.backend.entity.Course;
import com.sms.backend.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseCatalogService {

    private final CourseRepository courseRepository;

    public CourseCatalogService(CourseRepository repo){
        this.courseRepository = repo;
    }

    public List<Course> searchCourses(String keyword){
        return courseRepository.findAll().stream()
                .filter(c -> c.getCourseName().contains(keyword))
                .toList();
    }

    public List<Course> getAvailableCourses(){
        return courseRepository.findAll().stream()
                .filter(c -> c.getEnrolledCount() < c.getEnrollmentLimit())
                .toList();
    }
}
