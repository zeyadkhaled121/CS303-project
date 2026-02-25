export function generateVerificationOtpEmailTemplate(otpCode) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #111111; font-family: 'Segoe UI', Inter, Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">

  <!-- Outer wrapper table for full-width background -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #111111;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">

          <tr>
            <td align="center" style="padding: 32px 24px 24px 24px; border-bottom: 1px solid #2a2a2a;">
              <!-- Logo placeholder — replace src with your hosted logo -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle" style="padding-right: 10px;">
                    <div style="width: 40px; height: 40px; background-color: #c9a84c; border-radius: 8px; text-align: center; line-height: 40px; font-size: 20px; font-weight: 700; color: #1a1a1a;">E</div>
                  </td>
                  <td align="center" valign="middle">
                    <span style="font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">E-Library</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 40px 32px 16px 32px;">

              <div style="width: 64px; height: 64px; border-radius: 50%; background-color: rgba(201,168,76,0.12); border: 2px solid #c9a84c; text-align: center; line-height: 64px; font-size: 28px; margin: 0 auto 20px auto;">&#128274;</div>
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.3;">Verify Your Email Address</h1>
              <p style="margin: 0; font-size: 15px; color: #999999; line-height: 1.6;">We received a request to verify your identity. Use the code below to complete the process.</p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 24px 32px 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #222222; border: 2px solid #c9a84c; border-radius: 10px; padding: 20px 40px;">
                    <span style="font-size: 36px; font-weight: 800; color: #c9a84c; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; display: inline-block;">${otpCode}</span>
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0 0; font-size: 13px; color: #777777; line-height: 1.5;">This code expires in <strong style="color: #cccccc;">15 minutes</strong></p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px;">
              <div style="height: 1px; background-color: #2a2a2a;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1e1e1e; border-radius: 8px; border: 1px solid #2a2a2a;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" style="padding-right: 12px;">
                          <span style="font-size: 18px;">&#128737;</span>
                        </td>
                        <td>
                          <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #ffffff;">Security Notice</p>
                          <p style="margin: 0; font-size: 13px; color: #999999; line-height: 1.6;">Never share this code with anyone. Our team will never ask you for your verification code. If you didn't request this email, you can safely ignore it — your account is secure.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px;">
              <div style="height: 1px; background-color: #2a2a2a;"></div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 28px 32px 20px 32px;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #777777; line-height: 1.5;">Thank you for choosing <strong style="color: #c9a84c;">E-Library</strong></p>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #555555; line-height: 1.5;">This is an automated message — please do not reply directly.</p>
              <p style="margin: 12px 0 0 0; font-size: 11px; color: #444444;">&copy; ${new Date().getFullYear()} E-Library. All rights reserved.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
