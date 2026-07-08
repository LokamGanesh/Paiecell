import nodemailer from 'nodemailer';

// ─── Brand tokens (mirrored from frontend index.css) ──────────────────────────
const BRAND = {
  primary:       '#19a896',   // hsl(174 72% 40%)
  primaryDark:   '#127a6d',   // darker teal for hover/border
  primaryLight:  '#e6f7f5',   // very light teal for backgrounds
  accent:        '#f0a818',   // hsl(42 85% 52%)
  accentLight:   '#fef6e4',
  bg:            '#f0f7f7',   // hsl(185 30% 96%)
  surface:       '#ffffff',
  headerBg:      '#0d2226',   // hsl(190 45% 10%)
  text:          '#0d2429',   // hsl(190 40% 10%)
  textMuted:     '#5a7a7f',   // hsl(190 15% 42%)
  border:        '#cce0e0',   // hsl(185 20% 87%)
  fontDisplay:   "'Space Grotesk', 'Segoe UI', Arial, sans-serif",
  fontBody:      "'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif",
};

// ─── Shared layout wrapper ─────────────────────────────────────────────────────
const layout = (bodyContent, preheader = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>PAIE Cell</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; background-color: ${BRAND.bg}; }
    a { color: ${BRAND.primary}; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:${BRAND.fontBody};">

  ${preheader ? `<div style="display:none;font-size:1px;color:${BRAND.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>` : ''}

  <!-- Outer wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${BRAND.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;width:100%;background-color:${BRAND.surface};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,173,155,0.10);">

          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND.headerBg};padding:28px 40px;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Logo pill -->
                    <div style="display:inline-block;background:linear-gradient(135deg,${BRAND.primary},${BRAND.accent});border-radius:12px;padding:2px;">
                      <div style="background:${BRAND.headerBg};border-radius:10px;padding:6px 20px;">
                        <span style="font-family:${BRAND.fontDisplay};font-size:22px;font-weight:700;color:${BRAND.primary};letter-spacing:-0.5px;">PAIE</span>
                        <span style="font-family:${BRAND.fontDisplay};font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;"> Cell</span>
                      </div>
                    </div>
                    <!-- Gradient accent line -->
                    <div style="margin-top:16px;height:3px;border-radius:2px;background:linear-gradient(90deg,${BRAND.primary},${BRAND.accent});"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;color:${BRAND.text};font-family:${BRAND.fontBody};font-size:15px;line-height:1.7;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.bg};border-top:1px solid ${BRAND.border};padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-family:${BRAND.fontBody};font-size:13px;color:${BRAND.textMuted};">
                © ${new Date().getFullYear()} PAIE Cell · Empowering youth through holistic education
              </p>
              <p style="margin:0;font-family:${BRAND.fontBody};font-size:12px;color:${BRAND.border};">
                This email was sent by PAIE Cell. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Reusable block helpers ────────────────────────────────────────────────────
const greeting = (name) =>
  `<p style="margin:0 0 16px;font-family:${BRAND.fontDisplay};font-size:22px;font-weight:700;color:${BRAND.text};">Hi ${name || 'there'} 👋</p>`;

const paragraph = (text) =>
  `<p style="margin:0 0 14px;color:${BRAND.text};">${text}</p>`;

const infoRow = (label, value) =>
  `<tr>
    <td style="padding:10px 14px;font-size:13px;color:${BRAND.textMuted};font-weight:600;white-space:nowrap;width:1%;">${label}</td>
    <td style="padding:10px 14px;font-size:14px;color:${BRAND.text};font-weight:500;">${value}</td>
  </tr>`;

const infoTable = (rows) =>
  `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
    style="margin:20px 0;background:${BRAND.primaryLight};border-radius:12px;border:1px solid ${BRAND.border};overflow:hidden;">
    <tbody>${rows}</tbody>
  </table>`;

