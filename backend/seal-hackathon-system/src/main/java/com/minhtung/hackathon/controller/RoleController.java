package com.minhtung.hackathon.controller;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("role")
@SecurityRequirement(name = "bearerAuth")
public class RoleController {
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public String admin() {
        return "Hello Admin!";
    }

    @PreAuthorize("hasAnyRole('ADMIN','LECTURER')")
    @GetMapping("/lecturer")
    public String lecturer() {
        return "Hello Lecturer!";
    }

    @PreAuthorize("hasAnyRole('ADMIN','LECTURER','USER')")
    @GetMapping("/user")
    public String user() {
        return "Hello User!";
    }
}



