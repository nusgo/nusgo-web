function UserAuth() {
    this.isLogin = false;
    this.userName = null;
    this.userID = 0;
}

UserAuth.prototype.fbStatusChangeCallback = function(response) {
    console.log(response);
    if (response.status === 'connected') {
        // Logged into your app and Facebook. Ad retrieve userID and Name
        this.isLogin = true;
        var self = this;
        testAPI(function(userName, userID){
            self.userName = userName;
            self.userID = userID;
            console.log("userName retrieved:",self.userName);
            console.log("userID retrieved:", self.userID);
        });
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

function testAPI(callback) {
    var userID, userName;
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
        userID = response.id;
        userName = response.name;
        callback(userName, userID);
        console.log('Successful login for: ' + userName + ', ' + userID);
        $('#loginButton').hide();
        document.getElementById('status').innerHTML =
         'Hello, ' + userName + '!';
    });
    controller.hideLoginPrompt();
}

