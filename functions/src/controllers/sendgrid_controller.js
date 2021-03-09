const helpers = require('../helpers.js');
const sgMail = require('@sendgrid/mail');

// TODO: comment out when testing locally
sgMail.setApiKey(helpers.functions.config().sendgrid.api);
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Add email to db
async function sendEmail(id, username, timestamp) {
  let processedTimestamp;
  if (timestamp) {
    processedTimestamp = new Date(timestamp).toDateString().toLocaleString('en-US', {timeZone: 'America/New_York'});
  } else {
    processedTimestamp = new Date().toLocaleString('en-US', {timeZone: 'America/New_York'});
  }

  const msg = {
    to: 'aloestories@gmail.com', // Recipient
    from: 'aloestories@gmail.com', // Verified sender
    subject: 'You have received a new submission!',
    text: 'Story #' + id + ' added by ' + username + ' at ' + processedTimestamp + '.',
  };

  sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent');
        return true;
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
}

module.exports = {
  sendEmail,
};
