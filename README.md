# sdk-sample-app

> SDK Sample app for external developers to install

## Table of Contents

- [Overview](#overview)
  - [What is the Hootsuite dashboard?](#what-is-the-hootsuite-dashboard)
  - [What does a Hootsuite app do?](#what-does-a-hootsuite-app-do)
  - [What does this Hootsuite app do?](#what-does-this-hootsuite-app-do)
- [Getting started](#getting-started)
  - [Using Heroku](#using-heroku)
  - [Using another solution](#using-another-solution)
- [Configuration](#configuration)
  - [Configuring your Hootsuite App](#configuring-your-hootsuite-app)
  - [Configuring your shared secret](#configuring-your-shared-secret-for-use-with-attachfiletomessage)
  - [Configuring your Google client ID](#configuring-your-google-client-id)
- [Other things you can do with the Plugin SDK](#other-things-you-can-do-with-the-Plugin-SDK)
- [Useful Links](#useful-links)

## Overview

### What is the Hootsuite dashboard?

The Hootsuite dashboard is a tool which allows you to manage all of your social media in one place.

### What does a Hootsuite app do?

A Hootsuite app uses the [Hootsuite JavaScript SDK](https://app-directory.s3.amazonaws.com/docs/sdk/v4.0/index.html) in order to extend the Hootsuite dashboard by adding custom integrations with other service and useful features for users. Hootsuite apps can either be free or monetized.

### What does this Hootsuite app do?

This Sample App currently only contains a sample plugin component (allows users to send things from Hootsuite streams to an app) and a sample stream component. The plugin listens for a `'sendtoapp'` event and opens a modal, populated with the data from the message it was activated on. The stream displays some sample messages and has buttons that activate SDK functions. Components in a Hootsuite app are largely seperate but it is possible to communicate between them.

The Sample App can be hosted locally, or on Heroku or some other hosting service. The backend is a very simple NodeJS/Express app but you can swap out the backend with anything as long as you meet a few requirements. These are listed below in the [Using another hosting solution](#using-another-hosting-solution) section.

## Getting started

### Using Heroku

1. [Setup Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up).
2. Clone this repository. `git clone https://github.com/HootsuiteApps/sdk-sample.git`
3. [Create a Heroku app](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app) for this sample app.
	- Add Twitter Credentials in index.js to use Twitter account (optional)
4. `git push heroku master` to push this app to Heroku. Heroku should detect that this app is a Node/Express app and run your index.js file
5. Once Heroku says that it's done use `heroku open` and add /modal to the URL it opened in your browser. If it comes up with a blank page that has a "Show JSON Payload" button then the web server is setup correctly.

## Configuration

### Configuring your Hootsuite App

1. If you already have a Hootsuite developer account head over to [your Hootsuite app  directory management page](https://hootsuite.com/developers/my-apps) and create an app, and inside that app create a plugin component. 
2. Edit the plugin component and enter the following into the fields: For the plugin component Service URL use your endpoint for plugin.html, if you used Heroku and Node this would be `https://<heroku-app-name-here>.herokuapp.com/plugin` . Also, check off the Default Install box. 
3. If you'd like to install a stream example as well you should create another component, but this time make it a stream. Edit it again and this time enter `https://<heroku-app-name-here>.herokuapp.com/stream` as your Service URL.
4. Install your app by going to your [Hootsuite dashboard](https://hootsuite.com/dashboard) and navigating to the app directory (puzzle piece at the bottom of the left sidebar). Your app should be under Developer, install it.
5. Test it by going to your [Hootsuite dashboard](https://hootsuite.com/dashboard), clicking the elipsis on any post and hitting Send to <your-plugin-component-name>. This should pop up a modal with some info about the post you sent to the app.

### Configuring your shared secret (for use with attachFileToMessage())

1. Edit your app in [My Apps](https://hootsuite.com/developers/my-apps)
2. Under "Authentication Type" select "Single Sign-On (SHA-512)"
3. Create a shared secret (preferably by randomly generating it) and enter it into the "Shared Secret" field and hit save at the bottom of the page.
4. Create a file called `secret.txt` in the root directory of your copy of this repo.
5. Paste the Shared Secret into this file (no special format, this file should contain your secret and nothing else) and you should be good to go!

### Configuring your Google client ID

1. Access the [Google Cloud Console](https://console.cloud.google.com/) and create a project.
2. Go to `APIs and Service -> Credentials` and hit create credentials and create a client ID for a web app. Setup your Authorized Javascript origins with your Heroku domain.
3. Copy your OAuth 2 Client ID and paste it into `modal.html` and `stream.html` where it says `YOUR-CLIENT-ID-HERE`.
4. Google Sign-in should now work seamlessly. If it doesn't work then ensure that your Authorized Javascript origins are set up correctly in the [Google Cloud Console](https://console.cloud.google.com/).

## Using another hosting solution

You can host your app on any service, but here are few things to keep in mind:

* You need to accept POST requests on your plugin and stream endpoints.
* You need to host the static CSS, Javascript, and icons somehow.
* Your endpoints need to have HTTPS.

## Other things you can do with the Plugin SDK

* Use it to send a post to your own servers and manipulate/save it.
* Process the images from a post and use the [attachFileToMessage](https://app-directory.s3.amazonaws.com/docs/sdk/v4.0/global.html#attachMedia) SDK function to put the processed images into the compose box.
* Compose messages using the [composeMessage](https://app-directory.s3.amazonaws.com/docs/sdk/v4.0/global.html#composeMessage) SDK function based on the contents of a message that was sent to your plugin.

## Useful Links

* [App Directory SDK Reference](https://app-directory.s3.amazonaws.com/docs/sdk/v4.0/index.html)
* [Hootsuite Developer Docs](https://developer.hootsuite.com/docs)
