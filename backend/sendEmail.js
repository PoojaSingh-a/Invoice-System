const { Resend } = require('resend');
const resend = new Resend('re_TANhsRc5_F3Y6hyxyxMGTHRvieuqnEMHz'); // Replace with actual API key

async function sendEmail(senderEmail, recipientEmail, clientName, pdfBase64,calendarLink) {
    try {
        if (!pdfBase64) {
            throw new Error("Invalid PDF base64 provided");
        }
        // Send email using Resend API
        const response = await resend.emails.send({
            from: senderEmail,
            to: recipientEmail,
            subject: 'Your Invoice',
            html: `
                <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;"> 
                    <p>Hello ${clientName}</p>
                    <p>Please find your invoice attached.</p>
                    <p>
                        <a href="${calendarLink}" target="_blank"
                        style="display: inline-block; padding:12px 24px; margin-top:10px; background-color:#007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Add Reminder to Google Calendar
                        </a>
                    </p>
                    <p>Thankyou!</p>
                </div>
            ` ,      
            attachments: [
                {
                    filename: "invoice.pdf",
                    content: pdfBase64,
                    encoding: "base64",
                },                
            ],
        });
       // console.log("Email sent successfully.", response);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

module.exports = sendEmail;
