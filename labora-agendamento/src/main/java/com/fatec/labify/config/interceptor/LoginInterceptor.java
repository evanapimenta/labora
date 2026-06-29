package com.fatec.labify.config.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;

@Component
public class LoginInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(LoginInterceptor.class);

    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String path = request.getRequestURI();
        String ip = request.getRemoteAddr();
        String time = LocalDateTime.now().toString();

        if (path.equals("/login") && request.getMethod().equalsIgnoreCase("POST")) {
            logger.info("Standard login attempt from IP: {} at {}", ip, time);
        } else if (path.equals("/refresh-token") && request.getMethod().equalsIgnoreCase("POST")) {
            logger.info("Refresh token requested from IP: {} at {}", ip, time);
        } else if (path.equals("/login/google/callback") && request.getMethod().equalsIgnoreCase("GET")) {
            logger.info("Google SSO login attempt from IP: {} at {}", ip, time);
        }

        return true;
    }

}
