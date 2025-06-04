const { Resend } = require('resend');
const resend = new Resend('re_TANhsRc5_F3Y6hyxyxMGTHRvieuqnEMHz'); 

async function sendContactEmail(senderEmail, subject,category, message) {
    console.log("Sender Email is : ", senderEmail);
    try {
        const response = await resend.emails.send({
            from: "pschouhan@resend.dev",
            to: "poojasingh3084a@gmail.com",
            subject: `Feedback : ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                    <p><strong>Feedback from:</strong> ${senderEmail}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Category:</strong> ${category}</p>
                    <p><strong>Message:</strong> ${message.replace(/\n/g, "<br/>")}</p>
                </div>
            `,
        });
        console.log("Feedback Email sent successfully.", response);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

module.exports = sendContactEmail;
