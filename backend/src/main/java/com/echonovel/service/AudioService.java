package com.echonovel.service;

import com.echonovel.dto.response.AudioFileResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

/**
 * Service interface for audio operations (TTS + Upload).
 */
public interface AudioService {

    /**
     * Get audio info for a chapter (with access check).
     */
    Optional<AudioFileResponse> getAudioByChapterId(Long chapterId);

    /**
     * Generate TTS audio for a chapter (with access check + caching).
     */
    AudioFileResponse generateTts(Long chapterId, String voice);

    /**
     * Admin upload audio for a chapter.
     */
    AudioFileResponse uploadAudio(Long chapterId, MultipartFile file);
}
