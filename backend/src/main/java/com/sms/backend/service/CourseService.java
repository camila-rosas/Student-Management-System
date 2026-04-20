package com.sms.backend.service;

import com.sms.backend.entity.Course;
import com.sms.backend.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;

    public Course createCourse(Course course){
        return courseRepository.save(course);
    }

    public List<Course> getAllCourses(){
        return courseRepository.findAll();
    }

    public void deleteCourse(int id){
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found!"));
        courseRepository.deleteById(id);
    }

    public Course updateCourse(int id, Course updatedCourse){
        Course course = courseRepository.findById(id).orElseThrow();
        course.setCourseName(updatedCourse.getCourseName());
        course.setInstructor(updatedCourse.getInstructor());
        course.setEnrollmentLimit(updatedCourse.getEnrollmentLimit());
        return courseRepository.save(course);
    }

    public List<Course> searchCourses(String keyword){
        return courseRepository.findAll().stream()
                .filter(c ->
                        c.getCourseName().toLowerCase().contains(keyword.toLowerCase()) ||
                                c.getCourseCode().toLowerCase().contains(keyword.toLowerCase()) ||
                                c.getInstructor().toLowerCase().contains(keyword.toLowerCase())
                ).toList();
    }

    public List<Course> filterCourses(String type){
        return courseRepository.findAll().stream()
                .filter(c -> {
                    if(type.equals("open")){
                        return c.getEnrolledCount() < c.getEnrollmentLimit();
                    } else if(type.equals("3")){
                        return c.getCourseHours() == 3;
                    } else if(type.equals("4")){
                        return c.getCourseHours() == 4;
                    }
                    return true;
                }).toList();
    }

    public double getEnrollmentPercentage(Course c){
        return (double)c.getEnrolledCount() / c.getEnrollmentLimit() * 100;
    }
}
