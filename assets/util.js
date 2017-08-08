'use strict';
function getSingleElementByClassName(className) {
  return document.getElementsByClassName(className)[0];
}

function replaceInnerInClass(className, text) {
  var theClass = getSingleElementByClassName(className);
  theClass.innerHTML = '';
  theClass.appendChild(document.createTextNode(text));
}

function appendTextToClass(className, text) {
  getSingleElementByClassName(className).appendChild(document.createTextNode(text));
}

function replaceTextInClass(className, text) {
  replaceInnerInClass(className, '');
  appendTextToClass(className, text);
}

function getQueryParam(paramName) {
  var url = window.location.href;
  var queryString = url.split('?');
  queryString = queryString[queryString.length-1];
  var params = queryString.split('&');
  for (var i = 0; i < params.length; i++) {
    var splitPair = params[i].split('=');
    if (splitPair[0] === paramName) {
      return splitPair[1];
    }
  }
};

function onSignIn (googleUser) {
  var profile = googleUser.getBasicProfile();
  replaceTextInClass('hs_loggedIn', 'Logged in as ' + profile.ig + ' (Google)');
  getSingleElementByClassName('hs_logout').style.display = 'block';
}

function signOut () {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    replaceTextInClass('hs_loggedIn', 'Not logged in');
  });
  getSingleElementByClassName('hs_logout').style.display = 'none';
}

function prettifyTimeAgo(datetime) {
  var timeDiff = Date.now().valueOf() - datetime.valueOf();

  // milliseconds
  if (timeDiff < 1000) {
    return ' just now';
  }

  // seconds
  timeDiff = Math.round(timeDiff / 1000);
  if (timeDiff < 30) {
    return timeDiff + ' secs ago';
  }

  // minutes
  timeDiff = Math.round(timeDiff / 60);
  if (timeDiff < 50) {
    return timeDiff + ' mins ago';
  }

  // hours
  timeDiff = Math.round(timeDiff / 60);
  if (timeDiff < 24) {
    return timeDiff + ' hours ago';
  }

  // days
  timeDiff = Math.round(timeDiff / 24);
  if (timeDiff < 7) {
    return timeDiff + ' days ago';
  }

  // weeks
  timeDiff = Math.round(timeDiff / 7);
  if (timeDiff < 4) {
    return timeDiff + ' weeks ago';
  }

  // months
  timeDiff = Math.round(timeDiff / 4);
  return timeDiff + ' months ago';
}

function googleAuthInit() {
  // loads auth2 in order to show logout button if user is signed in
  gapi.load('auth2', {
    callback: function () {
      gapi.auth2.init().then(function() {
        if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
          getSingleElementByClassName('hs_logout').style.display = 'block';
        }
      }, function(obj) {
        if (obj.error === "idpiframe_initialization_failed") {
          console.log('You must replace YOUR-CLIENT-ID-HERE with your client id in stream.html and modal.html');
        }
      });
    }
  });
}
