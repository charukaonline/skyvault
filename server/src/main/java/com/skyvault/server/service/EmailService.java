package com.skyvault.server.service;

import com.skyvault.server.model.Order;
import com.skyvault.server.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSenderImpl mailSender;

    // Prevent duplicate emails within a short window (e.g., 5 seconds)
    private final ConcurrentHashMap<String, Instant> recentEmailActions = new ConcurrentHashMap<>();
    private static final long EMAIL_DEBOUNCE_SECONDS = 5;

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

    private boolean shouldSendEmail(String actionKey) {
        Instant now = Instant.now();
        Instant lastSent = recentEmailActions.get(actionKey);
        if (lastSent != null && now.isBefore(lastSent.plusSeconds(EMAIL_DEBOUNCE_SECONDS))) {
            log.warn("Duplicate email prevented for action: {}", actionKey);
            return false;
        }
        recentEmailActions.put(actionKey, now);
        // Clean up old entries
        recentEmailActions.entrySet().removeIf(e -> now.isAfter(e.getValue().plusSeconds(EMAIL_DEBOUNCE_SECONDS * 2)));
        return true;
    }

    public void sendOrderPlacedEmail(User buyer, User creator, Order order) {
        String actionKey = "order-placed-" + order.getId();
        if (!shouldSendEmail(actionKey)) return;
        // Email to creator
        String subjectCreator = "New Order Received on SkyVault";
        String textCreator = String.format(
            "Hello %s,\n\nYou have received a new order from %s (%s).\nOrder ID: %s\nContent: %s\nPlease review the payment slip and approve or reject the order in your dashboard.\n\nSkyVault Team",
            creator.getName(), buyer.getName(), buyer.getEmail(), order.getId(), String.join(", ", order.getContentTitles())
        );
        sendHtmlEmail(creator.getEmail(), subjectCreator, buildOrderPlacedHtml(creator, buyer, order, true));

        // Email to buyer
        String subjectBuyer = "Order Submitted on SkyVault";
        String textBuyer = String.format(
            "Hello %s,\n\nYour order has been submitted and is pending approval from the creator (%s).\nOrder ID: %s\nContent: %s\nYou will receive a notification once your order is approved or rejected.\n\nSkyVault Team",
            buyer.getName(), creator.getName(), order.getId(), String.join(", ", order.getContentTitles())
        );
        sendHtmlEmail(buyer.getEmail(), subjectBuyer, buildOrderPlacedHtml(buyer, creator, order, false));
    }

    public void sendOrderApprovedEmail(User buyer, User creator, Order order) {
        String actionKey = "order-approved-" + order.getId();
        if (!shouldSendEmail(actionKey)) return;
        // Email to buyer
        String subjectBuyer = "Order Approved - Download Your Content";
        String textBuyer = String.format(
            "Hello %s,\n\nYour order (ID: %s) has been approved by %s (%s).\nYou can now download your purchased content from your SkyVault dashboard.\n\nThank you for your purchase!\n\nSkyVault Team",
            buyer.getName(), order.getId(), creator.getName(), creator.getEmail()
        );
        sendHtmlEmail(buyer.getEmail(), subjectBuyer, buildOrderApprovedHtml(buyer, creator, order, true));

        // Email to creator
        String subjectCreator = "Order Approved Confirmation";
        String textCreator = String.format(
            "Hello %s,\n\nYou have approved order ID: %s for buyer %s (%s).\nThank you for using SkyVault!\n\nSkyVault Team",
            creator.getName(), order.getId(), buyer.getName(), buyer.getEmail()
        );
        sendHtmlEmail(creator.getEmail(), subjectCreator, buildOrderApprovedHtml(creator, buyer, order, false));
    }

    public void sendOrderRejectedEmail(User buyer, User creator, Order order) {
        String actionKey = "order-rejected-" + order.getId();
        if (!shouldSendEmail(actionKey)) return;
        // Email to buyer
        String subjectBuyer = "Order Rejected";
        String textBuyer = String.format(
            "Hello %s,\n\nYour order (ID: %s) has been rejected by %s (%s).\nIf you have questions, please contact the creator or SkyVault support.\n\nSkyVault Team",
            buyer.getName(), order.getId(), creator.getName(), creator.getEmail()
        );
        sendHtmlEmail(buyer.getEmail(), subjectBuyer, buildOrderRejectedHtml(buyer, creator, order, true));

        // Email to creator
        String subjectCreator = "Order Rejected Confirmation";
        String textCreator = String.format(
            "Hello %s,\n\nYou have rejected order ID: %s for buyer %s (%s).\n\nSkyVault Team",
            creator.getName(), order.getId(), buyer.getName(), buyer.getEmail()
        );
        sendHtmlEmail(creator.getEmail(), subjectCreator, buildOrderRejectedHtml(creator, buyer, order, false));
    }

    // Modern HTML template for Order Placed
    private String buildOrderPlacedHtml(User to, User other, Order order, boolean toCreator) {
        String mainColor = "#2563eb"; // blue-600
        String accentColor = "#06b6d4"; // cyan-400
        String bgColor = "#0f172a"; // slate-900
        String textColor = "#f1f5f9"; // slate-100
        String role = toCreator ? "creator" : "buyer";
        String greeting = toCreator
            ? "You have received a new order!"
            : "Your order has been submitted!";
        String info = toCreator
            ? String.format("A new order from <b>%s</b> (%s) is awaiting your review.", other.getName(), other.getEmail())
            : String.format("Your order is pending approval from <b>%s</b>.", other.getName());
        String action = toCreator
            ? "Please review the payment slip and approve or reject the order in your dashboard."
            : "You will receive a notification once your order is approved or rejected.";
        String contentList = String.join(", ", order.getContentTitles());
        return """
        <div style="background:%s;padding:32px 0;">
          <div style="max-width:480px;margin:0 auto;background:#1e293b;border-radius:12px;box-shadow:0 4px 24px #0002;padding:32px;">
            <div style="text-align:center;margin-bottom:24px;">
              <span style="font-size:2rem;font-weight:700;color:%s;letter-spacing:1px;">SkyVault</span>
              <div style="font-size:1.1rem;color:%s;margin-top:4px;">Aerial Content Marketplace</div>
            </div>
            <h2 style="color:%s;font-size:1.3rem;font-weight:600;margin-bottom:12px;">%s</h2>
            <p style="color:%s;font-size:1rem;margin-bottom:18px;">%s</p>
            <div style="background:%s;padding:16px;border-radius:8px;margin-bottom:18px;">
              <div style="color:%s;font-size:1rem;"><b>Order ID:</b> %s</div>
              <div style="color:%s;font-size:1rem;"><b>Content:</b> %s</div>
            </div>
            <p style="color:%s;font-size:1rem;margin-bottom:18px;">%s</p>
            <a href="https://skyvault.lk" style="display:inline-block;background:%s;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:1rem;letter-spacing:0.5px;">Go to Dashboard</a>
            <div style="margin-top:32px;color:#64748b;font-size:0.95rem;text-align:center;">SkyVault Team</div>
          </div>
        </div>
        """.formatted(
            bgColor, mainColor, accentColor, mainColor, greeting, textColor, info,
            "#334155", textColor, order.getId(), textColor, contentList, textColor, action, mainColor
        );
    }

    // Modern HTML template for Order Approved
    private String buildOrderApprovedHtml(User to, User other, Order order, boolean toBuyer) {
        String mainColor = "#22d3ee"; // cyan-400
        String accentColor = "#2563eb"; // blue-600
        String bgColor = "#0f172a";
        String textColor = "#f1f5f9";
        String greeting = toBuyer
            ? "Your order has been approved!"
            : "You have approved an order.";
        String info = toBuyer
            ? String.format("Order <b>%s</b> has been approved by <b>%s</b> (%s).", order.getId(), other.getName(), other.getEmail())
            : String.format("You have approved order <b>%s</b> for buyer <b>%s</b> (%s).", order.getId(), other.getName(), other.getEmail());
        String action = toBuyer
            ? "You can now download your purchased content from your SkyVault dashboard."
            : "Thank you for using SkyVault!";
        return """
        <div style="background:%s;padding:32px 0;">
          <div style="max-width:480px;margin:0 auto;background:#1e293b;border-radius:12px;box-shadow:0 4px 24px #0002;padding:32px;">
            <div style="text-align:center;margin-bottom:24px;">
              <span style="font-size:2rem;font-weight:700;color:%s;letter-spacing:1px;">SkyVault</span>
              <div style="font-size:1.1rem;color:%s;margin-top:4px;">Aerial Content Marketplace</div>
            </div>
            <h2 style="color:%s;font-size:1.3rem;font-weight:600;margin-bottom:12px;">%s</h2>
            <p style="color:%s;font-size:1rem;margin-bottom:18px;">%s</p>
            <div style="background:%s;padding:16px;border-radius:8px;margin-bottom:18px;">
              <div style="color:%s;font-size:1rem;"><b>Order ID:</b> %s</div>
            </div>
            <p style="color:%s;font-size:1rem;margin-bottom:18px;">%s</p>
            <a href="https://skyvault.lk" style="display:inline-block;background:%s;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:1rem;letter-spacing:0.5px;">Go to Dashboard</a>
            <div style="margin-top:32px;color:#64748b;font-size:0.95rem;text-align:center;">SkyVault Team</div>
          </div>
        </div>
        """.formatted(
            bgColor, accentColor, mainColor, accentColor, greeting, textColor, info,
            "#334155", textColor, order.getId(), textColor, action, accentColor
        );
    }

    // Modern HTML template for Order Rejected
    private String buildOrderRejectedHtml(User to, User other, Order order, boolean toBuyer) {
        String mainColor = "#ef4444"; // red-500
        String accentColor = "#2563eb"; // blue-600
        String bgColor = "#0f172a";
        String textColor = "#f1f5f9";
        String greeting = toBuyer
            ? "Your order has been rejected."
            : "You have rejected an order.";
        String info = toBuyer
            ? String.format("Order <b>%s</b> was rejected by <b>%s</b> (%s).", order.getId(), other.getName(), other.getEmail())
            : String.format("You have rejected order <b>%s</b> for buyer <b>%s</b> (%s).", order.getId(), other.getName(), other.getEmail());
        String action = toBuyer
            ? "If you have questions, please contact the creator or SkyVault support."
            : "";
        return """
        <div style="background:%s;padding:32px 0;">
          <div style="max-width:480px;margin:0 auto;background:#1e293b;border-radius:12px;box-shadow:0 4px 24px #0002;padding:32px;">
            <div style="text-align:center;margin-bottom:24px;">
              <span style="font-size:2rem;font-weight:700;color:%s;letter-spacing:1px;">SkyVault</span>
              <div style="font-size:1.1rem;color:%s;margin-top:4px;">Aerial Content Marketplace</div>
            </div>
            <h2 style="color:%s;font-size:1.3rem;font-weight:600;margin-bottom:12px;">%s</h2>
            <p style="color:%s;font-size:1rem;margin-bottom:18px;">%s</p>
            <div style="background:%s;padding:16px;border-radius:8px;margin-bottom:18px;">
              <div style="color:%s;font-size:1rem;"><b>Order ID:</b> %s</div>
            </div>
            <p style="color:%s;font-size:1rem;margin-bottom:18px;">%s</p>
            <a href="https://skyvault.lk" style="display:inline-block;background:%s;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:1rem;letter-spacing:0.5px;">Go to Dashboard</a>
            <div style="margin-top:32px;color:#64748b;font-size:0.95rem;text-align:center;">SkyVault Team</div>
          </div>
        </div>
        """.formatted(
            bgColor, mainColor, accentColor, mainColor, greeting, textColor, info,
            "#334155", textColor, order.getId(), textColor, action, mainColor
        );
    }

    // Send HTML email
    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(mailSender.getUsername());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Sent HTML email to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send HTML email to {}: {}", to, subject, e);
        }
    }

    // Optionally keep sendEmail for fallback or plain text
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
