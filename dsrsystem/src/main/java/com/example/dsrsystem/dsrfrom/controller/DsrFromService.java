package com.example.dsrsystem.dsrfrom.controller;

import org.springframework.stereotype.Service;

import com.example.dsrsystem.dsrfrom.model.DsrFrom;
import com.example.dsrsystem.dsrfrom.model.DsrFromRepository;

import lombok.RequiredArgsConstructor;


@RequiredArgsConstructor
@Service
public class DsrFromService {

    private final DsrFromRepository dsrFromRepository;
    private final DsrFromMapper dsrFromMapper;

    public  String saveDsrFromDetail(DsrFromRequest dsrFromRequest) {
    
        DsrFrom dsrFrom= dsrFromMapper.toDsrFrom(dsrFromRequest);
        dsrFromRepository.save(dsrFrom);
        return "saved successfully";

    }

}
