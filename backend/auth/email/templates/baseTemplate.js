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
    }

    /* Footer */
    .footer {
      ${styles.footer}
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
              <div style="margin-bottom: 10px;">Connect with us</div>

              <div class="footer-links">
                ${social
                  .map(
                    (entry) =>
                      `<a href="${entry.href}" target="_blank">${entry.label}</a>`
                  )
                  .join("")}
              </div>

              <div style="margin-top: 18px;">
                © ${new Date().getFullYear()} NewsXpress — Crafted in India
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