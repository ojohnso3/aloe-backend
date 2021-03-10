const helpers = require('../helpers.js');
const sgMail = require('@sendgrid/mail');

// TODO: comment out when testing locally
sgMail.setApiKey(helpers.functions.config().sendgrid.api);

async function sendEmail(msg) {
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


// Send email when a user signs up and creates a new account
async function sendCreationEmail(username) {
  const processedTimestamp = new Date().toLocaleString('en-US', {timeZone: 'America/New_York'});

  const msg = {
    to: 'aloestories@gmail.com', // Recipient
    from: 'aloestories@gmail.com', // Verified sender
    subject: 'A new user has signed up!',
    text: 'Beta user created account with username ' + username + ' at ' + processedTimestamp + '.',
  };

  sendEmail(msg);
}

// Send email when a user submits a post
async function sendPostEmail(id, username, timestamp) {
  let processedTimestamp;
  if (timestamp) {
    processedTimestamp = new Date(timestamp).toLocaleString('en-US', {timeZone: 'America/New_York'});
  } else {
    processedTimestamp = new Date().toLocaleString('en-US', {timeZone: 'America/New_York'});
  }

  const msg = {
    to: 'aloestories@gmail.com', // Recipient
    from: 'aloestories@gmail.com', // Verified sender
    subject: 'You have received a new submission!',
    text: 'Story #' + id + ' added by ' + username + ' at ' + processedTimestamp + '.',
  };

  sendEmail(msg);
}

// Send email when a user submits a report
async function sendReportEmail(type, id) {
  const processedTimestamp = new Date().toLocaleString('en-US', {timeZone: 'America/New_York'});

  const msg = {
    to: 'aloestories@gmail.com', // Recipient
    from: 'aloestories@gmail.com', // Verified sender
    subject: 'New Report Submitted.',
    text: 'ID #' + id + ' of type ' + type + ' reported at ' + processedTimestamp + '.',
  };

  sendEmail(msg);
}

module.exports = {
  sendCreationEmail,
  sendPostEmail,
  sendReportEmail,
};
