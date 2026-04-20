package com.sms.backend.controller;

import com.sms.backend.entity.Course;
import com.sms.backend.service.AccountService;
import com.sms.backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {


    private final CourseService courseService;

    private final AccountService accountService;

    @GetMapping
    public List<Course> getCourses(){
        return courseService.getAllCourses();
    }

    @PostMapping
    @PreAuthorize("hasRole('REGISTRAR') or hasRole('ADMIN')")
    public Course createCourse(@RequestBody Course course){
        return courseService.createCourse(course);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('REGISTRAR')")
    public Course update(@PathVariable int id, @RequestBody Course c) {
        return courseService.updateCourse(id, c);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('REGISTRAR')")
    public void delete(@PathVariable int id) {
        courseService.deleteCourse(id);
    }

    @GetMapping("/search")
    public List<Course> search(@RequestParam String keyword){
        return courseService.searchCourses(keyword);
    }

    @GetMapping("/filter")
    public List<Course> filter(@RequestParam String type){
        return courseService.filterCourses(type);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> summary(){
        return accountService.getAccountSummary();
    }

    @GetMapping("/available")
    public List<Course> availableCourses(){
        return courseService.getAllCourses().stream()
                .filter(c -> c.getEnrolledCount() < c.getEnrollmentLimit())
                .toList();
    }
}
