package com.sms.backend.controller;

import com.sms.backend.entity.Course;
import com.sms.backend.repository.CourseRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
public class CourseController {
    private final CourseRepository courseRepository;

    public CourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @PostMapping
    public Course createCourse(@RequestBody Course course){
        return courseRepository.save(course);
    }

    @GetMapping
    public List<Course> getAllCourses(){
        return courseRepository.findAll();
    }
}
