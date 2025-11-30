// Template for verification email
const { colors } = require("../../../config/email/sharedStyles");
const { sectionLabel, title, subtitle, button, fallbackLink, note } = require("../../../config/email/components");

exports.verificationEmailContent = ({
  name = "Explorer",
  verificationUrl,
  expirationHours = 24,
}) => `
  <!-- Section Label -->
  ${sectionLabel("Verify Email")}

  <!-- Title -->
  ${title(`Welcome to the fastest briefing room, ${name}`)}

  <!-- Subtitle -->
  ${subtitle(`
    You're just one step away from unlocking personalised AI summaries,
    multilingual translations, and seamless text-to-speech.
  `)}

  <!-- CTA Button -->
  ${button("Verify my NewsXpress email", verificationUrl)}

  <!-- Expiry Note -->
  <div style="
    margin-top: 14px;
    text-align: center;
    font-size: 12px;
    letter-spacing: 0.25em;
    color: ${colors.muted};
    text-transform: uppercase;
  ">
    Link expires in ${expirationHours} hours
  </div>

  <!-- Fallback Link -->
  ${fallbackLink(verificationUrl)}

  <!-- Final Note -->
  ${note(`
    Didn't create this account?  
    You can safely ignore this email.
  `)}
`;
