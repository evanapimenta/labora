package com.fatec.labify.api.service;

import com.fatec.labify.domain.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    private final JavaMailSender emailSender;
    private static final String FROM = "labify.contato@gmail.com";
    private static final String FROM_NAME = "Labify";

    @Value("${app.frontend.url:https://labify-front.vercel.app}")
    private String defaultFrontendUrl;

    public EmailService(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    @Async
    public void sendEmail(String userEmail, String subject, String content) {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        try {
            helper.setFrom(FROM, FROM_NAME);
            helper.setTo(userEmail);
            helper.setSubject(subject);
            helper.setText(content, true);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException("Erro ao enviar email");
        }

        emailSender.send(message);
    }

    private String getFrontendUrl() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String origin = request.getHeader("Origin");
            if (origin == null || origin.isEmpty()) {
                String referer = request.getHeader("Referer");
                if (referer != null && !referer.isEmpty()) {
                    try {
                        java.net.URI uri = new java.net.URI(referer);
                        origin = uri.getScheme() + "://" + uri.getAuthority();
                    } catch (Exception e) {
                        // ignore
                    }
                }
            }
            if (origin != null && !origin.isEmpty()) {
                if (!origin.contains("host.docker.internal")
                        && !origin.contains("localhost:8080")
                        && !origin.contains("127.0.0.1:8080")
                        && !origin.contains("agendamento")
                        && !origin.contains("labora-agendamento")) {
                    return origin;
                }
            }
        }
        return defaultFrontendUrl;
    }

    public void sendVerificationEmail(User user) {
        String subject = "Labora - Verifique seu e-mail";
        String frontendUrl = getFrontendUrl();

        String faviconUrl = "https://labora.zhia.dev/favicon-dark.png";

        String content = generateEmailContent(
                "<link href=\"https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap\" rel=\"stylesheet\">"
                        +
                        "<div style=\"background-color: #f8fafc; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\">"
                        +
                        "<div style=\"max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(12, 18, 34, 0.05); overflow: hidden; border: 1px solid #e2e8f0;\">"
                        +
                        "<div style=\"background: linear-gradient(135deg, #0db38e, #0296b4); background-color: #0db38e; padding: 35px 30px; text-align: center;\">"
                        +
                        "<div style=\"background-color: #ffffff; padding: 12px 24px; border-radius: 50px; display: inline-block; margin: 0 auto; box-shadow: 0 4px 12px rgba(12, 18, 34, 0.08); text-align: center;\">"
                        +
                        "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin: 0 auto; display: inline-block;\">"
                        +
                        "<tr>"
                        +
                        "<td style=\"vertical-align: middle; padding-right: 8px;\">"
                        +
                        "<img src=\"" + faviconUrl
                        + "\" alt=\"\" style=\"height: 32px; width: 32px; display: block; border: none; outline: none;\" />"
                        +
                        "</td>"
                        +
                        "<td style=\"vertical-align: middle;\">"
                        +
                        "<span style=\"font-family: 'Montserrat', -apple-system, sans-serif; font-size: 26px; font-weight: 800; color: #b60e81; letter-spacing: -1px; text-transform: lowercase; line-height: 32px; display: block;\">labora</span>"
                        +
                        "</td>"
                        +
                        "</tr>"
                        +
                        "</table>"
                        +
                        "</div>" +
                        "<p style=\"color: rgba(255, 255, 255, 0.95); margin: 12px 0 0 0; font-size: 13px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase;\">Suite de Saúde & Diagnósticos</p>"
                        +
                        "</div>" +
                        "<div style=\"padding: 40px 30px; color: #0c1222; line-height: 1.6;\">" +
                        "<h2 style=\"font-size: 20px; font-weight: 700; margin-top: 0; color: #0c1222; letter-spacing: -0.3px;\">Olá, [[name]]!</h2>"
                        +
                        "<p style=\"font-size: 15px; color: #475569; margin-bottom: 24px;\">" +
                        "Seja muito bem-vindo(a) à <strong>Labora</strong>. Para concluir o seu cadastro e começar a agendar seus exames com facilidade, por favor, valide seu endereço de e-mail."
                        +
                        "</p>" +
                        "<div style=\"text-align: center; margin: 30px 0;\">" +
                        "<a href=\"[[URL]]\" target=\"_blank\" style=\"background: linear-gradient(135deg, #0db38e, #0296b4); background-color: #0db38e; color: #ffffff; padding: 14px 32px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 4px 12px rgba(13, 179, 142, 0.25);\">"
                        +
                        "Confirmar E-mail" +
                        "</a>" +
                        "</div>" +
                        "<p style=\"font-size: 14px; color: #64748b; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 20px;\">"
                        +
                        "Ou copie e cole o link a seguir no seu navegador: <br>" +
                        "<a href=\"[[URL]]\" style=\"color: #0296b4; text-decoration: none; word-break: break-all; font-size: 12px;\">[[URL]]</a>"
                        +
                        "</p>" +
                        "</div>" +
                        "<div style=\"background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0; text-align: center;\">"
                        +
                        "<p style=\"font-size: 12px; color: #94a3b8; margin: 0 0 5px 0;\">" +
                        "Se você não realizou esta solicitação, por favor desconsidere este e-mail." +
                        "</p>" +
                        "<p style=\"font-size: 11px; color: #cbd5e1; margin: 0;\">" +
                        "&copy; 2026 Labora. Todos os direitos reservados." +
                        "</p>" +
                        "</div>" +
                        "</div>" +
                        "</div>",
                user.getName(),
                frontendUrl + "/register-patient?code=" + user.getToken());

        sendEmail(user.getEmail(), subject, content);
    }

    private String generateEmailContent(String template, String name, String url) {
        return template.replace("[[name]]", name).replace("[[URL]]", url);
    }

}
