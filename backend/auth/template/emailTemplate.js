const palette = {
  bg: "#050816",
  gradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 55%, #f97316 100%)",
  panel: "rgba(9, 15, 32, 0.92)",
  border: "rgba(99, 102, 241, 0.35)",
  accent: "#f97316",
  accentAlt: "#0ea5e9",
  text: "#f8fafc",
  muted: "rgba(248, 250, 252, 0.75)",
  glass: "rgba(15, 23, 42, 0.72)",
};

const social = [
  { label: "Website", href: "https://newsxpress.com" },
];

exports.getVerificationEmailHtml = ({
  name = "Explorer",
  verificationUrl,
  supportEmail = "newsxpress10@gmail.com",
  expirationHours = 24,
} = {}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Verify your NewsXpress email</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body {
      margin: 0;
      font-family: "Inter", "Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif;
      background: ${palette.bg};
      color: ${palette.text};
    }
    @media (max-width: 640px) {
      .panel { padding: 24px; }
      .cta { display: block; width: 100%; text-align: center; }
    }
  </style>
</head>
<body style="padding:36px 0;background:${palette.bg};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="640" style="max-width:640px;width:100%;" cellspacing="0" cellpadding="0" role="presentation">
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
 
          <tr>
            <td style="border-radius:28px;padding:2px;background:${palette.gradient};box-shadow:0 25px 60px rgba(15,23,42,0.55);">
              <table width="100%" cellspacing="0" cellpadding="0" class="panel" style="background:${palette.panel};border-radius:26px;padding:32px;border:1px solid ${palette.border};">
                <tr>
                  <td>
                    <div style="background:${palette.glass};border-radius:20px;padding:28px;border:1px solid ${palette.border};">
                      <p style="margin:0 0 8px;color:${palette.muted};letter-spacing:0.3em;text-transform:uppercase;font-size:12px;">Verify & Access</p>
                      <h1 style="margin:0 0 18px;font-size:32px;line-height:1.2; color:${palette.text}">Welcome to the fastest briefing room, ${name}</h1>
                      <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:${palette.muted};">
                        Confirm your email to unlock AI summaries, personalised translation, and one-tap text-to-speech that mirrors the NewsXpress experience you saw on the web app.
                      </p>
                      <div style="text-align:center;margin:32px 0;">
                        <a class="cta" href="${verificationUrl}" target="_blank" rel="noopener" style="background:${palette.accent};color:#fff;font-weight:600;text-decoration:none;padding:16px 40px;border-radius:999px;font-size:16px;box-shadow:0 12px 35px rgba(249,115,22,0.45);display:inline-block;">
                          Verify my NewsXpress email
                        </a>
                        <div style="margin-top:12px;font-size:12px;letter-spacing:0.25em;color:${palette.muted};text-transform:uppercase;">
                          Link expires in ${expirationHours} hours
                        </div>
                      </div>
                      <div style="display:flex;gap:16px;flex-wrap:wrap;">
                        ${[
                          { title: "AI Summaries", copy: "Digest breaking stories that match your feed layout." },
                          { title: "Translate & Listen", copy: "Switch languages and trigger TTS exactly like in the app." },
                          { title: "Live Signals", copy: "Stay synced with curated streams from the dashboard." },
                        ]
                          .map(
                            (item) => `
                          <div style="flex:1 1 180px;padding:18px;border-radius:18px;background:rgba(8,21,46,0.9);border:1px solid rgba(148,163,184,0.3);">
                            <div style="font-size:13px;letter-spacing:0.2em;color:${palette.accentAlt};text-transform:uppercase;">${item.title}</div>
                            <p style="margin:10px 0 0;font-size:14px;line-height:1.5;color:${palette.muted};">${item.copy}</p>
                          </div>`
                          )
                          .join("")}
                      </div>
                    </div>

                    <div style="margin-top:26px;padding:18px 20px;background:rgba(7,16,35,0.9);border-radius:18px;border:1px solid rgba(148,163,184,0.25);">
                      <p style="margin:0 0 10px;font-size:14px;color:${palette.muted};">Button not working? Copy this link:</p>
                      <a href="${verificationUrl}" style="display:block;font-size:13px;color:${palette.accentAlt};word-break:break-all;text-decoration:none;">${verificationUrl}</a>
                    </div>

                    <div style="margin-top:24px;font-size:13px;color:${palette.muted};line-height:1.6;">
                      Didn’t request NewsXpress? Ignore this email or contact us at
                      <a href="mailto:${supportEmail}" style="color:${palette.accentAlt};text-decoration:none;font-weight:600;">${supportEmail}</a>.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="text-align:center;padding-top:28px;color:${palette.muted};font-size:12px;">
              <div style="margin-bottom:8px;">Connect with us</div>
              <div>
                ${social
                  .map(
                    (entry) => `<a href="${entry.href}" style="color:${palette.accentAlt};text-decoration:none;margin:0 10px;font-weight:600;">${entry.label}</a>`
                  )
                  .join("")}
              </div>
              <div style="margin-top:16px;">© ${new Date().getFullYear()} NewsXpress · Crafted in India · Inspired by your dashboard</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
