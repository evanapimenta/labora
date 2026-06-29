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
public class BranchAuditInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(BranchAuditInterceptor.class);

    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            String username = authentication.getName();

            String roles = authentication.getAuthorities()
                    .stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(", "));

            String method = request.getMethod();
            String uri = request.getRequestURI();
            String ip = request.getRemoteAddr();
            String time = LocalDateTime.now().toString();

            String message = String.format("User '%s' ([%s]) performed %s on %s at %s from IP %s",
                    username, roles, method, uri, time, ip);

            logger.info(message);
        } else {
            logger.info("Anonymous or unauthenticated request: {} {} from IP {}", request.getMethod(), request.getRequestURI(), request.getRemoteAddr());
        }

        return true;
    }

}