package com.example.dsrsystem.dsrfrom.controller;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Builder
@Setter

public class DsrFromRequest {

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
