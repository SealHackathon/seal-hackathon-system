package com.minhtung.hackathon.service;


import com.cloudinary.Cloudinary;

import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryStorageService {
    private final Cloudinary cloudinary ;

    public String uploadStudentCard (MultipartFile file , Long userID){
        try{
            Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(), ObjectUtils.asMap(
                            "folder", "seal-hackathon/student-cards/" + userID,
                            "resource_type", "image"
                    )
            );
            return uploadResult.get("secure_url").toString();
        }catch (IOException e){
            e.printStackTrace();
            throw new RuntimeException("Upload ảnh thẻ sinh viên thất bại", e);
        }
    }
}
