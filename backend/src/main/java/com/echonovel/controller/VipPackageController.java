package com.echonovel.controller;

import com.echonovel.dto.ApiResponse;
import com.echonovel.entity.VipPackage;
import com.echonovel.service.VipPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vip-packages")
@RequiredArgsConstructor
public class VipPackageController {

    private final VipPackageService vipPackageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VipPackage>>> getActivePackages() {
        return ResponseEntity.ok(ApiResponse.success(vipPackageService.getActivePackages()));
    }
}
