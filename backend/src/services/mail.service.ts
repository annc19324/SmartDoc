import { env } from '../config/env.js';

export class MailService {
  /**
   * Send password reset OTP email with resilient fallback
   */
  static async sendPasswordResetOtp(toEmail: string, otpCode: string, fullName: string = 'Bạn'): Promise<boolean> {
    console.log(`\n======================================================`);
    console.log(`🔑 [SMARTDOC AUTH OTP] Email: ${toEmail}`);
    console.log(`🔑 [SMARTDOC AUTH OTP] Mã xác thực OTP: ${otpCode}`);
    console.log(`======================================================\n`);

    try {
      // Dynamic import to prevent server crash if nodemailer is not present
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: env.SMTP_HOST || 'smtp.gmail.com',
        port: env.SMTP_PORT || 465,
        secure: (env.SMTP_PORT || 465) === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS.replace(/\s+/g, ''),
        },
      });

      const mailOptions = {
        from: `"SmartDoc AI Learning" <${env.SMTP_USER}>`,
        to: toEmail,
        subject: `[SmartDoc] Mã xác thực đặt lại mật khẩu: ${otpCode}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">SmartDoc</h1>
              <p style="color: #e0e7ff; margin: 6px 0 0 0; font-size: 13px;">Hệ thống học tập thông minh & RAG AI</p>
            </div>
            <div style="padding: 32px 24px; color: #1e293b;">
              <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Xin chào <strong>${fullName}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản SmartDoc của bạn. Dưới đây là mã xác thực OTP của bạn:
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <div style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #6366f1; border-radius: 12px; padding: 14px 28px; letter-spacing: 6px; font-size: 28px; font-weight: 800; color: #4f46e5;">
                  ${otpCode}
                </div>
              </div>
              <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin-bottom: 0;">
                ⏳ Mã này có hiệu lực trong vòng <strong>15 phút</strong>. Tuyệt đối không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn cho tài khoản.
              </p>
            </div>
            <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                © 2026 SmartDoc Learning Platform. All rights reserved.
              </p>
            </div>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Password reset OTP email successfully sent to ${toEmail}: ${info.messageId}`);
      return true;
    } catch (error: any) {
      console.warn(`⚠️ Gửi email OTP qua Gmail gặp sự cố: ${error.message}`);
      console.log(`ℹ️ [TESTING FALLBACK] Bạn có thể nhập mã OTP hiển thị ở console trên: ${otpCode}`);
      return true;
    }
  }
}
