export function generateVerificationOtpEmailTemplate(otpCode){
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #000; color: #fff;">
    <h2 style="color: #fff; text-align: center;">Verify Your Email Address</h2>
    <p style="font-size: 16px; color: #ccc;">Dear User,</p>
    <p style="font-size: 16px; color: #ccc;">To complete your registration or login, please use the following verification code:</p>
    <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #000; padding: 10px 20px; border: 1px solid #fff; border-radius: 5px; background-color: #fff;">
            ${otpCode}
        </span>
    </div>
    <p style="font-size: 16px; color: #ccc;">This code is valid for 15 minutes. Please do not share this code with anyone.</p>
    <p style="font-size: 16px; color: #ccc;">If you did not request this email, please ignore it.</p>
    <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
        <p>Thank you,<br>SCI-Library Team</p>
        <p style="font-size: 12px; color: #444;">This is an automated message. Please do not reply to this email.</p>
    </footer>
</div>`;
}

export function generateOverdueWarningEmailTemplate(bookTitle, dueDate) {
    return `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #0d0d0d; color: #e5e5e5; border: 1px solid #333; box-shadow: 0 0 20px rgba(225, 29, 72, 0.15);">
    <div style="background-color: #7f1d1d; border-bottom: 2px solid #ef4444; padding: 25px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 3px; font-family: 'Times New Roman', Times, serif; text-transform: uppercase;">
            OFFICIAL NOTICE OF DEFAULT
        </h1>
        <p style="color: #fca5a5; margin: 5px 0 0 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">
            Division of Compliance and Asset Recovery
        </p>
    </div>
    <div style="padding: 40px 30px;">
        <p style="font-size: 16px; color: #f3f4f6; margin-bottom: 20px; text-transform: uppercase; font-weight: 600;">
            Attn: Patron of Record
        </p>
        <p style="font-size: 15px; line-height: 1.6; border-left: 3px solid #7f1d1d; padding-left: 15px; margin-bottom: 30px;">
            This communication serves as a formal notification that you are currently in direct violation of the <strong>Library Code of Conduct</strong> and <strong>Asset Borrowing Agreement</strong>. 
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
            The following classified material was not remitted by the legally binding deadline:
        </p>
        <div style="background-color: #171717; border: 1px solid #3f3f46; border-left: 5px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">Asset Title</p>
            <h3 style="margin: 0 0 15px 0; color: #ffffff; font-size: 20px; font-family: 'Times New Roman', Times, serif;">${bookTitle}</h3>
            <p style="margin: 0; font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">Mandated Return Date</p>
            <p style="margin: 5px 0 0 0; color: #ef4444; font-size: 18px; font-weight: bold; font-family: monospace;">${new Date(dueDate).toLocaleString()}</p>
        </div>
        <div style="margin-top: 35px;">
            <h4 style="color: #ef4444; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #3f3f46; padding-bottom: 5px;">Immediate Action Required</h4>
            <p style="font-size: 14px; line-height: 1.6; color: #d1d5db;">
                Failure to surrender this material immediately will result in the escalation of this matter. Consequences may include, but are not limited to:
            </p>
            <ul style="font-size: 14px; color: #d1d5db; line-height: 1.8; margin-bottom: 30px;">
                <li>Permanent revocation of all library privileges and facility access.</li>
                <li>Accrual of severe financial penalties compounding daily.</li>
                <li>Submission of your profile to Academic/Legal collections divisions.</li>
            </ul>
            <p style="font-size: 15px; font-weight: bold; color: #fca5a5; background-color: #450a0a; padding: 15px; border-left: 4px solid #ef4444; margin-bottom: 0;">
                RETURN THE ASSET IMMEDIATELY. NO FURTHER WARNINGS WILL BE ISSUED.
            </p>
        </div>
    </div>
    <div style="background-color: #010101; padding: 25px 20px; border-top: 1px solid #27272a; text-align: center;">
        <p style="margin: 0; color: #71717a; font-size: 13px; font-family: 'Times New Roman', serif; text-transform: uppercase; letter-spacing: 1px;">
            <strong>SCI-LIBRARY ARCHIVES & ADMINISTRATION</strong><br>
            <span style="font-size: 10px; color: #52525b; margin-top: 5px; display: inline-block;">Office of Internal Audits & Compliance</span>
        </p>
        <p style="margin: 20px 0 0 0; color: #3f3f46; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
            [AUTOMATED TRACKING SYSTEM // SECURE TRANSMISSION]
        </p>
    </div>
</div>`;
}

export function generateFineWarningEmailTemplate(amount, totalFines) {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #ef4444; text-align: center;">Fine Assessed on Your Account</h2>
    <p>A fine of <strong>${amount} EGP</strong> has been added to your account for overdue items.</p>
    <p>Your total outstanding fines are now <strong>${totalFines} EGP</strong>.</p>
    <p>Please pay your fines to restore full borrowing privileges.</p>
</div>`;
}

export function generateBanNoticeEmailTemplate() {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #ef4444; text-align: center;">Account Temporarily Banned</h2>
    <p>Due to repeated violations or excessive unpaid fines, your account has been placed on hold.</p>
    <p>You may not borrow any new items until your account is reinstated by an administrator.</p>
    <p>Please contact support or pay any outstanding fines immediately.</p>
</div>`;
}