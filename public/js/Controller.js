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
    this.currentChatID = null;
    this.userAuth = new UserAuth();
    this.map = new Map();
    this.map.registerClickHandler(this);
    this.storageManager = new StorageManager();
    this.storageManager.registerObserver(this);
    this.storageManager.syncWithServer();
    this.clickPosition = null;
    this.pendingMarkerInfo = null;
    this.chatService = new ChatService();
    this.closeAllPopUpsOnBackgroundClick();
}

Controller.prototype.updatePeopleCount = function(markers) {
    document.getElementById('hungryPeopleStatus').innerHTML = '<h2>Hungry people count: '
    + markers.length + '</h2>';
};

Controller.prototype.askUserForMealType = function() {
    this.displayMarkerPrompt();
    this.closeAllPopUpsOnBackgroundClick();
    this.setMarkerPromptSubmitHandler(this.handleMarkerPromptSubmit);
};

Controller.prototype.handleMarkerPromptSubmit = function(lat, lng, mealType, message, mealTime, timeString) {
    var self = this;
    if (!(this instanceof Controller)) {
        self = this.controller;
    }

    if (self.userAuth.isLogin == false) {
        self.displayLoginPrompt();
        self.pendingMarkerInfo = {
            lat: lat,
            lng: lng,
            mealType: mealType,
            message: message,
            mealTime: mealTime,
            timeString: timeString
        };
    } else {
        self.createAndStoreMarker(lat, lng, mealType, message, mealTime, timeString);
    }
};

Controller.prototype.createAndStoreMarker = function(lat, lng, mealType, message, mealTime, timeString) {
    var marker = new Marker();
    marker.userName = this.userAuth.userName;
    marker.userID = this.userAuth.userID;
    marker.lat = lat;
    marker.lng = lng;
    marker.mealType = mealType;
    marker.message = message;
    marker.mealTime = mealTime;
    marker.timeString = timeString;
    console.log("createAndStoreMarker: " + marker.timeString);
    console.log(marker);
    // store marker
    this.storageManager.addMarker(marker);
    this.storageManager.syncWithServer();
    // retrieve and render marker
    var markers = this.storageManager.markers;
    this.map.renderMarkers(markers);
    // join chat room for marker
    this.chatService.joinRoom(marker.getRoomCode());
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

Controller.prototype.closeAllPopUpsOnBackgroundClick = function() {
    var self = this;
    $('#promptBackground').click(function() {
        self.hideMarkerPrompt();
        self.hideLoginPrompt();
        self.chatService.hideChat();
    });
};

Controller.prototype.setMarkerPromptSubmitHandler = function(handler) {
    var self = this;
    $("#submit").click(function() {
        var mealPreference = $('input[name=meal]:checked').val();
        var message = $('#personalMessageBox').val();
        if (message.length !== 0){
            message = '"' + message + '"';
        }
        var lat = self.clickPosition[0];
        var lng = self.clickPosition[1];
        var hour = $('#hour :selected').text();
        var min = $('#min :selected').text();
        var ampm = $('#ampm :selected').text();
        var mealTime = "";
        if (ampm === "am"){
            mealTime = hour + ':' + min;
        }else{
            var hourInt = parseInt(hour);
            hourInt = (hourInt + 12) % 24;
            hour = hourInt.toString();
            mealTime = hour + ':' + min;
        }
        var timeString = new Date();
        timeString.setHours(hour);
        timeString.setMinutes(min);
        console.log("setMarkerPromptSubmitHandler" + timeString);
        // do some validation
        if (mealPreference == undefined) {
            alert();
            return;
        }
        self.hideMarkerPrompt();
        handler(lat, lng, mealPreference, message, mealTime, timeString);
    });    
}

Controller.prototype.displayLoginPrompt = function() {
    $('#loginPrompt').fadeIn({queue: false, duration: 'slow'});
    $('#loginPrompt').animate({
            height: "200px"
        }, 600, function(){
    });
    $('#promptBackground').fadeIn(600);
};

Controller.prototype.hideLoginPrompt = function() {
    $('#loginPrompt').animate({
            height: "0px"
        }, 600, function(){
    });
    $('#loginPrompt').fadeOut({queue: false, duration: 'slow'});
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
        this.createAndStoreMarker(info.lat, info.lng, info.mealType, info.message);
    }
    this.chatService.joinChatRoomForOwnMarkers(this.storageManager.markers);
};

google.maps.event.addDomListener(window, 'load', initialise);

function checkLoginState() {
    controller.userAuth.checkLoginState();
}
