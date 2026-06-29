package com.fatec.labify.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class ClientConfig {

    @Value("${labora.api.url:http://localhost:3001}")
    private String laboraApiUrl;

    @Bean
    public RestClient laboraRestClient() {
        return RestClient.builder()
                .baseUrl(laboraApiUrl)
                .build();
    }
}
