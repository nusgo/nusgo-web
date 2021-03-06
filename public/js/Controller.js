document.addEventListener('DOMContentLoaded', function(event) {
    safeConverter = Markdown.getSanitizingConverter();
});

var controller = null;

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
    this.homeDescriptionOpen = true;
    this.markers = [];
    this.currentChatID = null;
    this.userAuth = new UserAuth();
    this.map = new Map();
    this.map.registerClickHandler(this);
    this.storageManager = new StorageManager();
    this.storageManager.registerObserver(this);
    this.storageManager.syncWithServer(); //gets markersList
    this.clickPosition = null;
    this.pendingMarkerInfo = null;
    this.pendingMarkerToJoin = null;
    this.chatService = new ChatService();
    this.closeAllPopUpsOnBackgroundClick();
    this.setMarkerPromptSubmitHandler(this.handleMarkerPromptSubmit);
    this.toggleHomeDescription();
    this.displayAbout();
    this.maxZIndex = 30;
    this.displayContactPrompt();
    this.ringTone = new Audio('sounds/NUSGo Ring Tone - Standard.mp3');
    this.ringTone.volume = 0.7;
}

Controller.prototype.displayAbout = function() {
    var self = this;
    $('.about').click(function(){
        console.log("ABOUT CLICKED");
        $('#aboutWindow').fadeIn({queue: false, duration: 'slow'});
        $('#aboutWindow').animate({
                height: "500px"
            }, 600, function(){
        });
        $('#promptBackground').fadeIn(600);
        $('#aboutWindow').css("z-index", ++self.maxZIndex);
        $('#promptBackground').css("z-index", self.maxZIndex)
    });    
};

Controller.prototype.hideAbout = function() {
    $('#aboutWindow').animate({
            height: "0px"
        }, 600, function() { });
    $('#aboutWindow').fadeOut({queue: false, duration: 'slow'});
    $('#promptBackground').fadeOut(600);
};

Controller.prototype.toggleHomeDescription = function() {
    var self = this;
    $('#hide').click(function(){
        if (self.homeDescriptionOpen === true){
            $('#homeDescription').animate({
                height: "90px",
                }, 600, function(){
                    $('#hide').html('+');
                    $('.homeOthers').hide();
                    $('.homeContent').html('<div id = "hungryPeopleStatus"></div>');
                    self.updatePeopleCount(self.markers);
            });
            self.homeDescriptionOpen = false;
        } else {
            $('#homeDescription').animate({
                height: "100%",
                }, 0, function(){
                    $('#hide').html('-');
                    $('.homeOthers').slideDown(1000);
                    $('.homeContent').html(
                        '<br><div id = "status"></div>'+
                        '<h2>Looking for meal buddies?</h2><br>'+
                        '<p><b><u>Place a marker on the map</u></b> to show that you are up for a meal!<p>'+
                        '<p>Or you can <b><u>click on a marker</u></b> to join him/her for a meal!</p><br>'+
                        '<p>You will be notified when you receive meal requests.</p>'+
                        '<div id = "hungryPeopleStatus"></div><br>'+
                        '<p>NUSGo! is a web application for lonely hearts to look for meal buddies. Are your friends too busy to dine today? <br>No problem! Make a new friend today!</p>');
                    self.updatePeopleCount(self.markers);
                    
            });
            self.homeDescriptionOpen = true;
        }
    });
};

Controller.prototype.updatePeopleCount = function(markers) {
    this.markers = markers;
    document.getElementById('hungryPeopleStatus').innerHTML = '<p>Hungry People: '
    + markers.length + '</p>';
};

Controller.prototype.askUserForMealType = function() {
    this.displayMarkerPrompt();
};

Controller.prototype.handleMarkerPromptSubmit = function(lat, lng, mealType, message, mealTime) {
    var self = this;
    if (!(this instanceof Controller)) {
        self = this.controller;
    }
    console.log(mealType);
    console.log(message);
    if (self.userAuth.isLogin == false) {
        self.displayLoginPrompt();
        self.pendingMarkerInfo = {
            lat: lat,
            lng: lng,
            mealType: mealType,
            message: message,
            mealTime: mealTime
        };
    } else {
        self.createAndStoreMarker(lat, lng, mealType, message, mealTime);
    }
};

