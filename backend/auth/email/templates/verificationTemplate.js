// Template for verification email
const { title, subtitle, button, fallbackLink } = require("./components");
const { palette } = require("../theme");

exports.verificationEmailContent = ({ name, verificationUrl, expirationHours }) => `
  <p style="margin:0 0 8px;color:${palette.muted};letter-spacing:0.3em;text-transform:uppercase;font-size:12px;">
    Verify & Access
  </p>

  ${title(`Welcome to the fastest briefing room, ${name}`)}

  ${subtitle("Confirm your email to unlock AI summaries, personalised translation, and text-to-speech.")}

  ${button("Verify my NewsXpress email", verificationUrl)}

  <div style="text-align:center;font-size:12px;letter-spacing:0.25em;color:${palette.muted};text-transform:uppercase;">
    Link expires in ${expirationHours} hours
  </div>

  ${fallbackLink(verificationUrl)}
`;
