package com.minhtung.hackathon.service;


import com.cloudinary.Url;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.http.HttpHeaders;

import java.io.IOException;
import java.net.URL;

@Service
@RequiredArgsConstructor
public class FptAiService {
    @Value("${fpt.ai.api-key}")
    private String apikey ;

    @Value("${fpt.ai.id-recognition-url}")
    private String idRecongnition ;

    @Value("${fpt.ai.face-match-url}")
    private String apiFaceMatch ;

      private final ObjectMapper objectMapper ;
      private final RestTemplate restTemplate = new RestTemplate();
      public JsonNode scanCccd(MultipartFile image){
          try{
              HttpHeaders headers = new HttpHeaders();
              headers.setContentType(MediaType.MULTIPART_FORM_DATA);
              headers.set("api-key",apikey);


              headers.set("image-type", "id-card");
              MultiValueMap<String,Object>body = new LinkedMultiValueMap<>();
              body.add("image",toResource(image));

              HttpEntity<MultiValueMap<String,Object>> request = new HttpEntity<>(body,headers) ;
              ResponseEntity<String> response = restTemplate.postForEntity(idRecongnition , request , String.class);

              return  objectMapper.readTree(response.getBody());


          }catch (Exception e){
              e.printStackTrace();
              throw new RuntimeException("loi api FPT.AI OCR CCCD",e) ;
          }
      }

      private ByteArrayResource  toResource(MultipartFile file) throws IOException {
          return new ByteArrayResource(file.getBytes()){
              @Override
              public String getFilename(){
                  return file.getOriginalFilename();
              }
          };
      }

//    public JsonNode matchFaceByUrl(String portraitUrl, MultipartFile selfieImage) {
//        try {
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
//            headers.set("api-key", apikey);
//
//
//
//            byte[] portraitBytes = new URL(portraitUrl).openStream().readAllBytes();
//            ByteArrayResource potraResource = new ByteArrayResource(portraitBytes){
//                @Override
//                public String getFilename(){
//                    return "portrait.jpg";
//                }
//            };
//            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
//            body.add("file[] ",  potraResource);
//            body.add("file[] ", toResource(selfieImage));
//
//            HttpEntity<MultiValueMap<String, Object>> request =
//                    new HttpEntity<>(body, headers);
//
//            ResponseEntity<String> response = restTemplate.postForEntity(
//                    apiFaceMatch,
//                    request,
//                    String.class
//            );
//
//            return objectMapper.readTree(response.getBody());
//        } catch (Exception e) {
//            e.printStackTrace();
//            throw new RuntimeException("Loi API FPT.AI face match", e);
//        }
//    }
public JsonNode matchFaceByUrl(String portraitUrl, MultipartFile selfieImage) {
    try {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("api-key", apikey);

        byte[] portraitBytes = new URL(portraitUrl).openStream().readAllBytes();

        ByteArrayResource portraitResource = new ByteArrayResource(portraitBytes) {
            @Override
            public String getFilename() {
                return "portrait.jpg";
            }
        };

        ByteArrayResource selfieResource = new ByteArrayResource(selfieImage.getBytes()) {
            @Override
            public String getFilename() {
                return selfieImage.getOriginalFilename();
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        body.add("file[]", portraitResource);
        body.add("file[]", selfieResource);

        HttpEntity<MultiValueMap<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                apiFaceMatch,
                request,
                String.class
        );

        return objectMapper.readTree(response.getBody());

    } catch (Exception e) {
        e.printStackTrace();
        throw new RuntimeException("Loi API FPT.AI face match", e);
    }
}
}
