const nodemailer = require('nodemailer');

function isTruthy(value) {
  return String(value || '').toLowerCase() === 'true';
}

function formatMoney(value) {
  return `R${Number(value || 0).toFixed(2)}`;
}

function formatDateTime(value) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleString('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function smtpConfig() {
  const port = Number(process.env.SMTP_PORT || 587);

  return {
    host: process.env.SMTP_HOST,
    port,
    secure: isTruthy(process.env.SMTP_SECURE) || port === 465,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || process.env.SMTP_USER || 'CineBook <no-reply@cinebook.local>'
  };
}

function hasSmtpConfig(config) {
  return Boolean(config.host && config.user && config.pass);
}

function createTransporter(config) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 20000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 20000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 30000),
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
}

function classifySmtpError(error) {
  const message = error?.message || 'Unknown SMTP error.';
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('unauthorized ip address')) {
    return {
      mode: 'blocked_ip',
      userMessage: 'Brevo blocked this machine IP address. Authorize the IP in Brevo or disable IP restrictions.'
    };
  }

  if (lowerMessage.includes('greeting never received')) {
    return {
      mode: 'smtp_greeting_timeout',
      userMessage: 'Connected to the SMTP host, but the server greeting timed out. Try Brevo port 2525 or 465.'
    };
  }

  if (error?.code === 'EAUTH') {
    return {
      mode: 'auth_failed',
      userMessage: 'SMTP authentication failed. Check the SMTP username and key.'
    };
  }

  if (error?.code === 'ECONNECTION' || error?.code === 'ETIMEDOUT') {
    return {
      mode: 'connection_failed',
      userMessage: 'Could not connect to the SMTP server. Check network/firewall and SMTP port.'
    };
  }

  return {
    mode: 'smtp_error',
    userMessage: 'SMTP rejected the ticket email.'
  };
}

function ticketText(ticket) {
  return [
    'CineBook ticket confirmed',
    '',
    `Hi ${ticket.First_Name},`,
    '',
    'Your payment was successful and your ticket is confirmed.',
    '',
    `Booking reference: CB-TICKET-${ticket.Booking_Id}`,
    `Transaction reference: ${ticket.Transaction_Reference}`,
    `Movie: ${ticket.Movie_Title}`,
    `Theatre: ${ticket.Theatre_Name}, ${ticket.Theatre_City}`,
    `Screen: ${ticket.Screen_Name}`,
    `Show time: ${formatDateTime(ticket.Show_DateTime)}`,
    `Seats: ${ticket.Seats || 'Not listed'}`,
    `Amount paid: ${formatMoney(ticket.Amount)}`,
    `Payment method: ${ticket.Payment_Method}`,
    '',
    'Please show this email at the cinema entrance.',
    '',
    'CineBook'
  ].join('\n');
}

function ticketHtml(ticket) {
  const rows = [
    ['Booking reference', `CB-TICKET-${ticket.Booking_Id}`],
    ['Transaction reference', ticket.Transaction_Reference],
    ['Movie', ticket.Movie_Title],
    ['Theatre', `${ticket.Theatre_Name}, ${ticket.Theatre_City}`],
    ['Screen', ticket.Screen_Name],
    ['Show time', formatDateTime(ticket.Show_DateTime)],
    ['Seats', ticket.Seats || 'Not listed'],
    ['Amount paid', formatMoney(ticket.Amount)],
    ['Payment method', ticket.Payment_Method]
  ];

  return `
    <div style="font-family:Arial,sans-serif;background:#080810;color:#f1f1f1;padding:24px">
      <div style="max-width:620px;margin:0 auto;background:#0f0f1a;border:1px solid #1e1e30;border-radius:12px;padding:24px">
        <p style="color:#f5c842;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px">CineBook</p>
        <h1 style="margin:0 0 12px;font-size:30px">Ticket confirmed</h1>
        <p style="color:#b8b8c8">Hi ${ticket.First_Name}, your payment was successful. Your ticket details are below.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:18px">
          ${rows.map(([label, value]) => `
            <tr>
              <td style="border-top:1px solid #1e1e30;padding:12px;color:#9898a8;width:42%">${label}</td>
              <td style="border-top:1px solid #1e1e30;padding:12px;color:#ffffff;font-weight:700">${value || 'Not set'}</td>
            </tr>
          `).join('')}
        </table>
        <p style="margin-top:20px;color:#b8b8c8">Please show this email at the cinema entrance.</p>
      </div>
    </div>
  `;
}

async function sendMail({ to, subject, text, html, previewLabel }) {
  const config = smtpConfig();
  if (!isTruthy(process.env.EMAIL_ENABLED) || !hasSmtpConfig(config)) {
    console.log(`[EMAIL PREVIEW] ${previewLabel || subject}\nTo: ${to}\n${text}`);
    return { mode: 'preview', sent: false };
  }

  const transporter = createTransporter(config);
  try {
    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text,
      html
    });

    return { mode: 'smtp', sent: true, messageId: info.messageId };
  } catch (error) {
    const details = classifySmtpError(error);
    console.error('[EMAIL] Send error:', error.message);
    return { ...details, sent: false };
  }
}

async function sendTicketEmail(ticket) {
  const subject = `CineBook ticket confirmed - ${ticket.Movie_Title}`;
  return sendMail({
    to: ticket.Email,
    subject,
    text: ticketText(ticket),
    html: ticketHtml(ticket),
    previewLabel: subject
  });
}

function welcomeText(user) {
  return [
    'Welcome to CineBook',
    '',
    `Hi ${user.First_Name},`,
    '',
    'Your CineBook account has been created successfully.',
    '',
    'You can now browse movies, book seats, pay online, and view your tickets in your profile.',
    '',
    `Account email: ${user.Email}`,
    `Loyalty status: ${user.Loyalty_Status || 'Standard'}`,
    '',
    'CineBook'
  ].join('\n');
}

function welcomeHtml(user) {
  return `
    <div style="font-family:Arial,sans-serif;background:#080810;color:#f1f1f1;padding:24px">
      <div style="max-width:620px;margin:0 auto;background:#0f0f1a;border:1px solid #1e1e30;border-radius:12px;padding:24px">
        <p style="color:#f5c842;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px">CineBook</p>
        <h1 style="margin:0 0 12px;font-size:30px">Welcome, ${user.First_Name}</h1>
        <p style="color:#b8b8c8">Your CineBook account has been created successfully.</p>
        <div style="margin-top:18px;border-top:1px solid #1e1e30;padding-top:18px">
          <p style="margin:0 0 8px"><strong>Email:</strong> ${user.Email}</p>
          <p style="margin:0"><strong>Loyalty status:</strong> ${user.Loyalty_Status || 'Standard'}</p>
        </div>
        <p style="margin-top:20px;color:#b8b8c8">You can now browse movies, book seats, pay online, and view your tickets in your profile.</p>
      </div>
    </div>
  `;
}

async function sendWelcomeEmail(user) {
  const subject = 'Welcome to CineBook';
  return sendMail({
    to: user.Email,
    subject,
    text: welcomeText(user),
    html: welcomeHtml(user),
    previewLabel: subject
  });
}

module.exports = {
  sendTicketEmail,
  sendWelcomeEmail
};
