package com.minhtung.hackathon.dto.response;

public class LoginResponse {
    private String token ;
    private String role ;
    private String email ;
    private String message ;
    private String fullname ;

    public LoginResponse() {
    }

    public LoginResponse(String token, String role, String email, String message,String fullname) {
        this.token = token;
        this.role = role;
        this.email = email;
        this.message = message;
        this.fullname = fullname;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String userName) {
        this.email = userName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getFullname() {
        return fullname;
    }
    public void setFullname(String fullname) {
        this.fullname = fullname;
    }
    @Override
    public String toString() {
        return "LoginResponse{" +
                "token='" + token + '\'' +
                ", role='" + role + '\'' +
                ", email='" + email + '\'' +
                ", message='" + message + '\'' +
                '}';
    }
}
