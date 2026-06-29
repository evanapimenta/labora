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
public class RoleAuditInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(RoleAuditInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String ip = request.getRemoteAddr();
        String time = LocalDateTime.now().toString();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return true;
        }

        String username = authentication.getName();
        String roles = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(", "));

        String method = request.getMethod();
        String uri = request.getRequestURI();

        if (uri.startsWith("/roles") && method.equalsIgnoreCase("POST")) {
            String targetUserId = request.getParameter("userId");
            String roleToRevoke = request.getParameter("roleToRevoke");
            String labId = request.getParameter("labId");
            String branchId = request.getParameter("branchId");

            String message = null;

            if (uri.equals("/roles/super-admin") && targetUserId != null && labId != null) {
                message = String.format("User '%s' ([%s]) assigned SUPER_ADMIN role to user '%s' for lab '%s' at %s from IP %s",
                        username, roles, targetUserId, labId, time, ip);

            } else if (uri.equals("/roles/admin") && targetUserId != null && branchId != null) {
                message = String.format("User '%s' ([%s]) assigned ADMIN role to user '%s' for branch '%s' at %s from IP %s",
                        username, roles, targetUserId, branchId, time, ip);

            } else if (uri.startsWith("/roles/revoke-role/") && roleToRevoke != null) {
                String pathUserId = uri.substring("/roles/revoke-role/".length());

                message = String.format("User '%s' ([%s]) revoked role %s from user '%s' at %s from IP %s",
                        username, roles, roleToRevoke, pathUserId, time, ip);
            }
            if (message != null) {
                logger.info(message);
            }
        }

        return true;
    }

}
