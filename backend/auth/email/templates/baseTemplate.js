// for base HTML structure of email templates
const { palette } = require("../theme");
const { social } = require("../social");

exports.baseTemplate = (contentHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>NewsXpress</title>
  <style>
    body {
      margin: 0;
      font-family: "Inter", "Space Grotesk", sans-serif;
      background: ${palette.bg};
      color: ${palette.text};
    }
    @media (max-width: 640px) {
      .panel { padding: 24px !important; }
      .cta   { display: block !important; width: 100% !important; text-align:center !important; }
    }
  </style>
</head>

<body style="padding:36px 0;background:${palette.bg};">
  <table width="100%" role="presentation">
    <tr>
      <td align="center">
        <table width="640" style="max-width:640px;">
          
          <!-- Branding -->
          <tr>
            <td style="text-align:center;padding-bottom:20px;">
              <div style="font-size:30px;font-weight:700;letter-spacing:0.12em;color:${palette.text};text-transform:uppercase;">
                News<span style="color:${palette.accent};">X</span>press
              </div>
              <div style="font-size:13px;color:${palette.muted};letter-spacing:0.4em;text-transform:uppercase;">
                Instant • Curated • Multilingual
              </div>
            </td>
          </tr>

          <!-- Gradient frame -->
          <tr>
            <td style="border-radius:28px;padding:2px;background:${palette.gradient};box-shadow:0 25px 60px rgba(15,23,42,0.55);">
              <table width="100%" class="panel"
                style="background:${palette.panel};border-radius:26px;padding:32px;border:1px solid ${palette.border};">

                <tr><td>${contentHtml}</td></tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center;padding-top:28px;color:${palette.muted};font-size:12px;">
              <div style="margin-bottom:8px;">Connect with us</div>
              <div>
                ${social
                  .map(
                    (entry) => `
                      <a href="${entry.href}"
                        style="color:${palette.accentAlt};text-decoration:none;margin:0 10px;font-weight:600;">
                        ${entry.label}
                      </a>
                    `
                  )
                  .join("")}
              </div>
              <div style="margin-top:16px;">
                © ${new Date().getFullYear()} NewsXpress · Crafted in India
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
