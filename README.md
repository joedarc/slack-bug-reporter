# Slack Bug Reporter

Add slash command to your Slack workspace and submit easy-to-track bugs!

## Creating a bug using a Slash Command and a Dialog

Use a slash command and a dialog to post a bug to slack.

## Setup

#### Create a Slack app

1. Create an app at api.slack.com/apps
1. Navigate to the OAuth & Permissions page and add the following scopes:
    * `commands`
    * `users:read`
    * `users:read.email`
    * `chat:write:bot`
1. Click 'Save Changes' and install the app

#### Run locally
1. Get the code
    * Either clone this repo and run `npm install`
1. Set the following environment variables to `.env` (see `.env.sample`):
    * `SLACK_ACCESS_TOKEN`: Your app's `xoxp-` token (available on the Install App page)
    * `PORT`: The port that you want to run the web server on
    * `SLACK_VERIFICATION_TOKEN`: Your app's Verification Token (available on the Basic Information page)
1. If you're running the app locally:
    1. Start the app (`npm start`)
    1. In another window, start ngrok on the same port as your webserver (`ngrok http $PORT`)

#### Add a Slash Command
1. Go back to the app settings and click on Slash Commands.
1. Click the 'Create New Command' button and fill in the following:
    * Command: `/bugreport`
    * Request URL: Your ngrok URL + /commands
    * Short description: `Create a bug`
    * Usage hint: `[the problem you're having]`
1. Save and reinstall the app

#### Enable Interactive Components
1. Go back to the app settings and click on Interactive Components.
1. Set the Request URL to your ngrok or Glitch URL + /interactive-component
