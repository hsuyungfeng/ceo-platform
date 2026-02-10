import { resend, EMAIL_CONFIG } from './config';

export class EmailService {
  private async sendEmail(to: string, subject: string, html: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to,
        subject,
        html,
        replyTo: EMAIL_CONFIG.replyTo,
      });

      if (error) {
        console.error('Email send error:', error);
        throw new Error(`郵件發送失敗: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Email service error:', error);
      // 開發環境：記錄但不拋出錯誤
      if (process.env.NODE_ENV === 'development') {
        console.log('開發環境模擬發送郵件到:', to);
        console.log('郵件內容:', html);
        return { id: 'dev-mock-id' };
      }
      throw error;
    }
  }

  async sendVerificationEmail(email: string, token: string, userName?: string) {
    const verificationLink = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">驗證您的${EMAIL_CONFIG.companyName}帳戶</h2>
        <p>親愛的 ${userName || '用戶'}，</p>
        <p>感謝您註冊${EMAIL_CONFIG.companyName}。請點擊以下連結驗證您的電子郵件地址：</p>
        <p style="margin: 20px 0;">
          <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            驗證電子郵件
          </a>
        </p>
        <p>如果按鈕無法點擊，請複製以下連結到瀏覽器：</p>
        <p style="word-break: break-all; color: #2563eb;">${verificationLink}</p>
        <p>此驗證連結將在24小時後失效。</p>
        <p>如果您沒有註冊${EMAIL_CONFIG.companyName}，請忽略此郵件。</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          ${EMAIL_CONFIG.companyName} 團隊敬上
        </p>
      </div>
    `;

    return this.sendEmail(
      email,
      `驗證您的${EMAIL_CONFIG.companyName}帳戶`,
      html
    );
  }

  async sendTwoFactorCode(email: string, code: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">您的${EMAIL_CONFIG.companyName}驗證碼</h2>
        <p>您的雙因素驗證碼是：</p>
        <p style="font-size: 32px; font-weight: bold; color: #2563eb; text-align: center; margin: 30px 0;">
          ${code}
        </p>
        <p>此驗證碼將在10分鐘後失效。</p>
        <p>如果您沒有請求此驗證碼，請忽略此郵件。</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          ${EMAIL_CONFIG.companyName} 團隊敬上
        </p>
      </div>
    `;

    return this.sendEmail(
      email,
      `您的${EMAIL_CONFIG.companyName}驗證碼`,
      html
    );
  }

  async sendResetPasswordEmail(email: string, token: string, userName?: string) {
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">重設您的${EMAIL_CONFIG.companyName}密碼</h2>
        <p>親愛的 ${userName || '用戶'}，</p>
        <p>我們收到了重設您帳戶密碼的請求。請點擊以下連結重設您的密碼：</p>
        <p style="margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            重設密碼
          </a>
        </p>
        <p>如果按鈕無法點擊，請複製以下連結到瀏覽器：</p>
        <p style="word-break: break-all; color: #2563eb;">${resetLink}</p>
        <p>此重設連結將在1小時後失效。</p>
        <p>如果您沒有請求重設密碼，請忽略此郵件，您的密碼將保持不變。</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          ${EMAIL_CONFIG.companyName} 團隊敬上
        </p>
      </div>
    `;

    return this.sendEmail(
      email,
      `重設您的${EMAIL_CONFIG.companyName}密碼`,
      html
    );
  }
}

export const emailService = new EmailService();