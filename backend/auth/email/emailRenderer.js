// Renders the complete email HTML by wrapping the provided content in a base template
const { baseTemplate } = require("./templates/baseTemplate");

exports.renderEmail = (contentHtml) => baseTemplate(contentHtml);
