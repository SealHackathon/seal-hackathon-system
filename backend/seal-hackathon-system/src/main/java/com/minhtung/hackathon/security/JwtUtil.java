package com.minhtung.hackathon.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    //secret token
    private static  final String SECRET ="mySecretKey_SWP391_Hackathon_2024_MinhTung!";
    // thoi gia ton tai token la 24h
    private static final long EXPIRATION_MS = 86_400_000L;

    private Key getKey(){
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }
    public String generateToken(String email , String role){
        return Jwts.builder()
                .setSubject(email)
                .claim("role",role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()+EXPIRATION_MS))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    public String extracRole(String token){
        return (String) parseClaims(token).get("role");
    }

    private Claims parseClaims(String token){
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenValid(String token){
        try{
            parseClaims(token);
            return true ;
        }catch (JwtException | IllegalArgumentException e ){
            return false ;
        }
    }

    public String extractEmail(String token){
        return parseClaims(token).getSubject() ;
    }
}
