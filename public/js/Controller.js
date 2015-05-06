var controller = null;
var dummyContacts = ["Tan Kang Soon", "Andhieka Putra", "Pee Choon Hian"];

function initialise() {
    function disableEnterKey(){
        $(window).keydown(function(event){
            if (event.keyCode == 13){
                event.preventDefault();
            }
        });
    }
    disableEnterKey();
    controller = new Controller();
    loadFacebookSDK();
    window.fbAsyncInit = function() {
        controller.initialiseFacebookInController();
    };
}

function loadFacebookSDK() {
    // Load the SDK asynchronously
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
}

function Controller() {
    this.currentChatID = null;
    this.userAuth = new UserAuth();
    this.map = new Map();
    this.map.registerClickHandler(this);
    this.storageManager = new StorageManager();
    this.storageManager.registerObserver(this);
    this.storageManager.syncWithServer();
    this.clickPosition = null;
    this.afterLoginHandler = null;
    this.openNotifications();
    this.hideNotifications();
    this.initialiseChat();
    this.selectContact();
}

Controller.prototype.initialiseChat = function() {
    //loop through contact list and create new contact divs and chatArea divs
    for (var i = 0; i < dummyContacts.length; i++){
        dummyContact = dummyContacts[i].replace(/\s+/g,'');
        $('#contactList').append('<div id = "' + dummyContact + '" class = "contact">' + dummyContact + '</div>');
        $('#chatArea').append('<div id = "chat_' + dummyContact + '" class = "showChat">Chatting with ' + dummyContact + ': </div>');
    }        

    var self = this;

    $('#chatField').keydown(function(event){
        if (event.keyCode == 13){
            var chat = $('#chatField').val();
            self.sendMessage(chat);
        }
    });
}

Controller.prototype.selectContact = function() {
    var self = this;
    $('.contact').click(function(){
        self.currentChatID = this.id;
        var showID = '#chat_'+self.currentChatID;
        $('.showChat').hide();
        $(showID).show();
        console.log("showID: " + showID);
    });
};

Controller.prototype.sendMessage = function(chat) {
    var self = this;
    var name = self.userAuth.userName;
    var id = self.userAuth.userID;
    if (chat != ""){
        $('#chatField').val('');
        var showID = '#chat_'+self.currentChatID;
        console.log("appending to: " + showID);
        $(showID).append(
            '<p><img id = "chatProfilePic" src="//graph.facebook.com/' + id + '/picture">'+
            " " + chat + "</p>");
    }
};

Controller.prototype.openNotifications = function() {
    $("#notifications").click(function(){
        $('#notificationsBox').fadeIn({queue: false, duration: 'slow'});
        $('#notificationsBox').animate({
                height: "800px"
            }, 800, function(){
        });
        $('#promptBackground').fadeIn(600);
    });
};

Controller.prototype.hideNotifications = function() {
    $('#promptBackground').click(function(){
        $('#notificationsBox').animate({
                height: "0px"
        }, 600, function() { });
        $('#notificationsBox').fadeOut({queue: false, duration: 'slow'});
        $('#promptBackground').fadeOut(600);
    });
};

Controller.prototype.askUserForMealType = function() {
    this.displayMarkerPrompt();
    this.closeMarkerPromptOnBackgroundClick();
    this.setMarkerPromptSubmitHandler(this.handleMarkerPromptSubmit);
};

Controller.prototype.handleMarkerPromptSubmit = function(lat, lng, mealType, message) {
    var self = this;
    if (!(this instanceof Controller)) {
        self = this.controller;
    }
    function helper() {
        // create marker
        var marker = new Marker();
        marker.userName = self.userAuth.userName;
        marker.userID = self.userAuth.userID;
        marker.lat = lat;
        marker.lng = lng;
        marker.mealType = mealType;
        marker.message = message;
        // store marker
        self.storageManager.addMarker(marker);
        self.storageManager.syncWithServer();
        // retrieve and render marker
        var markers = self.storageManager.markers;
        self.map.renderMarkers(markers);
    }

    if (self.userAuth.isLogin == false) {
        self.displayLoginPrompt();
        self.afterLoginHandler = helper;
    } else {
        helper();
    }
};

Controller.prototype.mapIsClicked = function(lat, lng) {
    this.clickPosition = [lat, lng];
    this.askUserForMealType();
};

Controller.prototype.initialiseFacebookInController = function() {
    this.userAuth.initialiseFacebook();
};

Controller.prototype.displayMarkerPrompt = function() {
    $('#prompt').fadeIn({queue: false, duration: 'slow'});
    $('#prompt').animate({
            height: "310px"
        }, 600, function(){
    });
    $('#promptBackground').fadeIn(600);
};

Controller.prototype.hideMarkerPrompt = function() {
    $('#prompt').animate({
            height: "0px"
        }, 600, function() { });
    $('#prompt').fadeOut({queue: false, duration: 'slow'});
    $('#promptBackground').fadeOut(600);
};

Controller.prototype.closeMarkerPromptOnBackgroundClick = function() {
    $('#promptBackground').click(this.hideMarkerPrompt);
};

Controller.prototype.setMarkerPromptSubmitHandler = function(handler) {
    var self = this;
    $("#submit").click(function() {
        var mealPreference = $('input[name=meal]:checked').val();
        var message = $('input[name=message]').val();
        var lat = self.clickPosition[0];
        var lng = self.clickPosition[1];
        // do some validation
        if (mealPreference == undefined) {
            alert();
            return;
        }
        self.hideMarkerPrompt();
        handler(lat, lng, mealPreference, message);
    });    
}

Controller.prototype.displayLoginPrompt = function() {
    $('#loginPrompt').fadeIn({queue: false, duration: 'slow'});
    $('#loginPrompt').animate({
            height: "300px"
        }, 600, function(){
    });
};

Controller.prototype.hideLoginPrompt = function() {
    $('#loginPrompt').animate({
            height: "0px"
        }, 600, function(){
    });
    $('#loginPrompt').fadeOut({queue: false, duration: 'slow'});
};

Controller.prototype.onReceiveNewMarker = function(marker) {
    this.map.addMarker(marker);
};

Controller.prototype.onRemoveMarker = function(marker) {
    this.map.removeMarker(marker);
};

Controller.prototype.onRefreshMarkers = function(markers) {
    this.map.renderMarkers(markers);
};

Controller.prototype.userDidRemoveMarker = function(marker) {
    this.storageManager.removeMarker(marker);
    this.map.removeMarker(marker);
};

google.maps.event.addDomListener(window, 'load', initialise);

function checkLoginState() {
    controller.userAuth.checkLoginState();
    if (controller.afterLoginHandler != null) {
        controller.afterLoginHandler();
    }
}