const primaryButton = (text, href) =>
  `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
    <tr>
      <td style="border-radius:10px;background:linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark});">
        <a href="${href}" target="_blank"
          style="display:inline-block;padding:14px 32px;font-family:${BRAND.fontDisplay};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;

const otpBox = (otp) =>
  `<div style="margin:24px 0;text-align:center;">
    <div style="display:inline-block;background:linear-gradient(135deg,${BRAND.primaryLight},${BRAND.accentLight});border:2px solid ${BRAND.primary};border-radius:16px;padding:20px 40px;">
      <p style="margin:0 0 4px;font-family:${BRAND.fontBody};font-size:12px;font-weight:600;color:${BRAND.textMuted};letter-spacing:2px;text-transform:uppercase;">Your OTP Code</p>
      <p style="margin:0;font-family:${BRAND.fontDisplay};font-size:40px;font-weight:700;color:${BRAND.primary};letter-spacing:12px;">${otp}</p>
    </div>
  </div>`;

const divider = () =>
  `<div style="height:1px;background:${BRAND.border};margin:24px 0;"></div>`;

const badge = (text, color = BRAND.primary) =>
  `<span style="display:inline-block;background:${color}20;color:${color};font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;border:1px solid ${color}40;">${text}</span>`;

const signOff = () =>
  `${divider()}
  <p style="margin:0;color:${BRAND.textMuted};font-size:14px;">
    Warm regards,<br/>
    <strong style="color:${BRAND.text};font-family:${BRAND.fontDisplay};">The PAIE Cell Team</strong>
  </p>`;

// ─── Transporter ───────────────────────────────────────────────────────────────
let transporter;

const initializeTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  return transporter;
};

// ─── Public send helpers ───────────────────────────────────────────────────────
export const sendEmail = async (to, subject, html) => {
  try {
    const emailTransporter = initializeTransporter();
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'PAIE Cell'} <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };
    const info = await emailTransporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export const sendBulkEmails = async (recipients, subject, html) => {
  try {
    const emailTransporter = initializeTransporter();
    const results = { sent: 0, failed: 0, errors: [] };

    for (const recipient of recipients) {
      try {
        const mailOptions = {
          from: `${process.env.EMAIL_FROM_NAME || 'PAIE Cell'} <${process.env.EMAIL_USER}>`,
          to: recipient.email,
          subject,
          html: html.replace(/\[USER_NAME\]/g, recipient.name || 'there')
        };
        await emailTransporter.sendMail(mailOptions);
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({ email: recipient.email, error: error.message });
      }
    }
    return results;
  } catch (error) {
    console.error('Bulk email error:', error);
    throw new Error(`Bulk email failed: ${error.message}`);
  }
};

// ─── Named template builders ───────────────────────────────────────────────────

/** OTP / Forgot-password email */
export const getOTPEmailTemplate = (name, otp) => layout(
  `${greeting(name)}
  ${paragraph('We received a request to reset the password for your PAIE Cell account. Use the one-time code below — it expires in <strong>10 minutes</strong>.')}
  ${otpBox(otp)}
  ${paragraph("If you didn't request a password reset, you can safely ignore this email. Your account remains secure.")}
  ${signOff()}`,
  `Your PAIE Cell password reset OTP is ${otp}`
);

/** Welcome / Registration-complete email */
export const getWelcomeEmailTemplate = (name, transactionId) => layout(
  `${greeting(name)}
  ${paragraph('Your registration with <strong>PAIE Cell</strong> is complete! 🎉 We\'re thrilled to have you on board.')}
  ${transactionId ? infoTable(infoRow('Transaction ID', `<code style="background:${BRAND.primaryLight};padding:2px 6px;border-radius:4px;">${transactionId}</code>`)) : ''}
  ${paragraph('You can now log in to explore upcoming events, courses, and exclusive learning opportunities.')}
  ${primaryButton('Visit PAIE Cell', process.env.FRONTEND_URL || '#')}
  ${paragraph(`If you have any questions, feel free to reach out to us at <a href="mailto:${process.env.EMAIL_USER}" style="color:${BRAND.primary};">${process.env.EMAIL_USER}</a>.`)}
  ${signOff()}`,
  `Welcome to PAIE Cell, ${name}!`
);

/** Event reminder */
export const getEventReminderTemplate = (details) => layout(
  `${greeting('[USER_NAME]')}
  ${paragraph(`This is a friendly reminder about an upcoming event you're registered for.`)}
  ${infoTable(
    infoRow('Event', `<strong>${details.title || 'TBD'}</strong>`) +
    infoRow('Date',  new Date(details.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })) +
    infoRow('Time',  details.time || 'TBD') +
    infoRow('Venue', details.venue || 'TBD') +
    (details.category ? infoRow('Category', badge(details.category)) : '')
  )}
  ${paragraph("We look forward to seeing you there! Please arrive a few minutes early.")}
  ${signOff()}`,
  `Reminder: ${details.title} is coming up!`
);

/** Course reminder */
export const getCourseReminderTemplate = (details) => layout(
  `${greeting('[USER_NAME]')}
  ${paragraph(`Don't miss out! Here's a reminder about the course you're enrolled in.`)}
  ${infoTable(
    infoRow('Course',   `<strong>${details.title || 'TBD'}</strong>`) +
    infoRow('Duration', details.duration ? `${details.duration} ${details.duration === 1 ? 'day' : 'days'}` : 'TBD') +
    infoRow('Level',    details.level || 'All levels') +
    (details.category ? infoRow('Category', badge(details.category, BRAND.accent)) : '')
  )}
  ${paragraph('Make the most of this learning opportunity. See you there!')}
  ${signOff()}`,
  `Reminder: ${details.title}`
);

/** General/custom reminder */
export const getGeneralReminderTemplate = (message) => layout(
  `${greeting('[USER_NAME]')}
  ${message.split('\n').map(line => line.trim() ? paragraph(line) : '').join('')}
  ${signOff()}`,
  'An important update from PAIE Cell'
);

/** Custom bulk email */
export const getCustomEmailTemplate = (message) => layout(
  `${greeting('[USER_NAME]')}
  ${message.split('\n').map(line => line.trim() ? paragraph(line) : '').join('')}
  ${signOff()}`
);

// ─── Reminder dispatcher (used by email.js route) ─────────────────────────────
export const getReminderEmailTemplate = (reminderType, details) => {
  switch (reminderType) {
    case 'event':   return getEventReminderTemplate(details);
    case 'course':  return getCourseReminderTemplate(details);
    default:        return getGeneralReminderTemplate(details.message || '');
  }
};

/** Event registration confirmation */
export const getEventRegistrationConfirmationTemplate = (name, event) => layout(
  `${greeting(name)}
  ${paragraph('You\'re all set! 🎉 Your registration for the following event has been <strong>confirmed</strong>.')}
  ${infoTable(
    infoRow('Event',    `<strong>${event.title || 'TBD'}</strong>`) +
    infoRow('Date',     event.date ? new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD') +
    (event.time  ? infoRow('Time',  event.time)  : '') +
    (event.venue ? infoRow('Venue', event.venue) : '') +
    (event.category ? infoRow('Category', badge(event.category)) : '')
  )}
  ${paragraph('Please arrive a few minutes early. We look forward to seeing you there!')}
  ${primaryButton('View Events', `${process.env.FRONTEND_URL || '#'}/events`)}
  ${paragraph(`Questions? Reach us at <a href="mailto:${process.env.EMAIL_USER}" style="color:${BRAND.primary};">${process.env.EMAIL_USER}</a>.`)}
  ${signOff()}`,
  `You're registered for ${event.title}!`
);

/** Course registration confirmation */
export const getCourseRegistrationConfirmationTemplate = (name, course) => layout(
  `${greeting(name)}
  ${paragraph('Your enrollment has been <strong>confirmed</strong>! 🎉 Here are the details of your course.')}
  ${infoTable(
    infoRow('Course',   `<strong>${course.title || 'TBD'}</strong>`) +
    (course.duration ? infoRow('Duration', `${course.duration} ${course.duration === 1 ? 'day' : 'days'}`) : '') +
    (course.level    ? infoRow('Level',    course.level)    : '') +
    (course.venue    ? infoRow('Venue',    course.venue)    : '') +
    (course.category ? infoRow('Category', badge(course.category, BRAND.accent)) : '')
  )}
  ${paragraph('Make the most of this learning opportunity. We\'re excited to have you!')}
  ${primaryButton('View Courses', `${process.env.FRONTEND_URL || '#'}/courses`)}
  ${paragraph(`Questions? Reach us at <a href="mailto:${process.env.EMAIL_USER}" style="color:${BRAND.primary};">${process.env.EMAIL_USER}</a>.`)}
  ${signOff()}`,
  `You're enrolled in ${course.title}!`
);
