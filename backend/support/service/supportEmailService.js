const {brevo, sender, replyTo} = require("../../config/email/email");
const {adminNotificationTemplate} = require("../templates/adminNotificationTemplate");
const {userConfirmationTemplate} = require("../templates/userConfirmationTemplate");

exports.sendSupportEmail = async ({name, email, message}) => {
  // Email to Admin
  const adminHtml = adminNotificationTemplate({name, email, message});
    await brevo.sendTransacEmail({ 
        sender,
        replyTo,
        to: [replyTo],
        subject: `New Support Ticket from ${name}`,
        htmlContent: adminHtml,
    });
    
    await brevo.sendTransacEmail({
        sender,
        replyTo,
        subject: "Support Ticket Received",
        to: [{email, name}],
        htmlContent: userConfirmationTemplate({name, message }),
    });
}   