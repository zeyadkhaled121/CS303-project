import { generateVerificationOtpEmailTemplate } from "./emailTemplates.js";
import { sendEmail } from "./sendEmail.js";


export async function sendVerificationCode(verificationCode, email, res) {
  const message = generateVerificationOtpEmailTemplate(verificationCode);
  await sendEmail({
    email,
    subject: "Verification Code (E-Library Management System)",
    message,
  });
  res.status(200).json({
    success: true,
    message: "Verification code sent successfully.",
    data: { email },
    error: null,
  });
}
