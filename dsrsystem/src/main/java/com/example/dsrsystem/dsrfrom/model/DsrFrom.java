package com.example.dsrsystem.dsrfrom.model;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "dsFrom")

public class DsrFrom {
	
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private LocalDate dataOfVisit;
    private LocalTime timeofVisit;

    private String fullName;

    private String role;
    private String mobileNumber;

    private String alternativeContactNumber;
    private String eamilId;
    private String whatsAppNumber;

    //originsation detaill

    private String clinicName;
    private String localArea;
    private String fullAddress;
    private String googleMapLink;

    private String visitType;
    private String MedicalSpecialty;
    private String nonMedicalType;


    // visitNode

    private String clinicTimings;
    private String NextActionRequired;

    private String remarks;

    private String repeatVisit;

    // private 

    private String photoofClinicSignboard;
    private String photoOfVisitingCard;
    private String additionalFile;




}
