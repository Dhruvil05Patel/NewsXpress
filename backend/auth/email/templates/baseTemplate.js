// Base HTML wrapper for all email templates
const { styles, colors } = require("../../../config/email/sharedStyles");
const { social } = require("../social");

exports.baseTemplate = (contentHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NewsXpress</title>

  <style>
    body {
      ${styles.body}
      background: linear-gradient(135deg, #fff6f7, #ffe9ec);
    }

    /* Core Reset */
    table {
      border-collapse: collapse;
      width: 100%;
    }

    .wrapper {
      max-width: 650px;
      width: 100%;
      margin: auto;
    }

    /* Branding */
    .brand {
      ${styles.headerLogo}
    }

    .tagline {
      ${styles.headerSubtitle}
      letter-spacing: 0.25em;
      text-transform: uppercase;
    }

    .divider {
      ${styles.divider}
    }

    /* Card container */
    .card {
      ${styles.card}
      background: #fff7f8; /* subtle light reddish instead of pure white */
      border: 1px solid ${colors.border};
    }

    /* Footer */
    .footer {
      ${styles.footer}
      background: #fff1f3; /* very light reddish footer */
      border-top: 1px solid ${colors.border};
    }

    .footer-links a {
      color: ${colors.brand};
      text-decoration: none;
      font-weight: 600;
      margin: 0 12px;
    }

    /* Responsive */
    @media (max-width: 640px) {
      body { padding: 20px; }
      .card { padding: 22px !important; }
    }
  </style>
</head>


<body>
  <table role="presentation">
    <tr>
      <td align="center">
        <table role="presentation" class="wrapper">

          <!-- Branding -->
          <tr>
            <td style="text-align:center; padding-bottom:20px;">
              <div class="brand">NewsXpress</div>
              <div class="tagline">Instant • Curated • Multilingual</div>
              <div class="divider"></div>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <div class="card">
                ${contentHtml}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer">
              <div style="margin-top: 18px; color: ${
                colors.muted
              }; font-size: 12px;">
                Need help? Email us at
                <a href="mailto:news10express@gmail.com" style="color:${
                  colors.brand
                }; text-decoration:none; font-weight:600;">
                  news10express@gmail.com
                </a>
              </div>

              <div style="margin-top: 10px;">
                &copy; ${new Date().getFullYear()} NewsXpress — Crafted in India
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
