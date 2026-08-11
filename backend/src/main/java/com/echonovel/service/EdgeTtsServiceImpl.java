package com.echonovel.service;

import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.WebSocket;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.TimeUnit;

/**
 * Edge TTS implementation using Microsoft Edge's Read Aloud WebSocket API.
 * This is a free, no-API-key solution with high-quality Vietnamese voices.
 *
 * Protocol reference: Microsoft Cognitive Services Speech SDK WebSocket
 * Endpoint: wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1
 */
@Slf4j
@Service
public class EdgeTtsServiceImpl implements TtsService {

    private static final String EDGE_TTS_ENDPOINT =
            "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";
    private static final String TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
    private static final String EDGE_UA =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0";

    // Audio separator in binary messages
    private static final String AUDIO_HEADER_SEPARATOR = "Path:audio\r\n";

    @Value("${app.upload.audio-dir:uploads/audio}")
    private String audioDir;

    @Override
    public String generateAudio(String text, String fileName, String voice) {
        if (text == null || text.isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }

        // Ensure output directory exists
        Path outputDir = Paths.get(audioDir);
        try {
            Files.createDirectories(outputDir);
        } catch (IOException e) {
            log.error("Cannot create audio directory: {}", audioDir, e);
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }

        String outputFileName = fileName + ".mp3";
        Path outputPath = outputDir.resolve(outputFileName);

        try {
            synthesize(text, voice, outputPath);
            log.info("✅ TTS audio generated: {}", outputPath);
            return audioDir + "/" + outputFileName;
        } catch (Exception e) {
            log.error("❌ TTS generation failed for file: {}", outputFileName, e);
            // Clean up partial file
            try { Files.deleteIfExists(outputPath); } catch (IOException ignored) {}
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    /**
     * Core synthesis: open WebSocket, send SSML, collect binary audio chunks.
     */
    private void synthesize(String text, String voice, Path outputPath) throws Exception {
        String requestId = UUID.randomUUID().toString().replace("-", "");
        String timestamp = DateTimeFormatter.ofPattern("EEE MMM dd yyyy HH:mm:ss 'GMT'Z '(Coordinated Universal Time)'")
                .withZone(ZoneOffset.UTC)
                .format(Instant.now());

        // Build WebSocket URI
        String wsUri = EDGE_TTS_ENDPOINT
                + "?TrustedClientToken=" + TRUSTED_CLIENT_TOKEN
                + "&ConnectionId=" + requestId;

        // Split text into chunks to avoid WebSocket message size limits (~4KB text per chunk)
        var textChunks = splitText(text, 3000);

        // Collect all audio bytes
        ByteArrayOutputStream allAudioBytes = new ByteArrayOutputStream();

        for (String chunk : textChunks) {
            ByteArrayOutputStream chunkAudio = synthesizeChunk(chunk, voice, wsUri, requestId, timestamp);
            allAudioBytes.write(chunkAudio.toByteArray());
        }

        // Write to file
        try (FileOutputStream fos = new FileOutputStream(outputPath.toFile())) {
            fos.write(allAudioBytes.toByteArray());
        }
    }

    /**
     * Synthesize a single text chunk via WebSocket.
     */
    private ByteArrayOutputStream synthesizeChunk(String text, String voice, String wsUri,
                                                    String requestId, String timestamp) throws Exception {
        ByteArrayOutputStream audioBuffer = new ByteArrayOutputStream();
        CompletableFuture<Void> completionFuture = new CompletableFuture<>();

        HttpClient client = HttpClient.newBuilder().build();
        
        // Append DRM parameters to URI
        String secMsGec = generateSecMsGec();
        String fullWsUri = wsUri + "&Sec-MS-GEC=" + secMsGec + "&Sec-MS-GEC-Version=1-143.0.3650.75";
        String muid = generateMuid();

        WebSocket ws = client.newWebSocketBuilder()
                .header("User-Agent", EDGE_UA)
                .header("Origin", "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold")
                .header("Cookie", "muid=" + muid)
                .header("Pragma", "no-cache")
                .header("Cache-Control", "no-cache")
                .header("Accept-Encoding", "gzip, deflate, br, zstd")
                .header("Accept-Language", "en-US,en;q=0.9")
                .buildAsync(URI.create(fullWsUri), new WebSocket.Listener() {

                    private StringBuilder textBuffer = new StringBuilder();

                    @Override
                    public void onOpen(WebSocket webSocket) {
                        log.debug("WebSocket opened for TTS");
                        webSocket.request(1);
                    }

                    @Override
                    public CompletionStage<?> onText(WebSocket webSocket, CharSequence data, boolean last) {
                        textBuffer.append(data);
                        if (last) {
                            String message = textBuffer.toString();
                            textBuffer.setLength(0);

                            if (message.contains("turn.end")) {
                                completionFuture.complete(null);
                            }
                        }
                        webSocket.request(1);
                        return null;
                    }

                    @Override
                    public CompletionStage<?> onBinary(WebSocket webSocket, ByteBuffer data, boolean last) {
                        try {
                            byte[] bytes = new byte[data.remaining()];
                            data.get(bytes);

                            // Find the audio data after the header separator
                            String headerStr = new String(bytes, 0, Math.min(bytes.length, 500), "UTF-8");
                            int audioStart = headerStr.indexOf(AUDIO_HEADER_SEPARATOR);

                            if (audioStart >= 0) {
                                int dataOffset = audioStart + AUDIO_HEADER_SEPARATOR.length();
                                // Find the end of headers (double CRLF)
                                int headerEnd = headerStr.indexOf("\r\n\r\n", audioStart);
                                if (headerEnd < 0) {
                                    // The separator IS the last header line, audio data follows
                                    // Look for the 2-byte length prefix at the beginning
                                    if (bytes.length > 2) {
                                        int headerLength = ((bytes[0] & 0xFF) << 8) | (bytes[1] & 0xFF);
                                        int actualStart = headerLength + 2;
                                        if (actualStart < bytes.length) {
                                            audioBuffer.write(bytes, actualStart, bytes.length - actualStart);
                                        }
                                    }
                                } else {
                                    int actualStart = headerEnd + 4; // skip \r\n\r\n
                                    if (actualStart < bytes.length) {
                                        audioBuffer.write(bytes, actualStart, bytes.length - actualStart);
                                    }
                                }
                            }
                        } catch (Exception e) {
                            log.warn("Error processing binary audio data", e);
                        }
                        webSocket.request(1);
                        return null;
                    }

                    @Override
                    public CompletionStage<?> onClose(WebSocket webSocket, int statusCode, String reason) {
                        if (!completionFuture.isDone()) {
                            completionFuture.complete(null);
                        }
                        return null;
                    }

                    @Override
                    public void onError(WebSocket webSocket, Throwable error) {
                        log.error("WebSocket error", error);
                        if (!completionFuture.isDone()) {
                            completionFuture.completeExceptionally(error);
                        }
                    }
                }).join();

        // Send speech config
        String configMessage = "X-Timestamp:" + timestamp + "\r\n"
                + "Content-Type:application/json; charset=utf-8\r\n"
                + "Path:speech.config\r\n\r\n"
                + "{\"context\":{\"synthesis\":{\"audio\":{\"metadataoptions\":{"
                + "\"sentenceBoundaryEnabled\":\"false\","
                + "\"wordBoundaryEnabled\":\"true\""
                + "},\"outputFormat\":\"audio-24khz-48kbitrate-mono-mp3\"}}}}";
        ws.sendText(configMessage, true);

        // Build SSML
        String escapedText = escapeXml(text);
        String ssml = "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'>"
                + "<voice name='" + voice + "'>"
                + "<prosody pitch='+0Hz' rate='+0%' volume='+0%'>"
                + escapedText
                + "</prosody></voice></speak>";

        String ssmlMessage = "X-RequestId:" + requestId + "\r\n"
                + "Content-Type:application/ssml+xml\r\n"
                + "X-Timestamp:" + timestamp + "\r\n"
                + "Path:ssml\r\n\r\n"
                + ssml;
        ws.sendText(ssmlMessage, true);

        // Wait for completion (max 120 seconds for long chapters)
        completionFuture.get(120, TimeUnit.SECONDS);
        ws.sendClose(WebSocket.NORMAL_CLOSURE, "done");

        return audioBuffer;
    }

    /**
     * Escape special XML characters in text content.
     */
    private String escapeXml(String text) {
        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    /**
     * Split long text into smaller chunks at sentence boundaries.
     */
    private java.util.List<String> splitText(String text, int maxLength) {
        java.util.List<String> chunks = new java.util.ArrayList<>();

        if (text.length() <= maxLength) {
            chunks.add(text);
            return chunks;
        }

        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + maxLength, text.length());

            if (end < text.length()) {
                // Try to split at sentence boundary
                int lastPeriod = text.lastIndexOf(".", end);
                int lastQuestion = text.lastIndexOf("?", end);
                int lastExclamation = text.lastIndexOf("!", end);
                int lastNewline = text.lastIndexOf("\n", end);

                int bestSplit = Math.max(Math.max(lastPeriod, lastQuestion),
                        Math.max(lastExclamation, lastNewline));

                if (bestSplit > start) {
                    end = bestSplit + 1;
                }
            }

            chunks.add(text.substring(start, end).trim());
            start = end;
        }

        return chunks;
    }

    /**
     * Generate Sec-MS-GEC token to bypass 403 Forbidden.
     */
    private String generateSecMsGec() throws Exception {
        long ticks = Instant.now().getEpochSecond();
        ticks += 11644473600L; // Windows epoch
        ticks -= ticks % 300; // Round down to 5 mins
        ticks *= 10000000L; // Convert to 100-nanosecond intervals

        String strToHash = ticks + TRUSTED_CLIENT_TOKEN;
        java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(strToHash.getBytes(java.nio.charset.StandardCharsets.US_ASCII));
        
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if(hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString().toUpperCase();
    }

    /**
     * Generate a random MUID for the Cookie header.
     */
    private String generateMuid() {
        byte[] bytes = new byte[16];
        new java.security.SecureRandom().nextBytes(bytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }
}
