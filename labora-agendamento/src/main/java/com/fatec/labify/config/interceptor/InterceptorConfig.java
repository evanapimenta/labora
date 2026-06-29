package com.fatec.labify.config.interceptor;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class InterceptorConfig implements WebMvcConfigurer {

    private final LoginInterceptor loginInterceptor;
    private final LaboratoryAuditInterceptor laboratoryAuditInterceptor;
    private final RoleAuditInterceptor roleAuditInterceptor;
    private final TestAuditInterceptor testAuditInterceptor;

    public InterceptorConfig(LoginInterceptor loginInterceptor,
                              LaboratoryAuditInterceptor laboratoryAuditInterceptor,
                              RoleAuditInterceptor roleAuditInterceptor,
                              TestAuditInterceptor testAuditInterceptor) {
        this.loginInterceptor = loginInterceptor;
        this.laboratoryAuditInterceptor = laboratoryAuditInterceptor;
        this.roleAuditInterceptor = roleAuditInterceptor;
        this.testAuditInterceptor = testAuditInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/login/**", "/refresh-token");

        registry.addInterceptor(laboratoryAuditInterceptor)
                .addPathPatterns("/labs/**");

        registry.addInterceptor(roleAuditInterceptor)
                .addPathPatterns("/roles/**");

        registry.addInterceptor(testAuditInterceptor)
                .addPathPatterns("/**");
    }
}
