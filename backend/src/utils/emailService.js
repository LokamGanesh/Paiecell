import nodemailer from 'nodemailer';

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

export const sendEmail = async (to, subject, html) => {
  try {
    const emailTransporter = initializeTransporter();
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
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
    
    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    for (const recipient of recipients) {
      try {
        const mailOptions = {
          from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
          to: recipient.email,
          subject,
          html: html.replace(/\[USER_NAME\]/g, recipient.name || 'User')
        };

        await emailTransporter.sendMail(mailOptions);
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: recipient.email,
          error: error.message
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Bulk email error:', error);
    throw new Error(`Bulk email failed: ${error.message}`);
  }
};

export const getReminderEmailTemplate = (reminderType, details) => {
  const templates = {
    event: `
      <h2>Event Reminder</h2>
      <p>Hi [USER_NAME],</p>
      <p>This is a reminder about the upcoming event: <strong>${details.title}</strong></p>
      <p><strong>Date:</strong> ${new Date(details.date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${details.time || 'TBD'}</p>
      <p><strong>Venue:</strong> ${details.venue || 'TBD'}</p>
      <p>We look forward to seeing you there!</p>
      <p>Best regards,<br/>PAIE Cell</p>
    `,
    course: `
      <h2>Course Reminder</h2>
      <p>Hi [USER_NAME],</p>
      <p>This is a reminder about the course: <strong>${details.title}</strong></p>
      <p><strong>Duration:</strong> ${details.duration || 'TBD'}</p>
      <p><strong>Level:</strong> ${details.level || 'TBD'}</p>
      <p>Don't miss out on this learning opportunity!</p>
      <p>Best regards,<br/>PAIE Cell</p>
    `,
    general: `
      <h2>Important Reminder</h2>
      <p>Hi [USER_NAME],</p>
      <p>${details.message}</p>
      <p>Best regards,<br/>PAIE Cell</p>
    `
  };

  return templates[reminderType] || templates.general;
};
