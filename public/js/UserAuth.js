function UserAuth() {
    this.isLogin = false;
    this.userName = null;
    this.userID = 0;
    this.user = null;
    this.socket = io();
    var self = this;
    this.socket.on('connect', function() {
        self.loginToServer();
    });
}

UserAuth.prototype.fbStatusChangeCallback = function(response) {
    if (response.status === 'connected') {
        // Logged into your app and Facebook. Ad retrieve userID and Name
        this.isLogin = true;
        var self = this;
        fetchUserInfo(function(userName, userID){
            self.userName = userName;
            self.userID = userID;
            self.user = {
                id: userID,
                name: userName
            };
            self.loginToServer();
            controller.loginHasFinished();
        });
    } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        this.isLogin = false;
        /*document.getElementById('status').innerHTML = 'Please log ' +
            'into this app.';*/
    } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        this.isLogin = false;
        /*document.getElementById('status').innerHTML = 'Please log ' +
            'into Facebook.';*/
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

UserAuth.prototype.loginToServer = function() {
    if (this.userID === 0) return;
    if (!(this.isLogin)) return;
    this.socket.emit('login', {
        id: this.userID,
        name: this.userName
    });
};

function fetchUserInfo(callback) {
    var userID, userName;
    FB.api('/me', function(response) {
        userID = response.id;
        userName = response.name;
        callback(userName, userID);
        $('#loginButton').hide();
        document.getElementById('status').innerHTML =
         'Hello, ' + userName + '!';
    });
    controller.hideLoginPrompt();
}

