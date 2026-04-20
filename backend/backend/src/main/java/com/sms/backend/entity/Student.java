package com.sms.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name ="students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int studentId;

    private String major;
    private int creditHours;

    // Creates foreign key in database
    @OneToOne
    @JoinColumn(name = "user_Id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "student")
    private List<Registration> registrations;

}
