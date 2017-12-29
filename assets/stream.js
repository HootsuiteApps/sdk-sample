'use strict';

function bindApiButtons() {
  getSingleElementByClassName('hs_showImagePreview').addEventListener('click', function () {
    hsp.showImagePreview(getSingleElementByClassName('hs_showImagePreviewInput').value, 'https://hootsuite.com');
  });

  getSingleElementByClassName('hs_showLightbox').addEventListener('click', function () {
    // similar to showImagePreview
    hsp.showLightbox(getSingleElementByClassName('hs_showLightboxInput').value);
  });

  getSingleElementByClassName('hs_showStatusMessage').addEventListener('click', function () {
    // type can be info, error, warning or success
    hsp.showStatusMessage(getSingleElementByClassName('hs_showStatusMessageInput').value, getSingleElementByClassName('hs_showStatusMessageTypeInput').value);
  });

  getSingleElementByClassName('hs_showUser').addEventListener('click', function () {
    // opens a modal with info about a twitter user
    hsp.showUser(getSingleElementByClassName('hs_showUserInput').value);
  });

  getSingleElementByClassName('hs_composeMessage').addEventListener('click', function () {
    hsp.composeMessage(getSingleElementByClassName('hs_composeMessageInput').value);
  });

  getSingleElementByClassName('hs_assignItem').addEventListener('click', function () {
    // Generates a 16 character random string to use as the messageId
    // because the messageId must be unique or Hootsuite will return a 500 error.
    // This can be saved if you'd like to do something using the `sendassignmentupdates` event
    // or with the Assignment Event Request API Callback <https://hootsuite.com/developers/app-directory/docs/api#AER>
    var randomString = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 16; i++) {
      randomString += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    hsp.assignItem({
      messageId: randomString,
      messageAuthor: getSingleElementByClassName('hs_assignMessageAuthor').value,
      messageAuthorAvatar: getSingleElementByClassName('hs_assignMessageAuthorAvatar').value,
      message: getSingleElementByClassName('hs_assignMessage').value
    });
  });

  getSingleElementByClassName('hs_attachFile').addEventListener('click', function () {
    hsp.getMemberInfo(function (data) {
      var timestamp = Math.floor(Date.now() / 1000);
      var url = getSingleElementByClassName('hs_attachFileInput').value;
      var extension = url.split('.');
      if (extension.length !== 0) {
        extension = extension[extension.length - 1];
      } else {
        extension = 'jpg';
      }
      var name = getSingleElementByClassName('hs_attachFileImageName').value;
      var httpRequest = new XMLHttpRequest();
      var once = false;
      // generates a token on the backend because secret must be kept on backend
      httpRequest.open( 'GET',
                        window.location.origin +
                        '/gen-token?userId=' + encodeURIComponent(data.userId) +
                        '&timestamp=' + encodeURIComponent(timestamp) +
                        '&url=' + encodeURIComponent(url));
      httpRequest.send();
      httpRequest.onreadystatechange = function () {
        if (httpRequest.responseText !== '' && !once) {
          hsp.attachFileToMessage({
            url: url,
            name: name,
            extension: extension,
            timestamp: timestamp,
            token: httpRequest.responseText
          });
          once = true;
        }
      };
    });
  });

  getSingleElementByClassName('hs_updatePlacementSubtitle').addEventListener('click', function () {
    hsp.updatePlacementSubtitle(getSingleElementByClassName('hs_updatePlacementSubtitleInput').value);
  });

  getSingleElementByClassName('hs_getTwitterAccounts').addEventListener('click', function () {
    hsp.getTwitterAccounts(function (data) {
      var httpRequest = new XMLHttpRequest();
      httpRequest.open(
        'GET',
        window.location.origin + '/twitterAccounts?accountIds=' + data.join()
      );
      httpRequest.setRequestHeader('secretKey', 'super_secret')
      httpRequest.send();
      httpRequest.onreadystatechange = function() {
        replaceTextInClass('hs_getTwitterAccountsOutput', httpRequest.responseText);
      }
    });
  });

  getSingleElementByClassName('hs_retweet').addEventListener('click', function () {
    hsp.getTwitterAccounts(function (data) {
      var splitURL = getSingleElementByClassName('hs_retweetInput').value.split('/');
      var id = splitURL[splitURL.length - 1];
      hsp.retweet(id, data[0]);
    });
  });

  getSingleElementByClassName('hs_showFollowDialog').addEventListener('click', function () {
    hsp.showFollowDialog(getSingleElementByClassName('hs_showFollowDialogName').value, true);
  });

  getSingleElementByClassName('hs_logout').addEventListener('click', signOut);
}

function loadTopBars() {
  var topBarControls = document.getElementsByClassName('hs_topBarControlsBtn');

  Array.prototype.forEach.call(topBarControls, function(topBarControl) {
    topBarControl.addEventListener('click', function (event) {
      var topBarDropdowns = document.getElementsByClassName('hs_topBarDropdown');
      for (var i = 0; i < topBarDropdowns.length; i++) {
        if (event.currentTarget.getAttribute('data-dropdown') === topBarDropdowns[i].getAttribute('data-dropdown')) {
          if (topBarDropdowns[i].style.display === 'none') {
            topBarDropdowns[i].style.display = 'block';
            event.currentTarget.classList.add('active');
          } else {
            topBarDropdowns[i].style.display = 'none';
            event.currentTarget.classList.remove('active');
          }
        } else {
          // remove active on all dropdown buttons except the one that was clicked
          var topBarBtns = document.getElementsByClassName('hs_topBarControlsBtn');
          for (var p = 0; p < topBarBtns.length; p++) {
            if (topBarBtns[p].getAttribute('data-dropdown') !== event.currentTarget.getAttribute('data-dropdown')) {
              topBarBtns[p].classList.remove('active');
            }
          }
          // close all dropdowns except the one that was clicked
          topBarDropdowns[i].style.display = 'none';
        }
      }
    });
  });
}

// for our purposes this is the same thing as jQuery's  $(document).ready(...)
document.addEventListener('DOMContentLoaded', function () {
  // intializes the Hootsuite JS SDK
  hsp.init({
    useTheme: true
  });

  loadTopBars();
  bindApiButtons();
  googleAuthInit();

  var socket = io();

  socket.on('stream update', function (msg) {
    // inserts incoming messages by copying previous messages and changing contents
    var parent = getSingleElementByClassName('hs_messages');
    var child = parent.insertBefore(getSingleElementByClassName('hs_message').cloneNode(true), parent.firstChild);
    child.getElementsByClassName('hs_postBody')[0].textContent = msg;
  });

  hsp.bind('refresh', function () {
    // You can do a complex refresh here,
    // for example only reload certain parts of your app.
    // In this example we'll resend the fake messages that get sent on connection

    var messages = document.getElementsByClassName('hs_message');
    // removes all messages except for one to use it as a template for adding more
    var initialLength = messages.length;
    for (var i = 0; i < initialLength-1; i++) {
      messages[0].remove();
    }

    // tells the server to re-serve the fake stream updates
    socket.emit('restart');
  });
});
