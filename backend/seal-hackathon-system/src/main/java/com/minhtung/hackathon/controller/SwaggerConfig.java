package com.minhtung.hackathon.controller;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;


public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenApi(){
        return new OpenAPI()
                .info(new Info()
                        .title("Hackathon API")
                        .version("1.0")
                        .description("API dang ky, xac nhan email, dang nhap")
                );

    }
}
