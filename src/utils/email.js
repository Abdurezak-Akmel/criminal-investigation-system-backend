import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER;
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const apiBaseUrl = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:3000';

async function sendMail({ to, subject, html }) {
  if (!to) {
    throw new Error('Recipient email is required');
  }

  return transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  });
}

// Verification Email to be sent for a new user upon registration
async function sendVerificationEmail(email, token) {
  const verificationLink = `${apiBaseUrl}/api/auth/verify-email?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(token)}`;

  return sendMail({
    to: email,
    subject: 'Verify your account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Welcome</h2>
        <p>Thanks for creating an account. Please verify your email address by clicking the button below.</p>
        <p><a href="${verificationLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Verify Account</a></p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p>${verificationLink}</p>
      </div>
    `,
  });
}

async function sendResetPasswordEmail(email, token) {
  const resetLink = `${baseUrl}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

  return sendMail({
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Use the link below to continue.</p>
        <p><a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p>${resetLink}</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(email, token) {
  return sendResetPasswordEmail(email, token);
}

async function sendAdminRegistrationEmail(email, token) {
  const registrationLink = `${baseUrl}/admin/register?token=${encodeURIComponent(token)}`;

  return sendMail({
    to: email,
    subject: 'Admin registration invitation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Admin Registration Invitation</h2>
        <p>You have been invited to join as an administrator. Use the link below to continue.</p>
        <p><a href="${registrationLink}" style="display:inline-block;padding:12px 20px;background:#059669;color:#fff;text-decoration:none;border-radius:6px;">Complete Admin Registration</a></p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p>${registrationLink}</p>
      </div>
    `,
  });
}

export {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendPasswordResetEmail,
  sendAdminRegistrationEmail,
};

export default {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendPasswordResetEmail,
  sendAdminRegistrationEmail,
};
