package com.echonovel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Serve static files from /uploads/ directory so the browser can access
 * audio files at: http://localhost:8080/uploads/audio/filename.mp3
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.audio-dir:uploads/audio}")
    private String audioDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /uploads/** URL path to the physical uploads/ directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
