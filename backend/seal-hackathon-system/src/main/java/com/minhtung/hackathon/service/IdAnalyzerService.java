package com.minhtung.hackathon.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class IdAnalyzerService {

    @Value("${idanalyzer.api-key}")
    private String apiKey;

    @Value("${idanalyzer.scan-url:https://api2.idanalyzer.com/scan}")
    private String scanUrl;

    @Value("${idanalyzer.face-url:https://api2.idanalyzer.com/face}")
    private String faceUrl;

    @Value("${idanalyzer.profile:security_medium}")
    private String profile;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    // quet mat trc va sau ccccd
    public JsonNode scanCccd(MultipartFile frontImage, MultipartFile backImage) {
        validateImage(frontImage, "mat truoc CCCD");
        validateImage(backImage, "mat sau CCCD");

        try {
            ObjectNode body = objectMapper.createObjectNode();
            body.put("document", toBase64(frontImage));
            body.put("documentBack", toBase64(backImage));
            body.put("profile", profile);
            body.put("restrictCountry", "VN");
            body.put("restrictType", "I");

            return post(scanUrl, body);
        } catch (IOException e) {
            throw new RuntimeException("Khong the doc anh CCCD", e);
        } catch (Exception e) {
            throw new RuntimeException("Loi API ID Analyzer khi quet CCCD", e);
        }
    }

    // so sanh co khop voi mat khong
    public JsonNode matchFaceByUrl(String portraitUrl, MultipartFile selfieImage) {
        if (portraitUrl == null || portraitUrl.isBlank()) {
            throw new IllegalArgumentException("Anh chan dung tham chieu khong duoc de trong");
        }
        validateImage(selfieImage, "anh selfie");

        try {
            ObjectNode body = objectMapper.createObjectNode();
            body.put("reference", portraitUrl);
            body.put("face", toBase64(selfieImage));
            body.put("profile", profile);

            return post(faceUrl, body);
        } catch (IOException e) {
            throw new RuntimeException("Khong the doc anh selfie", e);
        } catch (Exception e) {
            throw new RuntimeException("Loi API ID Analyzer khi so khop khuon mat", e);
        }
    }

    private JsonNode post(String url, JsonNode body) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));
        headers.set("X-API-KEY", apiKey);

        HttpEntity<String> request = new HttpEntity<>(body.toString(), headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        if (response.getBody() == null || response.getBody().isBlank()) {
            throw new RuntimeException("ID Analyzer tra ve response rong");
        }

        return objectMapper.readTree(response.getBody());
    }

    private String toBase64(MultipartFile file) throws IOException {
        return Base64.getEncoder().encodeToString(file.getBytes());
    }

    private void validateImage(MultipartFile file, String imageName) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Vui long chon " + imageName);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException(imageName + " phai la file anh");
        }
    }
}