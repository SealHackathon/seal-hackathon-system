package com.minhtung.hackathon.dto.request;

public class RegisterRequest {
    private String schoolName;
    private String studentId;
    private String email;
    private String password;


    public RegisterRequest() {
    }

    public RegisterRequest(String email, String password, String schoolName, String studentId) {
        this.schoolName = schoolName;
        this.password = password;
        this.email = email;
        this.studentId = studentId;
    }

    public String getSchoolName() {
        return schoolName;
    }

    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String toString() {
        return "RegisterRequest{" +
                "schoolName='" + schoolName + '\'' +
                ", studentId='" + studentId + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}
