const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '22520097@gm.uit.edu.vn',
    pass: 'kscr rslp nldy pusq',
  },
});

function sendAuthenticationEmail(to, link) {
  const mailOptions = {
    from: '22520097@gm.uit.edu.vn',
    to: to,
    subject: 'Authentication Required',
    html: `<p>Please click on the following link to authenticate your account:</p>
           <a href="${link}">Authenticate</a>`,
  };

  return transporter.sendMail(mailOptions)
    .then( info => console.log('Email sent: ' + info.response) )
    .catch(error => {
      console.error('Error sending email: ', error);
      throw error;
    });
}

module.exports = { sendAuthenticationEmail };