package com.fatec.labify.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fatec.labify.api.dto.GeolocationDTO;
import com.fatec.labify.api.dto.patient.AddressDTO;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.stream.Stream;

@Component
public class NominatimClient {
    private static final ObjectMapper mapper = new ObjectMapper();

    public GeolocationDTO getGeolocation(AddressDTO dto) {
        try {
            HttpResponse<String> geolocation = sendHttpRequest(buildUrl(dto));

            JsonNode array = mapper.readTree(geolocation.body());

            if (array.isArray() && array.size() > 0) {
                JsonNode firstResult = array.get(0);
                double lat = firstResult.get("lat").asDouble();
                double lon = firstResult.get("lon").asDouble();
                return new GeolocationDTO(lat, lon);
            }

        } catch (IOException | InterruptedException e) {
            throw new RuntimeException(e);
        }

        return null;
    }

    private String buildUrl(AddressDTO dto) {
        StringBuilder sb = new StringBuilder()
                .append("https://nominatim.openstreetmap.org/")
                .append("search?q=")
                .append(formatAddress(dto))
                .append("&format=json");
        return sb.toString();
    }

    private HttpResponse<String> sendHttpRequest(String url) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("User-Agent", "labora/1.0")
                .GET()
                .build();

        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private String formatAddress(AddressDTO address) {
        String rawAddress = Stream.of(
                        address.getStreet() + " " + address.getNumber(),
                        address.getNeighborhood(),
                        address.getCity(),
                        address.getState(),
                        address.getZipCode(),
                        address.getCountry()
                )
                .filter(s -> s != null && !s.trim().isEmpty())
                .map(String::trim)
                .reduce((a, b) -> a + ", " + b)
                .orElse("");

        return URLEncoder.encode(rawAddress, StandardCharsets.UTF_8);
    }

}
