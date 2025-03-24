const { Resend } = require('resend');
const resend = new Resend('re_TANhsRc5_F3Y6hyxyxMGTHRvieuqnEMHz');

async function sendEmail(senderEmail, recipietEmail, clientName) {
  try {
    const response = await resend.emails.send({
      from: senderEmail,
      to: recipietEmail,
      subject: 'Your Invoice',
      text: `This is an invoice for ${clientName}.`,
    });
    console.log("Email sent successfully.", response);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
}

module.exports = sendEmail;
