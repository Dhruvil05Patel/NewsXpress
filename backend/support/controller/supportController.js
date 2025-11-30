const {sendSupportEmail} = require("../service/supportEmailService");

exports.handleSupportRequest = async (req, res) => {
    const {name, email, message} = req.body;

    try {
        await sendSupportEmail({name, email, message});
        res.status(200).json({message: "Support request submitted successfully."});
    } catch (error) {
        console.error("Error sending support email:", error);
        res.status(500).json({error: "Failed to submit support request."});
    }

};