package com.echonovel.service;

import com.echonovel.dto.response.AudioFileResponse;
import com.echonovel.entity.AudioFile;
import com.echonovel.entity.Chapter;
import com.echonovel.entity.User;
import com.echonovel.enums.AccessLevel;
import com.echonovel.enums.AudioSource;
import com.echonovel.enums.Role;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.repository.AudioFileRepository;
import com.echonovel.repository.ChapterRepository;
import com.echonovel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AudioService {

    private final AudioFileRepository audioFileRepository;
    private final ChapterRepository chapterRepository;
    private final UserRepository userRepository;
    private final TtsService ttsService;

    @Value("${app.upload.audio-dir:uploads/audio}")
    private String audioDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final String DEFAULT_VOICE = "vi-VN-HoaiMyNeural";

    // ==================== PUBLIC ====================

    /**
     * Get audio info for a chapter (with access check)
     */
    public Optional<AudioFileResponse> getAudioByChapterId(Long chapterId) {
        Chapter chapter = findChapterAndCheckAccess(chapterId);

        return audioFileRepository.findByChapterId(chapterId)
                .map(audio -> AudioFileResponse.fromEntity(audio, baseUrl));
    }

    /**
     * Generate TTS audio for a chapter (with access check + caching)
     */
    @Transactional
    public AudioFileResponse generateTts(Long chapterId, String voice) {
        Chapter chapter = findChapterAndCheckAccess(chapterId);

        // Check cache: if audio already exists, return it
        Optional<AudioFile> existing = audioFileRepository.findByChapterId(chapterId);
        if (existing.isPresent()) {
            log.info("Audio cache hit for chapter ID: {}", chapterId);
            return AudioFileResponse.fromEntity(existing.get(), baseUrl);
        }

        // Validate chapter has content
        if (chapter.getContent() == null || chapter.getContent().isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }

        // Generate filename
        String fileName = "tts_chapter_" + chapterId + "_" + UUID.randomUUID().toString().substring(0, 8);
        String selectedVoice = (voice != null && !voice.isBlank()) ? voice : DEFAULT_VOICE;

        // Call Edge TTS
        String filePath = ttsService.generateAudio(chapter.getContent(), fileName, selectedVoice);

        // Save to DB
        AudioFile audioFile = AudioFile.builder()
                .chapter(chapter)
                .filePath(filePath)
                .source(AudioSource.TTS)
                .duration(estimateDuration(chapter.getContent()))
                .build();

        audioFile = audioFileRepository.save(audioFile);
        log.info("✅ TTS audio saved for chapter ID: {} -> {}", chapterId, filePath);

        return AudioFileResponse.fromEntity(audioFile, baseUrl);
    }

    // ==================== ADMIN ====================

    /**
     * Admin upload audio for a chapter
     */
    @Transactional
    public AudioFileResponse uploadAudio(Long chapterId, MultipartFile file) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new AppException(ErrorCode.CHAPTER_NOT_FOUND));

        // Delete existing audio if any
        audioFileRepository.findByChapterId(chapterId).ifPresent(existing -> {
            deletePhysicalFile(existing.getFilePath());
            audioFileRepository.delete(existing);
            log.info("Replaced existing audio for chapter ID: {}", chapterId);
        });

        // Validate file
        if (file.isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.toLowerCase().endsWith(".mp3")) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }

        // Save file
        String fileName = "upload_chapter_" + chapterId + "_" + UUID.randomUUID().toString().substring(0, 8) + ".mp3";
        Path uploadDir = Paths.get(audioDir);
        try {
            Files.createDirectories(uploadDir);
            Path filePath = uploadDir.resolve(fileName);
            file.transferTo(filePath);
        } catch (IOException e) {
            log.error("Failed to save uploaded audio file", e);
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }

        String relativeFilePath = audioDir + "/" + fileName;

        // Save to DB
        AudioFile audioFile = AudioFile.builder()
                .chapter(chapter)
                .filePath(relativeFilePath)
                .source(AudioSource.UPLOAD)
                .duration(0) // Could be enhanced with audio metadata parsing
                .build();

        audioFile = audioFileRepository.save(audioFile);
        log.info("✅ Audio uploaded for chapter ID: {} -> {}", chapterId, relativeFilePath);

        return AudioFileResponse.fromEntity(audioFile, baseUrl);
    }

    // ==================== HELPERS ====================

    /**
     * Find chapter and enforce access control (same logic as ChapterService)
     */
    private Chapter findChapterAndCheckAccess(Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new AppException(ErrorCode.CHAPTER_NOT_FOUND));

        if (chapter.getAccessLevel() != AccessLevel.PUBLIC) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            String email = auth.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            if (chapter.getAccessLevel() == AccessLevel.VIP) {
                if (!Boolean.TRUE.equals(user.getIsVip()) && user.getRole() != Role.ADMIN) {
                    throw new AppException(ErrorCode.CHAPTER_ACCESS_DENIED);
                }
            }
        }

        return chapter;
    }

    /**
     * Estimate audio duration based on text length (~150 words/min for Vietnamese)
     */
    private int estimateDuration(String text) {
        int charCount = text.length();
        // Vietnamese: roughly 5 chars/word, 150 words/min
        return Math.max(10, (charCount / 5) * 60 / 150);
    }

    /**
     * Delete physical audio file from disk
     */
    private void deletePhysicalFile(String filePath) {
        try {
            Files.deleteIfExists(Paths.get(filePath));
        } catch (IOException e) {
            log.warn("Could not delete file: {}", filePath, e);
        }
    }
}
