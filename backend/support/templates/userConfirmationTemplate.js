const { baseTemplate } = require("../../auth/email/templates/baseTemplate");
const { colors, styles } = require("../../config/email/sharedStyles");
const { sectionLabel, title, subtitle, note } = require("../../config/email/components");

const userConfirmationContent = ({ name, email, message }) => `
  <!-- Section Label -->
  ${sectionLabel("Support Request Received")}

  <!-- Title -->
  ${title(`Hi ${name}, We've Got Your Message!`)}

  <!-- Greeting -->
  ${subtitle(`
    Thanks for reaching out! We've received your support request and our team will get back to you shortly.
  `)}

  <!-- Ticket Summary -->
  <div style="${styles.box}; margin-top:22px;">
    <p style="margin:0 0 12px; font-weight:600; color:${colors.text};">
      📄 Your Message Summary
    </p>
    <p style="${styles.text}; margin:0 0 14px;">
      <strong>Name:</strong> ${name}<br>
      <strong>Email:</strong> ${email}
    </p>
    <div style="
      margin-top:14px;
      padding:14px 16px;
      border-radius:10px;
      background:${colors.softBg};
      border:1px solid ${colors.border};
    ">
      <p style="margin:0 0 8px; font-weight:600; color:${colors.text};">📝 Your Message:</p>
      <p style="${styles.text}; margin:0;">${message}</p>
    </div>
  </div>

  <!-- Info Box -->
  <div style="
    ${styles.alertBox};
    margin-top:26px;
    background:${colors.alertBg};
  ">
    <p style="margin:0; color:${colors.text};">
      ⏳ Our team typically responds within <strong>24–48 hours</strong>.
    </p>
  </div>

  <!-- Footer Note -->
  ${note(`
    If you didn't send this request or need immediate help,<br>
    contact us at <a href="mailto:newsxpress10@gmail.com" style="color:${colors.brand}; text-decoration:none;">newsxpress10@gmail.com</a>.
  `)}
`;

const userConfirmationTemplate = (data) => baseTemplate(userConfirmationContent(data));

module.exports = { userConfirmationTemplate };
