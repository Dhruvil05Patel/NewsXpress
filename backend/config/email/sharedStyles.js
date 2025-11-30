// sharedStyles.js

const colors = {
  brand: "#d70000",       // NewsXpress red
  brandDark: "#b00000",
  text: "#222",
  lightText: "#555",
  muted: "#888",
  bg: "#f4f5f7",
  card: "#ffffff",
  border: "#e3e6eb",
  softBg: "#f9fafc",
  alertBg: "#fff5f5",
};

const base = {
  body: `
    margin:0;
    padding:30px;
    font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background:${colors.bg};
    color:${colors.text};
  `,
  card: `
    max-width:650px;
    margin:auto;
    background:${colors.card};
    padding:30px;
    border-radius:14px;
    border:1px solid ${colors.border};
    box-shadow:0 4px 12px rgba(0,0,0,0.06);
  `,
  headerLogo: `
    font-size:32px;
    font-weight:800;
    text-align:center;
    margin-bottom:6px;
    letter-spacing:0.5px;
    color:${colors.brand};
  `,
  headerSubtitle: `
    text-align:center;
    font-size:14px;
    color:${colors.muted};
    margin-bottom:18px;
  `,
  divider: `
    width:80px;
    height:3px;
    border-radius:10px;
    background:${colors.brand};
    margin:14px auto;
  `,
  section: `
    margin:22px 0;
  `,
  text: `
    font-size:15px;
    line-height:1.7;
    color:${colors.lightText};
  `,
  box: `
    padding:18px;
    border-radius:10px;
    border:1px solid ${colors.border};
    background:${colors.softBg};
  `,
  alertBox: `
    padding:16px;
    border-left:4px solid ${colors.brand};
    background:${colors.alertBg};
    border-radius:6px;
    font-size:15px;
  `,
  footer: `
    text-align:center;
    font-size:12px;
    color:${colors.muted};
    margin-top:30px;
  `
};

module.exports = { colors, styles: base };
