package com.echonovel.service.impl;

import com.echonovel.entity.VipPackage;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.repository.VipPackageRepository;
import com.echonovel.service.VipPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VipPackageServiceImpl implements VipPackageService {

    private final VipPackageRepository vipPackageRepository;

    @Override
    public List<VipPackage> getActivePackages() {
        return vipPackageRepository.findByIsActiveTrue();
    }

    @Override
    public List<VipPackage> getAllPackages() {
        return vipPackageRepository.findAll();
    }

    @Override
    public VipPackage getPackageById(Long id) {
        return vipPackageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_ERROR)); // should create VIP_PACKAGE_NOT_FOUND
    }

    @Override
    public VipPackage createPackage(VipPackage vipPackage) {
        return vipPackageRepository.save(vipPackage);
    }

    @Override
    public VipPackage updatePackage(Long id, VipPackage request) {
        VipPackage existing = getPackageById(id);
        existing.setName(request.getName());
        existing.setDurationDays(request.getDurationDays());
        existing.setPriceCoins(request.getPriceCoins());
        existing.setDescription(request.getDescription());
        existing.setIsActive(request.getIsActive());
        return vipPackageRepository.save(existing);
    }

    @Override
    public void deletePackage(Long id) {
        VipPackage existing = getPackageById(id);
        vipPackageRepository.delete(existing);
    }
}
