// Template for reset password email
const { colors } = require("../../../config/email/sharedStyles");
const { sectionLabel, title, subtitle, button, fallbackLink } = require("../../../config/email/components");

exports.resetPasswordContent = ({
  name = "User",
  resetUrl
}) => `
  <!-- Section Label -->
  ${sectionLabel("Reset Password")}

  <!-- Title -->
  ${title(`Hi ${name}, let's secure your NewsXpress account`)}

  <!-- Subtitle -->
  ${subtitle(`
    We received a request to reset your password.
    Tap the button below to create a new one and regain access to your account.
  `)}

  <!-- Reset Button -->
  ${button("Reset My Password", resetUrl)}

  <!-- Fallback Link -->
  ${fallbackLink(resetUrl)}

  <!-- Security Notice -->
  <p style="
    margin-top: 26px;
    font-size: 13px;
    color: ${colors.lightText};
    line-height: 1.7;
  ">
    Didn't request this password reset?  
    You can safely ignore this message.  
    If you suspect unauthorized activity, please contact NewsXpress support immediately.
  </p>
`;
