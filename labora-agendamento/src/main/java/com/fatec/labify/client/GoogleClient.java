package com.fatec.labify.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fatec.labify.api.dto.authentication.UserTokenDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Component
public class GoogleClient {
    @Value("${labify.sso.google.client.id}")
    String clientId;

    @Value("${labify.sso.google.client.secret}")
    String clientSecret;

    @Value("${labify.sso.google.redirect.uri}")
    String redirectUri;

    @Value("${labify.sso.google.scope}")
    String scope;

    @Value("${labify.sso.google.token.endpoint}")
    String tokenEndpoint;

    ObjectMapper objectMapper = new ObjectMapper();

    public String buildAuthorizationUrl() {
        StringBuilder sb = new StringBuilder()
                .append("https://accounts.google.com/o/oauth2/auth?")
                .append("client_id=")
                .append(URLEncoder.encode(clientId, StandardCharsets.UTF_8))
                .append("&redirect_uri=")
                .append(URLEncoder.encode(redirectUri, StandardCharsets.UTF_8))
                .append("&response_type=code")
                .append("&scope=")
                .append(URLEncoder.encode(scope, StandardCharsets.UTF_8))
                .append("&access_type=offline&prompt=consent");

        return sb.toString();
    }

    public UserTokenDTO getUserToken(String code) throws JsonProcessingException {
        LinkedMultiValueMap<String, String> requestBodyData = new LinkedMultiValueMap<>();
        requestBodyData.add("code", code);
        requestBodyData.add("client_id", clientId);
        requestBodyData.add("client_secret", clientSecret);
        requestBodyData.add("redirect_uri", redirectUri);
        requestBodyData.add("grant_type", "authorization_code");

        String body = buildFormEncodedBody(requestBodyData);

        HttpResponse<String> response = sendHttpRequest(tokenEndpoint, body);
        return responseToUserToken(response);
    }

    private UserTokenDTO responseToUserToken(HttpResponse<String> response) throws JsonProcessingException {
        return objectMapper.readValue(response.body(), UserTokenDTO.class);
    }

    private HttpResponse<String> sendHttpRequest(String tokenEndpoint, String body) {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(tokenEndpoint))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .method(HttpMethod.POST.name(), body != null? HttpRequest.BodyPublishers.ofString(body) : HttpRequest.BodyPublishers.noBody());
        HttpRequest request = requestBuilder.build();

        try {
            return client.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    private String buildFormEncodedBody(LinkedMultiValueMap<String, String> requestBodyData) {
        return requestBodyData.entrySet().stream().flatMap(entry -> entry.getValue().stream().map(value -> entry.getKey() + "=" + URLEncoder.encode(value, StandardCharsets.UTF_8)))
                .collect(Collectors.joining("&"));
    }

}
