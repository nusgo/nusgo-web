function UserAuth() {
    this.isLogin = false;
    this.user = null;
}

UserAuth.prototype.fbStatusChangeCallback = function(response) {
    console.log(response);
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        this.isLogin = true;
        testAPI();
    } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        this.isLogin = false;
        document.getElementById('status').innerHTML = 'Please log ' +
            'into this app.';
    } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        this.isLogin = false;
        document.getElementById('status').innerHTML = 'Please log ' +
            'into Facebook.';
    }
};

UserAuth.prototype.checkLoginState = function() {
    var self = this;
    FB.getLoginStatus(function(response) {
        self.fbStatusChangeCallback(response);
    });
};

UserAuth.prototype.initialiseFacebook = function() {
    FB.init({
        appId      : '364948177043546',
        cookie     : true,  // enable cookies to allow the server to access 
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.3' // use version 2.2
    });

    this.checkLoginState();
};

function testAPI(lat,lng) {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
        userID = response.id;
        console.log('Successful login for: ' + response.name + ', ' + userID);
        $('#loginButton').hide();
        document.getElementById('status').innerHTML =
         'Hello, ' + response.name + '!';
    });
    controller.hideLoginPrompt();
}

