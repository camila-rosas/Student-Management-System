package com.sms.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "accounts")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int accountId;

    @OneToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @OneToMany(mappedBy = "account")
    private List<Transaction> transactions;

    private double currentBalance;
    private double totalPayments;
    private LocalDate dueDate;
    private double totalCharges;
}
