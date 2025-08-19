package com.example.dsrsystem.dsrfrom.controller;

import org.springframework.stereotype.Service;

import com.example.dsrsystem.dsrfrom.model.DsrFrom;

@Service

public class DsrFromMapper {


    public DsrFrom toDsrFrom(DsrFromRequest dsrFromRequest){
        return DsrFrom.builder()
        .build();
    }
    


}
