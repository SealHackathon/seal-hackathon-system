package com.minhtung.hackathon.config;

import com.minhtung.hackathon.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity           //  bật @PreAuthorize trên từng method
@RequiredArgsConstructor
public class SecurityConfig {


    private final JwtAuthFilter jwtAuthFilter;


    //encoder o day
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
        //fix branch github
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth

                        // Swagger
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/v3/api-docs",
                                "/webjars/**"
                        ).permitAll()

                        // Auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/team/**").permitAll()
                        .requestMatchers("/api/teamrequest/**").permitAll()
                        .requestMatchers("/api/user/**").permitAll()
                        .requestMatchers("/api/event/**").permitAll()
                        .requestMatchers("/api/round/**").permitAll()
                        // Role
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/lecturer/**")
                        .hasAnyRole("ADMIN", "LECTURER")

                        .requestMatchers("/api/user/student-profile").hasRole("USER")
                        .requestMatchers("/api/user/avatar").hasRole("USER")


                        .requestMatchers("/api/kyc/student-card").hasRole("USER")
                        .requestMatchers("/api/kyc/cccd").hasRole("USER")
                        .requestMatchers("/api/kyc/face-match").hasRole("USER")
                        .requestMatchers("/api/kyc/*/approve").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
