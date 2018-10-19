require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const bug = require('./bug');
const debug = require('debug')('slack-bug-reporter:index');

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('<h2>The Slash Command and Bug Report app is running</h2>');
});

/*
 * Endpoint to receive /helpdesk slash command from Slack.
 * Checks verification token and opens a dialog to capture more info.
 */
app.post('/commands', (req, res) => {
  // extract the verification token, slash command text,
  // and trigger ID from payload
  const { token, text, trigger_id } = req.body;


  // check that the verification token matches expected value
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    // create the dialog payload - includes the dialog structure, Slack API token,
    // and trigger ID
    let dialog = {};

    //Can create different dialogs if needed with a different callback_id to build the bug report
    //Ex: If you type /bugreport ios, can check text here to be ios, then build a more specific bug report for it

    dialog = {
      token: process.env.SLACK_ACCESS_TOKEN,
      trigger_id,
      dialog: JSON.stringify({
        title: 'Submit a Bug Report',
        callback_id: 'bug',
        submit_label: 'Submit',
        elements: [
          {
            label: 'Summary',
            type: 'text',
            name: 'summary',
            hint: 'A Short Description of the bug/crash',
          },
          {
            label: 'Platform',
            type: 'select',
            name: 'platform',
            options: [
              { label: 'Android App', value: 'Android App' },
              { label: 'iOS App', value: 'iOS App' },
              { label: 'Web App', value: 'Web App' }
            ],
          },
          {
            label: 'App Version(if appl.)',
            type: 'text',
            name: 'app-version',
            optional: true,
            hint: 'Version of the app that the error occurred on'
          },
          {
            label: 'Description',
            type: 'textarea',
            name: 'description',
            optional: true,
            hint: 'Describe how to reproduce/expected behavior/actual behavior'
          }
        ],
      }),
    };

    // open the dialog by calling dialogs.open method and sending the payload
    axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
      .then((result) => {
        debug('dialog.open: %o', result.data);
        res.send('');
      }).catch((err) => {
        console.log(err);
        debug('dialog.open call failed: %o', err);
        res.sendStatus(500);
      });
  } else {
    debug('Verification token mismatch');
    res.sendStatus(500);
  }
});

/*
 * Endpoint to receive the dialog submission. Checks the verification token
 * and creates a Bug Report
 */
app.post('/interactive-component', (req, res) => {
  const body = JSON.parse(req.body.payload);
  // check that the verification token matches expected value
  if (body.token === process.env.SLACK_VERIFICATION_TOKEN) {
    debug(`Form submission received: ${body.submission.trigger_id}`);

    // immediately respond with a empty 200 response to let
    // Slack know the command was received
    res.send('');

    // create Bug Report
    bug.create(body.user.id, body.submission, body.channel.id, body.callback_id);
  } else {
    debug('Token mismatch');
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});
