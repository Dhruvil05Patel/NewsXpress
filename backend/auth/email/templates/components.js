// For resuable HTML components in email templates
const { palette } = require("../theme");

exports.title = (text) => `
<h1 style="
  margin:0 0 18px;
  font-size:32px;
  line-height:1.2;
  font-weight:700;
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 0 4px 18px rgba(148,163,184,0.28);
  color: ${palette.text}
">${text}</h1>
`;

exports.subtitle = (text) => `
<p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:${palette.muted};">${text}</p>
`;

exports.button = (label, href) => `
<div style="text-align:center;margin:32px 0;">
  <a href="${href}" target="_blank" rel="noopener"
    style="
      background:${palette.accent};
      color:#fff;
      font-weight:600;
      text-decoration:none;
      padding:16px 40px;
      border-radius:999px;
      font-size:16px;
      display:inline-block;
      box-shadow:0 12px 35px rgba(249,115,22,0.45);
    ">
    ${label}
  </a>
</div>
`;

exports.fallbackLink = (href) => `
<div style="margin-top:26px;padding:18px 20px;background:rgba(7,16,35,0.95);border-radius:18px;border:1px solid rgba(148,163,184,0.25);">
  <p style="margin:0 0 10px;font-size:14px;color:${palette.muted};">Button not working? Copy this link:</p>
  <a href="${href}"
    style="display:block;font-size:13px;color:${palette.accentAlt};word-break:break-all;text-decoration:none;">
    ${href}
  </a>
</div>
`;
