package com.sms.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int courseId;

    private String courseName;
    private String courseCode;
    private int courseHours;
    private String instructor;
    private int enrollmentLimit;
    private String schedule;
    private String roomNum;
    private String description;

    private int enrolledCount;
}
