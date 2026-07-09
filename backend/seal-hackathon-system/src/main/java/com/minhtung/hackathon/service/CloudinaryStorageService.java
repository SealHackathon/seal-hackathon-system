package com.minhtung.hackathon.service;


import com.cloudinary.Cloudinary;

import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryStorageService {
    private final Cloudinary cloudinary;

    public String uploadStudentCard(MultipartFile file, Long userID) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(), ObjectUtils.asMap(
                            "folder", "seal-hackathon/student-cards/" + userID,
                            "resource_type", "image"
                    )
            );
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Upload ảnh thẻ sinh viên thất bại", e);
        }
    }

    public String uploadKycImage(MultipartFile file, Long userId, String type) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "seal-hackathon/kyc/" + userId + "/" + type, "resource_type", "image"
                    )
            );
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("upload anh that bai ", e);
        }
    }

    public record CloudinaryUploadResult(String secureUrl, String publicId) {
    }

    public CloudinaryUploadResult uploadKycImageWithPublicId(
            MultipartFile file,
            Long userId,
            String type
    ) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", "seal-hackathon/kyc/" + userId + "/" + type, "resource_type", "image"));
            return new CloudinaryUploadResult(
                    uploadResult.get("secure_url").toString(),
                    uploadResult.get("public_id").toString()
            );
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("upload anh that bai");
        }
    }

    public String buildFaceCropUrl(String publicid) {
        return cloudinary.url()
                .secure(true)
                .transformation(new Transformation()
                        .width(400)
                        .height(400)
                        .crop("thumb")
                        .gravity("face")
                        .quality("auto")
                        .fetchFormat("auto"))
                .generate(publicid);


    }

    public String uploadAvatar(MultipartFile file, Long userID) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(), ObjectUtils.asMap(
                            "folder", "seal-hackathon/avatar/" + userID,
                            "resource_type", "image"
                    )
            );
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Upload ảnh thẻ sinh viên thất bại", e);
        }
    }

    public String uploadSubmissionFile(MultipartFile file , Long teamId , Long roundId , String resourceType){
        try{
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(), ObjectUtils.asMap(
                            "folder", "seal-Hackathon/submissions/" + teamId + "/" + roundId,
                            "resource_type", resourceType));
            return uploadResult.get("secure_url").toString();
        }catch (IOException e ){
            e.printStackTrace();
            throw new RuntimeException("Upload File that bai ");
        }
    }
}

