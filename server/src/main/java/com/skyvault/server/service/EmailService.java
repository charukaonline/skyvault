package com.skyvault.server.service;

import com.skyvault.server.model.Order;
import com.skyvault.server.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSenderImpl mailSender;

    public EmailService(
        @Value("${zohomail.username}") String username,
        @Value("${zohomail.password}") String password
    ) {
        mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.zoho.com");
        mailSender.setPort(587);
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "false");
    }

    public void sendOrderPlacedEmail(User buyer, User creator, Order order) {
        // Email to creator
        String subjectCreator = "New Order Received on SkyVault";
        String textCreator = String.format(
            "Hello %s,\n\nYou have received a new order from %s (%s).\nOrder ID: %s\nContent: %s\nPlease review the payment slip and approve or reject the order in your dashboard.\n\nSkyVault Team",
            creator.getName(), buyer.getName(), buyer.getEmail(), order.getId(), String.join(", ", order.getContentTitles())
        );
        sendEmail(creator.getEmail(), subjectCreator, textCreator);

        // Email to buyer
        String subjectBuyer = "Order Submitted on SkyVault";
        String textBuyer = String.format(
            "Hello %s,\n\nYour order has been submitted and is pending approval from the creator (%s).\nOrder ID: %s\nContent: %s\nYou will receive a notification once your order is approved or rejected.\n\nSkyVault Team",
            buyer.getName(), creator.getName(), order.getId(), String.join(", ", order.getContentTitles())
        );
        sendEmail(buyer.getEmail(), subjectBuyer, textBuyer);
    }

    public void sendOrderApprovedEmail(User buyer, User creator, Order order) {
        // Email to buyer
        String subjectBuyer = "Order Approved - Download Your Content";
        String textBuyer = String.format(
            "Hello %s,\n\nYour order (ID: %s) has been approved by %s (%s).\nYou can now download your purchased content from your SkyVault dashboard.\n\nThank you for your purchase!\n\nSkyVault Team",
            buyer.getName(), order.getId(), creator.getName(), creator.getEmail()
        );
        sendEmail(buyer.getEmail(), subjectBuyer, textBuyer);

        // Email to creator
        String subjectCreator = "Order Approved Confirmation";
        String textCreator = String.format(
            "Hello %s,\n\nYou have approved order ID: %s for buyer %s (%s).\nThank you for using SkyVault!\n\nSkyVault Team",
            creator.getName(), order.getId(), buyer.getName(), buyer.getEmail()
        );
        sendEmail(creator.getEmail(), subjectCreator, textCreator);
    }

    public void sendOrderRejectedEmail(User buyer, User creator, Order order) {
        // Email to buyer
        String subjectBuyer = "Order Rejected";
        String textBuyer = String.format(
            "Hello %s,\n\nYour order (ID: %s) has been rejected by %s (%s).\nIf you have questions, please contact the creator or SkyVault support.\n\nSkyVault Team",
            buyer.getName(), order.getId(), creator.getName(), creator.getEmail()
        );
        sendEmail(buyer.getEmail(), subjectBuyer, textBuyer);

        // Email to creator
        String subjectCreator = "Order Rejected Confirmation";
        String textCreator = String.format(
            "Hello %s,\n\nYou have rejected order ID: %s for buyer %s (%s).\n\nSkyVault Team",
            creator.getName(), order.getId(), buyer.getName(), buyer.getEmail()
        );
        sendEmail(creator.getEmail(), subjectCreator, textCreator);
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailSender.getUsername());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Sent email to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, subject, e);
        }
    }
}
