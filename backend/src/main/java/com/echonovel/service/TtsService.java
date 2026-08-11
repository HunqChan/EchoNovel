package com.echonovel.service;

/**
 * Interface for Text-to-Speech services
 */
public interface TtsService {

    /**
     * Generate audio from text content.
     *
     * @param text     The text content to convert to speech
     * @param fileName Desired output filename (without extension)
     * @param voice    TTS voice name (e.g., "vi-VN-HoaiMyNeural")
     * @return Relative file path of the generated .mp3 file
     */
    String generateAudio(String text, String fileName, String voice);
}
