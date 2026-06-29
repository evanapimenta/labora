package com.fatec.labify.config.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Component
public class TestAuditInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(TestAuditInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = "Anonymous";
        String roles = "ROLE_ANONYMOUS";

        if (authentication != null && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            username = authentication.getName();
            roles = authentication.getAuthorities()
                    .stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(", "));
        }

        String method = request.getMethod();
        String uri = request.getRequestURI();
        int status = response.getStatus();
        String ip = request.getRemoteAddr();
        String time = LocalDateTime.now().toString();

        String message = String.format("Request: %s %s | Status: %d | User: %s (%s) | IP: %s | Time: %s",
                method, uri, status, username, roles, ip, time);

        if (ex != null) {
            message += " | Error: " + ex.getMessage();
        }

        logger.info(message);
    }

}
