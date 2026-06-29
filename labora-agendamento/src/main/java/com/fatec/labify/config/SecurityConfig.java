package com.fatec.labify.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.spec.KeySpec;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final TokenFilter tokenFilter;

    public SecurityConfig(TokenFilter tokenFilter) {
        this.tokenFilter = tokenFilter;
    }

    @Bean
    public SecurityFilterChain securityFilters(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> {})
                .authorizeHttpRequests(
                        request -> {
                            request.requestMatchers(
                                    "/swagger-ui/**", "/v3/api-docs/**",
                                    "/login/**",
                                    "/refresh-token",
                                    "/users/verify-account",
                                    "/patients/create/**",
                                    "/error",
                                    "/users/{id}/change-password").permitAll();
                            request.requestMatchers(HttpMethod.POST, "/users").permitAll();
                            request.requestMatchers(HttpMethod.GET, "/users").hasRole("SYSTEM");

                            request.requestMatchers(HttpMethod.GET, "/labs").permitAll();
                            request.requestMatchers(HttpMethod.GET, "/labs/**").hasAnyRole("SYSTEM", "LAB", "BRANCH", "PATIENT");

                            request.requestMatchers(HttpMethod.GET, "/branches/**").hasAnyRole("SYSTEM", "LAB", "BRANCH", "PATIENT");

                            request.requestMatchers(HttpMethod.GET, "/tests/**").hasAnyRole("SYSTEM", "LAB", "BRANCH", "PATIENT");

                            request.requestMatchers("/schedule/**").hasAnyRole("SYSTEM", "LAB", "BRANCH", "PATIENT");
                            request.requestMatchers(HttpMethod.GET, "/me").hasAnyRole("PATIENT");
                            request.anyRequest().authenticated();
                        }
                )
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(csrf -> csrf.disable())
                .addFilterBefore(tokenFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder encryptor() {
        return new PasswordEncoder() {
            private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

            @Override
            public String encode(CharSequence rawPassword) {
                return bcrypt.encode(rawPassword);
            }

            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                if (encodedPassword == null) {
                    return false;
                }
                if (encodedPassword.startsWith("pbkdf2$")) {
                    try {
                        String[] parts = encodedPassword.split("\\$");
                        if (parts.length != 3) {
                            return false;
                        }
                        String salt = parts[1];
                        String storedHash = parts[2];

                        byte[] saltBytes = hexStringToByteArray(salt);
                        KeySpec spec = new PBEKeySpec(rawPassword.toString().toCharArray(), saltBytes, 1000, 512);
                        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512");
                        byte[] hashBytes = factory.generateSecret(spec).getEncoded();
                        String computedHash = byteArrayToHexString(hashBytes);

                        return computedHash.equals(storedHash);
                    } catch (Exception e) {
                        return false;
                    }
                }
                return bcrypt.matches(rawPassword, encodedPassword);
            }

            private byte[] hexStringToByteArray(String s) {
                int len = s.length();
                byte[] data = new byte[len / 2];
                for (int i = 0; i < len; i += 2) {
                    data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                                         + Character.digit(s.charAt(i+1), 16));
                }
                return data;
            }

            private String byteArrayToHexString(byte[] bytes) {
                StringBuilder sb = new StringBuilder();
                for (byte b : bytes) {
                    sb.append(String.format("%02x", b));
                }
                return sb.toString();
            }
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @Bean
    public RoleHierarchy roleHierarchy(){
        String hierarchy =
            """
            ROLE_SYSTEM > ROLE_LAB
            ROLE_LAB > ROLE_BRANCH
            ROLE_BRANCH > ROLE_PATIENT
            """;
        return RoleHierarchyImpl.fromHierarchy(hierarchy);
    }

}
