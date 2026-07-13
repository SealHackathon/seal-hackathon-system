package com.minhtung.hackathon.service;

import com.google.gson.JsonObject;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value ;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;


@Service
public class EmailService {
  private final JavaMailSender mailSender;

  @Value("${app.base-url}")
  private String baseUrl;

  public EmailService(JavaMailSender mailSender) {
    this.mailSender = mailSender;
  }


  public boolean sendVerificationEmail(String email, String token) {
    String verifLink = baseUrl + "/api/auth/verify?token=" + token;

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
//      helper.setFrom("mtung638@gamil.com");
      helper.setTo(email);
      helper.setSubject("Xác  nhận đăng kí tài khoản");

      helper.setText(
              "<h2>Xác nhận tài khoản</h2>" +
                      "<p>Click vào nút bên dưới để kích hoạt:</p>" +
                      "<a href='" + verifLink + "' style='padding:12px 24px;" +
                      "background:#4F46E5;color:white;text-decoration:none;" +
                      "border-radius:6px;display:inline-block'> Xác nhận Email</a>" +
                      "<p>Link hết hạn sau <b> 15    phút</b>.</p>",
              true
      );
      mailSender.send(message);
      return true;


    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }
  }

  public boolean sendTeamInviteEmail(String email, String teamName, String inviteCode) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom("thainguyenthanh504@gmail.com");
      helper.setTo(email);
      helper.setSubject("Bạn được mời tham gia đội " + teamName);
      helper.setText(
              "<h2>Lời mời tham gia đội thi</h2>" +
                      "<p>Bạn được mời tham gia đội <b>" + teamName + "</b>.</p>" +
                      "<p>Mã mời để tham gia:</p>" +
                      "<div style='font-size:32px;font-weight:bold;letter-spacing:8px;" +
                      "background:#F0F4FF;padding:16px 32px;border-radius:8px;" +
                      "display:inline-block;color:#4F46E5'>" + inviteCode + "</div>" +
                      "<p>Chọn <b>\"Tham gia đội qua mã mời\"</b> và nhập mã trên.</p>" +
                      "<p style='color:#888;font-size:12px'>Mã mời chỉ hoạt động khi đội còn ở trạng thái OPEN.</p>",
              true
      );
      mailSender.send(message);
      return true ;


    } catch (Exception e) {
      e.printStackTrace();
        return false;
    }
  }
  public boolean sendReserveMemberKickedEmail(String email, String memberName, String teamName) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom("thainguyenthanh504@gmail.com");
      helper.setTo(email);
      helper.setSubject("[SEAL Hackathon] Bạn đã bị loại khỏi đội " + teamName);
      helper.setText(
              "<p>Xin chào <strong>" + memberName + "</strong>,</p>" +
              "<p>Đội <strong>\"" + teamName + "\"</strong> vừa được BTC phê duyệt. Do đội đã đủ thành viên chính thức, bạn (thành viên dự bị) đã bị tự động loại khỏi đội.</p>" +
              "<p>Bạn có thể tạo đội mới hoặc xin vào đội khác.</p>",
              true
      );
      mailSender.send(message);
      return true;
    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }
  }

  public boolean  emailxacnhantuadmin(String email){
//    String verifLink = baseUrl + "/api/auth/verify?email" + email;

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom("mtung638@gmail.com");
      helper.setTo(email);
      helper.setSubject("Xác  nhận đăng kí tài khoản");

      helper.setText(
              "<p>Tài khoản của bạn đã được phê duyệt thành công. Hãy nhanh chóng đăng nhập và tham gia một đội thi để không bỏ lỡ cơ hội đồng hành cùng các thành viên khác trong cuộc thi!</p>",
              true
      );
      mailSender.send(message);
      return true;


    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }
  }
}

