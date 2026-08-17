package com.echonovel.repository;

import com.echonovel.entity.VipPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VipPackageRepository extends JpaRepository<VipPackage, Long> {
    List<VipPackage> findByIsActiveTrue();
}
