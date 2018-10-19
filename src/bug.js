const axios = require('axios');
const qs = require('querystring');
const users = require('./users');
const debug = require('debug')('slack-bug-reporter:bug');

/*
 *  Send bug creation confirmation via
 *  chat.postMessage to the user who created it
 */
const sendConfirmation = (bug, channel, attachment_body) => {
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: channel,
    link_names: 1,
    text: 'Bug Reported!',
    attachments: attachment_body,
  })).then((result) => {
    axios.post('https://slack.com/api/pins.add', qs.stringify({
      token: process.env.SLACK_ACCESS_TOKEN,
      channel: channel,
      timestamp: result.data.ts
    })).then((pinResult) => {
      debug('sendConfirmation: %o', pinResult.data);
    }).catch((err) => {
      debug('sendConfirmation error: %o', err);
    });
    debug('sendConfirmation: %o', result.data);
  }).catch((err) => {
    debug('sendConfirmation error: %o', err);
  });
};

// Create Bug. Call users.find to get the user's email address
// from their user ID
const create = (userId, submission, channel, callback_id) => {
  const bug = {};

  const fetchUserEmail = new Promise((resolve, reject) => {
    users.find(userId).then((result) => {
      debug(`Find user: ${userId}`);
      resolve(result.data.user.id);
    }).catch((err) => { reject(err); });
  });

  fetchUserEmail.then((result) => {
    bug.userId = userId;
    bug.userEmail = result;
    bug.summary = submission.summary;
    bug.platform = submission.platform;
    bug.description = submission.description;
    bug['app-version'] = submission['app-version'];
    const attachment_body = getAttachmentBody(bug, callback_id, submission);
    sendConfirmation(bug, channel, attachment_body);

    return bug;
  }).catch((err) => { console.error(err); });
};

const getAttachmentBody = (bug, callback_id, submission) => {
  let params = {}
  params.title = `Bug Report created by <@${bug.userEmail}>`;
  params.text = bug.text;
  params.fields = [];
  if(bug.summary){
    params.fields.push(
      {
        title: 'Summary',
        value: bug.summary,
      }
    );
  }
  //Can
  else if(callback_id === 'bug') {
    params.fields.push(
      {
        title: 'Platform',
        value: bug.platform,
        short: true,
      }
    );
    params.fields.push(
      {
        title: 'App Version',
        value: bug['app-version'] || 'None provided',
        short: true,
      }
    );
  }
  if(bug.description) {
    params.fields.push(
      {
        title: 'Description',
        value: bug.description || 'None provided',
      }
    );
  }
  const attachment_body = JSON.stringify([params]);
  return attachment_body;
};

module.exports = { create, sendConfirmation };
