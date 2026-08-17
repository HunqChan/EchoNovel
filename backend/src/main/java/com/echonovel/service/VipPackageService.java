package com.echonovel.service;

import com.echonovel.entity.VipPackage;
import java.util.List;

public interface VipPackageService {
    List<VipPackage> getActivePackages();
    List<VipPackage> getAllPackages();
    VipPackage getPackageById(Long id);
    VipPackage createPackage(VipPackage vipPackage);
    VipPackage updatePackage(Long id, VipPackage vipPackage);
    void deletePackage(Long id);
}
