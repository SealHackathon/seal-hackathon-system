package com.minhtung.hackathon.dto.response;

import com.minhtung.hackathon.enums.MemberRole;

public class LoginResponse {
    private String token;
    private String role;
    private String email;
    private String message;
    private String fullname;
    private boolean hasTeam;
    private String teamRole;
    private long expiredTime;

    public LoginResponse() {
    }

    public LoginResponse(String token, String role, String email, String message, String fullname, boolean hasTeam, String teamRole, long expiredTime) {
        this.token = token;
        this.role = role;
        this.email = email;
        this.message = message;
        this.fullname = fullname;
        this.hasTeam = hasTeam;
        this.teamRole = teamRole;
        this.expiredTime = expiredTime;

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

    public boolean isHasTeam() {
        return hasTeam;
    }

    public void setHasTeam(boolean hasTeam) {
        this.hasTeam = hasTeam;
    }

    public long getExpiredTime() {
        return expiredTime;
    }

    public void setExpiredTime(long expiredTime) {
        this.expiredTime = expiredTime;
    }

    public String getTeamRole() {
        return teamRole;
    }

    public void setTeamRole(String teamRole) {
        this.teamRole = teamRole;
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
