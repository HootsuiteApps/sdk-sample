'use strict';
function sendToAppHandler(data) {
  if (data.post.network === 'TWITTER') {
    var httpRequest = new XMLHttpRequest();
    httpRequest.open(
      'GET',
      window.location.origin + '/tweets/' + data.post.id
    );
    httpRequest.setRequestHeader('secretKey', 'super_secret')
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
      var hydratedData = convertTwitterPayload(httpRequest.responseText);
      window.localStorage.jsonData = JSON.stringify(hydratedData);
    }
  } else {
    window.localStorage.jsonData = JSON.stringify(data);
  }
  // open a custom modal, where the data will be read and displayed on the dashboard
  hsp.showCustomPopup(window.location.origin + '/modal', 'Post Info');
}

// Only necessary if you want consistency between social network responses.
// Hydrate with more data as required (i.e. `post.conversation`, `post.attachments`).
function convertTwitterPayload(response) {
  var data = {};
  var payload = JSON.parse(response);

  // move profile obj
  data.profile = {};
  data.profile = payload.user;

  // manually construct post obj
  data.post = {};
  data.post.network = "TWITTER";
  data.post.id = payload.id;
  data.post.datetime = payload.created_at;
  data.post.source = payload.source;
  // counts
  data.post.counts = {};
  data.post.counts.likes = payload.favorite_count;
  data.post.counts.shares = payload.retweet_count;
  data.post.counts.replies = payload.entities.user_mentions.length || 0;
  // content
  data.post.content = {};
  data.post.content.body = payload.text;
  // user
  data.post.user = {};
  data.post.user.userid = payload.user.id;
  data.post.user.username = payload.user.name;

  return data;
}

document.addEventListener('DOMContentLoaded', function () {
  // the hsp.init function initializes the Hootsuite App SDK
  // it should only be used once per component because it
  // resets event handlers and any other configuration
  hsp.init({
    useTheme: true
  });

  // binds the "Send to <Your-app-here>" button in all Hootsuite streams
  // to a function of your choice. Can be anonymous as well
  hsp.bind('sendtoapp', sendToAppHandler);
});
