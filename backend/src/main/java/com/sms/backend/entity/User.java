package com.sms.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;
    private String username;
    private String password;
    private String email;
    private String name;

    @Enumerated(EnumType.STRING)
    private Role role; // student, admin, registrar, admin, accounts
}
