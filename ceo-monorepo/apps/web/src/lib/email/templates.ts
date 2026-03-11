/**
 * Email templates for CEO Group Buying Platform
 * Professional, responsive HTML emails with consistent branding
 */

  const COLORS = {
    primary: "#2563eb",
    success: "#16a34a",
    warning: "#ea580c",
    danger: "#dc2626",
    gray: "#6b7280",
  };

const STYLES = {
  container: `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
  `,
  header: `
    background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%);
    color: white;
    padding: 40px 20px;
    text-align: center;
    border-radius: 8px 8px 0 0;
  `,
  body: `
    padding: 30px 20px;
    color: ${COLORS.darkGray};
    line-height: 1.6;
  `,
  footer: `
    padding: 20px;
    background-color: #f9fafb;
    border-top: 1px solid ${COLORS.lightGray};
    text-align: center;
    color: ${COLORS.gray};
    font-size: 12px;
  `,
  button: `
    background-color: ${COLORS.primary};
    color: white;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 6px;
    display: inline-block;
    font-weight: 600;
    margin: 20px 0;
    transition: background-color 0.3s ease;
  `,
  buttonHover: `
    background-color: ${COLORS.secondary};
  `,
} as const;

interface EmailTemplateProps {
  companyName: string;
  supportEmail: string;
  year: number;
}

