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
    this.chatService = new ChatService();
    this.closeAllPopUpsOnBackgroundClick();
    this.toggleHomeDescription();
    this.displayAbout();
}

Controller.prototype.displayAbout = function() {
    $('.about').click(function(){
        console.log("ABOUT CLICKED");
        $('#aboutWindow').fadeIn({queue: false, duration: 'slow'});
        $('#aboutWindow').animate({
                height: "500px"
            }, 600, function(){
        });
        $('#promptBackground').fadeIn(600);
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
                    self.initialiseFacebookInController();
            });
            self.homeDescriptionOpen = true;
        }
    });
};

Controller.prototype.updatePeopleCount = function(markers) {
    this.markers = markers;
    document.getElementById('hungryPeopleStatus').innerHTML = '<h2>Hungry people count: '
    + markers.length + '</h2>';
};

Controller.prototype.askUserForMealType = function() {
    this.displayMarkerPrompt();
    this.closeAllPopUpsOnBackgroundClick();
    this.setMarkerPromptSubmitHandler(this.handleMarkerPromptSubmit);
};

Controller.prototype.handleMarkerPromptSubmit = function(lat, lng, mealType, message, mealTime) {
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
    // store marker
    this.storageManager.addMarker(marker);
    // retrieve and render marker
    var markers = this.storageManager.markers;
    this.map.renderMarkers(markers);
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
        self.hideAbout();
    });
    $(document).keydown(function(e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            self.hideMarkerPrompt();
            self.hideLoginPrompt();
            self.hideAbout();
        }
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


        //var hour = parseInt($('#hour :selected').text());
        //var min = parseInt($('#min :selected').text());

        var time = $('#time :selected').text();
        var hour = parseInt($('#time :selected').text()); // correct
        var min = parseInt(time.substring(3,time.length));
        var ampm = $('#ampm :selected').text();
        

        if (ampm === 'pm') hour += 12;
        var mealTime = new Date();
        mealTime.setHours(hour);
        mealTime.setMinutes(min);
        //date + 1 if time is less than now
        var now = new Date();
        if (mealTime < now){
            var todayDate = mealTime.getDate() + 1;
            mealTime.setDate(todayDate);
        }
        // do some validation
        if (mealPreference == undefined) {
            alert('Please indicate meal type');
            return;
        }
        self.hideMarkerPrompt();
        handler(lat, lng, mealPreference, message, mealTime);


        
        

        //alert(time);
        alert(hour); // correct
        alert(min);

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
};

google.maps.event.addDomListener(window, 'load', initialise);

function checkLoginState() {
    controller.userAuth.checkLoginState();
}
