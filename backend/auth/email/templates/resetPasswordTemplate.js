// Template for reset password email
const { title, subtitle, button, fallbackLink } = require("./components");
const { palette } = require("../theme");

exports.resetPasswordContent = ({ name, resetUrl }) => `
  <p style="margin:0 0 8px;color:${palette.muted};letter-spacing:0.3em;text-transform:uppercase;font-size:12px;">
    Reset Password
  </p>

  ${title(`Reset your password, ${name}`)}

  ${subtitle("We received a request to reset your password. Tap the button below to set a new one.")}

  ${button("Reset my password", resetUrl)}

  ${fallbackLink(resetUrl)}

  <p style="margin-top:24px;font-size:13px;color:${palette.muted};line-height:1.6;">
    Didn’t request this? Ignore this email or contact support.
  </p>
`;