Controller.prototype.createAndStoreMarker = function(lat, lng, mealType, message, mealTime) {
    var marker = new Marker();
    marker.userName = this.userAuth.userName;
    marker.userID = this.userAuth.userID;
    marker.lat = lat;
    marker.lng = lng;
    marker.mealType = mealType;
    marker.message = message;
    marker.mealTime = mealTime;
    console.log(marker);
    
    // validate that marker is not spam
    if (this.storageManager.isSpamMarker(marker)) {
        this.displaySpamPrompt(marker);
    } else {
        this.storageManager.addMarker(marker);
        // retrieve and render marker
        var markers = this.storageManager.markers;
        this.map.renderMarkers(markers);
        this.enableDesktopNotification();
    }
};

Controller.prototype.enableDesktopNotification = function() {
    if (!("Notification" in window)) return;
    var self = this;
    if (Notification.permission === "default") {
        Notification.requestPermission(function(permission) {
            if (permission === "granted") {
                self.sendNotification("Welcome", "You will be notified when someone Jio you or Chat with you.");
            }
        });
    }
};

Controller.prototype.sendNotification = function(title, message) {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    var options = {
        body: message,
        icon: "img/logo.png"
    };
    var n = new Notification(title, options);
    setTimeout(n.close.bind(n), 5000);
    // sound the ring tone
    this.ringTone.play();
};

Controller.prototype.mapIsClicked = function(lat, lng) {
    this.clickPosition = [lat, lng];
    this.askUserForMealType();
};

Controller.prototype.initialiseFacebookInController = function() {
    this.userAuth.initialiseFacebook();
};

Controller.prototype.displayMarkerPrompt = function() {
    var self = this;
    $('#prompt').fadeIn({queue: false, duration: 'slow'});
    $('#prompt').animate({
            height: "310px"
        }, 600, function(){
    });
    $('#prompt').css("z-index", ++self.maxZIndex);
    $('#promptBackground').fadeIn(600);
    $('#promptBackground').css("z-index", self.maxZIndex);
};

Controller.prototype.hideMarkerPrompt = function() {
    $('#prompt').animate({
            height: "0px"
        }, 600, function() { });
    $('#prompt').fadeOut({queue: false, duration: 'slow'});
    $('#promptBackground').fadeOut(600);
};

Controller.prototype.closeAllPopUpsOnBackgroundClick = function() {
    var self = this;
    $('#promptBackground').click(function() {
        self.hideMarkerPrompt();
        self.hideLoginPrompt();
        self.hideAbout();
        self.hideContactPrompt();
        self.hideSpamPrompt();
    });
    $(document).keydown(function(e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            self.hideMarkerPrompt();
            self.hideLoginPrompt();
            self.hideAbout();
            self.hideContactPrompt();
            self.hideSpamPrompt();
        }
    });
};

Controller.prototype.setMarkerPromptSubmitHandler = function(handler) {
    var self = this;
    $("#submit").click(function() {

        var message = $('#personalMessageBox').val();
        if (message.length !== 0){
            message = '"' + message + '"';
        }
        var lat = self.clickPosition[0];
        var lng = self.clickPosition[1];


        var time = $('#time :selected').text();
        var hour = parseInt(time);
        var min = parseInt(time.substring(3,time.length));
        var ampm = $('#ampm :selected').text();
        
        // add 12 hours if pm is selected
        if (ampm === 'pm') hour += 12;

        // special case for 12.00 : weird bug, resolved with this
        if (ampm === 'am' && hour == 12) {
            hour = 24;
        } else if (ampm === 'pm' && hour == 24) {
            hour = hour - 12;
        }

        var mealTime = new Date();
        mealTime.setHours(hour);
        mealTime.setMinutes(min);
        //date + 1 if time is less than now
        var now = new Date();
        if (mealTime < now){
            var todayDate = mealTime.getDate() + 1;
            mealTime.setDate(todayDate);
        }
        self.hideMarkerPrompt();
        
        // Auto select meal type based on meal time
        if (hour >= 5 && hour <= 10) {
            mealPreference = "breakfast";
        }
        else if (hour === 11) {
            mealPreference = "brunch";
        }
        else if (hour >= 12 && hour <= 14) {
            //alert(hour);
            mealPreference = "lunch";
        }
        else if (hour >= 15 && hour <= 16) {
            mealPreference = "high tea";
        }
        else if (hour >= 17 && hour <= 21) {
            mealPreference = "dinner";
        }
        else if (hour >= 22 && hour <= 24) {
            mealPreference = "supper";
        }

        else if (hour >= 0 && hour <= 4) {
            mealPreference = "supper";
        }
        handler(lat, lng, mealPreference, message, mealTime);
    });    
}

