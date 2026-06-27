package com.minhtung.hackathon.controller;


import com.minhtung.hackathon.service.KycService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/admin")
@RequiredArgsConstructor
public class Admin {
    private final KycService kycService;
//    @Operation(
//            summary = "xem danh sach sinh vien tham gia",
//            description = "Admin co the xem tat ca danh sach cua sinh vien "
//    )
//    @GetMapping("/participants")
//    public ResponseEntity<?> getAllParticipantsForReview() {
//        return ResponseEntity.ok(kycService.getAllinformationUser());
//    }
//    @Operation(
//            summary = "ADmin",
//            description = "Admin co thẻ duyệt sinh viên thanh acpect"
//    )
//    @PutMapping("/{userId}/approve")
//    public ResponseEntity<?>approverUser(@PathVariable Long userId,@RequestParam boolean approve){
//        kycService.approveUser(userId,approve);
//        if (approve) {
//            return ResponseEntity.ok("duyet ho so thanh cong");
//        }
//
//        return ResponseEntity.ok("tu choi ho so thanh cong");
//    }
    }

