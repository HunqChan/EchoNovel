package com.echonovel.controller;

import com.echonovel.dto.ApiResponse;
import com.echonovel.entity.VipPackage;
import com.echonovel.service.VipPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/vip-packages")
@RequiredArgsConstructor
public class AdminVipPackageController {

    private final VipPackageService vipPackageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VipPackage>>> getAllPackages() {
        return ResponseEntity.ok(ApiResponse.success(vipPackageService.getAllPackages()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VipPackage>> createPackage(@RequestBody VipPackage vipPackage) {
        return ResponseEntity.ok(ApiResponse.success(vipPackageService.createPackage(vipPackage)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VipPackage>> updatePackage(@PathVariable Long id, @RequestBody VipPackage vipPackage) {
        return ResponseEntity.ok(ApiResponse.success(vipPackageService.updatePackage(id, vipPackage)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePackage(@PathVariable Long id) {
        vipPackageService.deletePackage(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