export function createVerificationEmailTemplate(
  props: EmailTemplateProps & {
    userName?: string;
    verificationLink: string;
    expiryHours?: number;
  }
) {
  const { companyName, supportEmail, year, userName, verificationLink, expiryHours = 24 } = props;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>驗證您的${companyName}帳戶</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
        <div style="${STYLES.container}">
          <!-- Header -->
          <div style="${STYLES.header}">
            <h1 style="margin: 0; font-size: 28px;">驗證您的帳戶</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">${companyName}</p>
          </div>

          <!-- Body -->
          <div style="${STYLES.body}">
            <p>親愛的 ${userName || '用戶'}，</p>

            <p>感謝您在${companyName}註冊。為了確保帳戶安全，請驗證您的電子郵件地址。</p>

            <div style="text-align: center;">
              <a href="${verificationLink}" style="${STYLES.button}">
                驗證電子郵件
              </a>
            </div>

            <p>或複製以下連結到瀏覽器：</p>
            <p style="word-break: break-all; background-color: #f9fafb; padding: 12px; border-radius: 4px; color: ${COLORS.primary}; font-size: 12px;">
              ${verificationLink}
            </p>

            <p style="color: ${COLORS.gray}; font-size: 14px; margin-top: 20px;">
              ⏱️ 此驗證連結將在 <strong>${expiryHours} 小時</strong> 後失效。
            </p>

            <p style="color: ${COLORS.gray}; font-size: 14px;">
              如果您沒有建立此帳戶，請忽略此郵件。
            </p>
          </div>

          <!-- Footer -->
          <div style="${STYLES.footer}">
            <p>© ${year} ${companyName}。保留所有權利。</p>
            <p>如有疑問，請聯絡我們：<a href="mailto:${supportEmail}" style="color: ${COLORS.primary}; text-decoration: none;">${supportEmail}</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function createResetPasswordEmailTemplate(
  props: EmailTemplateProps & {
    userName?: string;
    resetLink: string;
    expiryMinutes?: number;
  }
) {
  const { companyName, supportEmail, year, userName, resetLink, expiryMinutes = 60 } = props;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>重設${companyName}密碼</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
        <div style="${STYLES.container}">
          <!-- Header -->
          <div style="${STYLES.header}">
            <h1 style="margin: 0; font-size: 28px;">重設您的密碼</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">${companyName}</p>
          </div>

          <!-- Body -->
          <div style="${STYLES.body}">
            <p>親愛的 ${userName || '用戶'}，</p>

            <p>我們收到了重設您帳戶密碼的請求。點擊下面的按鈕來建立新密碼。</p>

            <div style="text-align: center;">
              <a href="${resetLink}" style="${STYLES.button}">
                重設密碼
              </a>
            </div>

            <p>或複製以下連結到瀏覽器：</p>
            <p style="word-break: break-all; background-color: #f9fafb; padding: 12px; border-radius: 4px; color: ${COLORS.primary}; font-size: 12px;">
              ${resetLink}
            </p>

            <p style="color: ${COLORS.gray}; font-size: 14px; margin-top: 20px;">
              ⏱️ 此重設連結將在 <strong>${expiryMinutes} 分鐘</strong> 後失效。
            </p>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ 安全提示：</strong> 如果您沒有請求重設密碼，請忽略此郵件。您的帳戶密碼將保持不變。
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="${STYLES.footer}">
            <p>© ${year} ${companyName}。保留所有權利。</p>
            <p>如有疑問，請聯絡我們：<a href="mailto:${supportEmail}" style="color: ${COLORS.primary}; text-decoration: none;">${supportEmail}</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function createTwoFactorEmailTemplate(
  props: EmailTemplateProps & {
    code: string;
    expiryMinutes?: number;
  }
) {
  const { companyName, supportEmail, year, code, expiryMinutes = 10 } = props;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${companyName}驗證碼</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
        <div style="${STYLES.container}">
          <!-- Header -->
          <div style="${STYLES.header}">
            <h1 style="margin: 0; font-size: 28px;">驗證碼</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">${companyName}</p>
          </div>

          <!-- Body -->
          <div style="${STYLES.body}">
            <p>您的雙因素驗證碼如下：</p>

            <div style="text-align: center; margin: 30px 0;">
              <div style="
                font-size: 48px;
                font-weight: bold;
                color: ${COLORS.primary};
                letter-spacing: 8px;
                background-color: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
              ">
                ${code.split('').join(' ')}
              </div>
            </div>

            <p style="color: ${COLORS.gray}; text-align: center; font-size: 14px;">
              ⏱️ 此驗證碼將在 <strong>${expiryMinutes} 分鐘</strong> 後失效
            </p>

            <div style="background-color: #dbeafe; border-left: 4px solid ${COLORS.primary}; padding: 12px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>ℹ️ 注意：</strong> 永遠不要與任何人分享此驗證碼，${companyName}員工不會要求您提供此代碼。
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="${STYLES.footer}">
            <p>© ${year} ${companyName}。保留所有權利。</p>
            <p>如有疑問，請聯絡我們：<a href="mailto:${supportEmail}" style="color: ${COLORS.primary}; text-decoration: none;">${supportEmail}</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function createWelcomeEmailTemplate(
  props: EmailTemplateProps & {
    userName?: string;
    dashboardLink: string;
  }
) {
  const { companyName, supportEmail, year, userName, dashboardLink } = props;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>歡迎加入${companyName}</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
        <div style="${STYLES.container}">
          <!-- Header -->
          <div style="${STYLES.header}">
            <h1 style="margin: 0; font-size: 28px;">歡迎！🎉</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">${companyName}</p>
          </div>

          <!-- Body -->
          <div style="${STYLES.body}">
            <p>親愛的 ${userName || '用戶'}，</p>

            <p>非常歡迎您加入${companyName}！我們很高興能為您服務。</p>

            <p>作為新會員，您現在可以：</p>
            <ul style="color: ${COLORS.darkGray}; line-height: 2;">
              <li>瀏覽和購買優質商品</li>
              <li>獲得會員獨家優惠</li>
              <li>追蹤您的訂單</li>
              <li>累積積分和回扣</li>
            </ul>

            <div style="text-align: center;">
              <a href="${dashboardLink}" style="${STYLES.button}">
                進入儀表板
              </a>
            </div>

            <p style="color: ${COLORS.gray}; font-size: 14px;">
              如果您有任何疑問或需要幫助，請不要猶豫，聯絡我們的客戶支持團隊。
            </p>
          </div>

          <!-- Footer -->
          <div style="${STYLES.footer}">
            <p>© ${year} ${companyName}。保留所有權利。</p>
            <p>如有疑問，請聯絡我們：<a href="mailto:${supportEmail}" style="color: ${COLORS.primary}; text-decoration: none;">${supportEmail}</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}


export function createNotificationEmailTemplate(params: {
  companyName: string;
  supportEmail: string;
  year: number;
  userName?: string;
  notificationTitle: string;
  notificationMessage: string;
  notificationType: string;
  notificationDate: string;
  actionUrl?: string;
  actionText?: string;
}) {
  const {
    companyName,
    supportEmail,
    year,
    userName,
    notificationTitle,
    notificationMessage,
    notificationType,
    notificationDate,
    actionUrl,
    actionText = '查看詳情'
  } = params;

  // 根據通知類型設置顏色
  let typeColor = COLORS.primary;
  let typeText = notificationType;
  
  switch (notificationType.toLowerCase()) {
    case 'system_announcement':
    case 'system':
      typeColor = COLORS.primary;
      typeText = '系統公告';
      break;
    case 'order_status':
    case 'order':
      typeColor = COLORS.success;
      typeText = '訂單狀態';
      break;
    case 'payment_reminder':
    case 'payment':
      typeColor = COLORS.warning;
      typeText = '付款提醒';
      break;
    case 'security_alert':
    case 'security':
      typeColor = COLORS.error;
      typeText = '安全提醒';
      break;
    default:
      typeColor = COLORS.gray;
  }

  return `
    <!DOCTYPE html>
    <html lang="zh-TW">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notificationTitle} - ${companyName}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="${STYLES.container}">
          <!-- Header -->
          <div style="${STYLES.header}">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">${companyName}</h1>
            <p style="margin: 10px 0 0; opacity: 0.9; font-size: 14px;">專業的醫療機構團購平台</p>
          </div>

          <!-- Body -->
          <div style="${STYLES.body}">
            \${userName ? \`<p style="margin: 0 0 20px; font-size: 16px;">親愛的 \${userName}，</p>\` : ''}
            
            <div style="margin-bottom: 25px; padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid \${typeColor};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2 style="margin: 0; font-size: 20px; color: \${COLORS.darkGray};">\${notificationTitle}</h2>
                <span style="background-color: \${typeColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                  \${typeText}
                </span>
              </div>
              
              <div style="color: \${COLORS.darkGray}; line-height: 1.6; margin-bottom: 15px;">
                \${notificationMessage.split('\\n').map(line => \`<p style="margin: 0 0 10px;">\${line}</p>\`).join('')}
              </div>
              
              <div style="color: \${COLORS.gray}; font-size: 14px; border-top: 1px solid \${COLORS.lightGray}; padding-top: 15px;">
                <p style="margin: 0;">通知時間：\${notificationDate}</p>
              </div>
            </div>

            \${actionUrl ? \`
            <div style="text-align: center; margin: 30px 0;">
              <a href="\${actionUrl}" style="\${STYLES.button}">
                \${actionText}
              </a>
            </div>
            \` : ''}

            <p style="color: \${COLORS.gray}; font-size: 14px; margin-top: 25px;">
              此為系統自動發送的通知郵件，請勿直接回覆。<br>
              如果您認為此通知有誤或需要幫助，請聯絡我們的客戶支持團隊。
            </p>
          </div>

          <!-- Footer -->
          <div style="\${STYLES.footer}">
            <p>© \${year} \${companyName}。保留所有權利。</p>
            <p>如有疑問，請聯絡我們：<a href="mailto:\${supportEmail}" style="color: \${COLORS.primary}; text-decoration: none;">\${supportEmail}</a></p>
            <p style="margin-top: 10px; font-size: 11px; color: \${COLORS.gray};">
              您可以隨時在<a href="\${process.env.NEXTAUTH_URL || 'https://ceo-buy.com'}/settings/notifications" style="color: \${COLORS.primary}; text-decoration: none;">通知設定</a>中管理您的通知偏好。
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
