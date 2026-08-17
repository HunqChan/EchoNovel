package com.echonovel.service;

import com.echonovel.dto.response.AdminStatsResponse;

/**
 * Service interface for admin dashboard statistics.
 */
public interface AdminStatsService {

    /**
     * Get aggregated admin statistics.
     */
    AdminStatsResponse getAdminStats();
}
