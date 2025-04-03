const { Resend } = require('resend');

const resend = new Resend('re_TANhsRc5_F3Y6hyxyxMGTHRvieuqnEMHz'); // Replace with actual API key

async function sendEmail(senderEmail, recipientEmail, clientName, pdfBase64) {
    try {
        if (!pdfBase64) {
            throw new Error("Invalid PDF base64 provided");
        }

        // Send email using Resend API
        const response = await resend.emails.send({
            from: senderEmail,
            to: recipientEmail,
            subject: 'Your Invoice',
            text: `This is an invoice for ${clientName}. Please find the attached PDF.`,
            attachments: [
                {
                    filename: "invoice.pdf",
                    content: pdfBase64,
                    encoding: "base64",
                },
            ],
        });

        console.log("Email sent successfully.", response);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

module.exports = sendEmail;