//Dislay 'spam' prompt if a user creates more than 1 marker of the same meal type
Controller.prototype.displaySpamPrompt = function(oldMarker) {
    var self = this;
    $('#spamPrompt').fadeIn({queue: false, duration: 'slow'});
    $('#spamPrompt').animate({
            height: "200px"
        }, 600, function(){
    });
    $('#spamPrompt').css('z-index', ++self.maxZIndex);
    $('#promptBackground').fadeIn(600);
    $('#promptBackground').css('z-index', self.maxZIndex);
    $('#spamPrompt').html(
        "<h1 style='text-align: center'>Oops! Sorry but...</h1>" +
        "<h3 style='text-align: center;'>" +
        "You are already having " + oldMarker.mealType + " later.<br>" +
        "Please delete your old " + oldMarker.mealType + " marker to place a new one." +
        "</h3>");
}
//hide 'spam' prompt
Controller.prototype.hideSpamPrompt = function() {
    $('#spamPrompt').animate({
            height: "0px"
        }, 600, function(){
    });
    $('#spamPrompt').fadeOut({queue: false, duration: 'slow'});
    $('#promptBackground').fadeOut(600);
}

Controller.prototype.displayLoginPrompt = function() {
    var self = this;
    $('#loginPrompt').fadeIn({queue: false, duration: 'slow'});
    $('#loginPrompt').animate({
            height: "200px"
        }, 600, function(){
    });
    $('#loginPrompt').css('z-index', ++self.maxZIndex);
    $('#promptBackground').fadeIn(600);
    $('#promptBackground').css('z-index', self.maxZIndex);
};

Controller.prototype.displayContactPrompt = function() {
    var self = this;
    $('#feedback').click(function(){
        $('#contact').fadeIn({queue: false, duration: 'slow'});
        $('#contact').animate({
                height: "300px"
            }, 600, function(){
        });
        $('#contact').css('z-index', ++self.maxZIndex);
        $('#promptBackground').fadeIn(600);
        $('#promptBackground').css('z-index', self.maxZIndex);
    });
};

Controller.prototype.hideLoginPrompt = function() {
    $('#loginPrompt').animate({
            height: "0px"
        }, 600, function(){
    });
    $('#loginPrompt').fadeOut({queue: false, duration: 'slow'});
    $('#promptBackground').fadeOut(600);
};

Controller.prototype.hideContactPrompt = function() {
        $('#contact').animate({
            height: "0px"
        }, 600, function(){
    });
    $('#contact').fadeOut({queue: false, duration: 'slow'});
    $('#promptBackground').fadeOut(600);
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

Controller.prototype.loginHasFinished = function() {
    if (this.pendingMarkerInfo) {
        console.log(this.userAuth.userID);
        var info = this.pendingMarkerInfo;
        this.createAndStoreMarker(info.lat, info.lng, info.mealType, info.message, info.mealTime);
        this.pendingMarkerInfo = null;
    }
    if (this.pendingMarkerToJoin) {
        var marker = this.pendingMarkerToJoin;
        this.chatService.joinRoom(marker.getRoomCode());
        this.chatService.openChat(marker.userName, marker.getRoomCode(), marker.mealType, marker.mealTime);
        this.pendingMarkerToJoin = null;
    }
};

google.maps.event.addDomListener(window, 'load', initialise);

function checkLoginState() {
    controller.userAuth.checkLoginState();
}
