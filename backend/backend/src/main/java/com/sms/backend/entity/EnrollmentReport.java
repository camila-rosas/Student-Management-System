package com.sms.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class EnrollmentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int totalStudents;
    private int activeCourses;
    private int activeEnrollments;
    private int availableSeats;
    private int totalCapacity;
    private int filledSeats;

    public double calculateCapacityUtilization(){
        return (double) activeEnrollments / totalCapacity;
    }
}
