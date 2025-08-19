package com.example.dsrsystem.dsrfrom.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/dsr-from")
@RequiredArgsConstructor
public class DsrFromController {
    
    
    private final DsrFromService dsrFromService;
    @PostMapping()
    public ResponseEntity<?> saveDsrFromDetail(@RequestBody DsrFromRequest dsrFromRequest){
        return ResponseEntity.ok(dsrFromService.saveDsrFromDetail(dsrFromRequest));
    }


}
