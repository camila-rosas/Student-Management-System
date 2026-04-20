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
public class FinancialReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private double totalRevenue;
    private double paymentsReceived;
    private double outstandingBalance;

    public String generateFinancialSummary(){
        return "Revenue: " + totalRevenue +
                ", Outstanding: " + outstandingBalance;
    }

    public void generateReport(){
        // placeholder if needed for UML compliance
    }
}
