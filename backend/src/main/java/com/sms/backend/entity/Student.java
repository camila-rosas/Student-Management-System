package com.sms.backend.entity;

import jakarta.persistence.*;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;


@Entity
@Table(name ="students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;
    private String major;
    private int creditHours;

    // Creates foreign key in database
    @OneToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @ManyToMany(mappedBy = "students")
    private List<Course> courses;

    //Constructors
    public Student(){}
    public Student(String major, int creditHours, User user) {
        this.major = major;
        this.creditHours = creditHours;
        this.user = user;
    }

    //Getters and Setters

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public int getCreditHours() {
        return creditHours;
    }

    public void setCreditHours(int creditHours) {
        this.creditHours = creditHours;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<Course> getCourses() {
        return courses;
    }
}
