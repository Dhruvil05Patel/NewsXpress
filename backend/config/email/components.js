// For reusable HTML components in email templates
const { colors, styles } = require("./sharedStyles");

exports.sectionLabel = (text) => `
<p style="
  margin: 0 0 10px;
  color: ${colors.brand};
  letter-spacing: 0.28em;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
">
  ${text}
</p>
`;

exports.title = (text) => `
<h1 style="
  font-size: 26px;
  font-weight: 700;
  margin: 18px 0 14px;
  color: ${colors.text};
  line-height: 1.4;
">
  ${text}
</h1>
`;

exports.subtitle = (text) => `
<p style="
  ${styles.text}
  margin: 14px 0 24px;
  text-align: left;
">
  ${text}
</p>
`;

exports.button = (label, href) => `
<div style="text-align: center; margin: 28px 0;">
  <a href="${href}" style="
    display: inline-block;
    background: ${colors.brand};
    color: #ffffff;
    text-decoration: none;
    padding: 14px 32px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
    letter-spacing: 0.3px;
    transition: background 0.2s;
  ">
    ${label}
  </a>
</div>
`;

exports.fallbackLink = (href) => `
<div style="
  ${styles.box}
  margin-top: 24px;
  word-break: break-all;
">
  <p style="margin: 0 0 8px; font-size: 13px; color: ${colors.lightText};">
    Button not working? Copy and paste this link:
  </p>
  <a href="${href}" style="
    font-size: 13px;
    color: ${colors.brand};
    text-decoration: none;
  ">
    ${href}
  </a>
</div>
`;

exports.note = (text) => `
<p style="
  margin-top: 26px;
  font-size: 13px;
  color: ${colors.muted};
  line-height: 1.7;
">
  ${text}
</p>
`;
