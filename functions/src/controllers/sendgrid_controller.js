const helpers = require('../helpers.js');

const sgMail = require('@sendgrid/mail');

// TODO: comment out when testing locally
sgMail.setApiKey(helpers.functions.config().sendgrid.api);
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// Add email to db
async function sendEmail(id, username, timestamp) {
  let processedTimestamp;
  if (timestamp) {
    processedTimestamp = new Date(timestamp).toDateString();
  } else {
    processedTimestamp = new Date().toDateString();
  }

  const msg = {
    to: 'aloestories@gmail.com', // Change to your recipient
    from: 'aloestories@gmail.com', // Change to your verified sender
    subject: 'You have received a new submission! 😈💅🙊',
    text: 'Story #' + id + ' added by ' + username + ' at ' + processedTimestamp + '. Please check the moderation portal for review. 🌚🐙🌝',
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
