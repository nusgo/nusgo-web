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
    this.userAuth = new UserAuth();
    this.map = new Map();
    this.map.registerClickHandler(this);
    this.storageManager = new StorageManager();
    this.clickPosition = null;
}

Controller.prototype.askUserForMealType = function() {
    this.displayMarkerPrompt();
    this.closeMarkerPromptOnBackgroundClick();
    this.setMarkerPromptSubmitHandler(this.handleMarkerPromptSubmit);
};

Controller.prototype.handleMarkerPromptSubmit = function(lat, lng, mealType, message) {
    var self = this.controller;

    if (self.userAuth.isLogin == false) {
        self.displayLoginPrompt();
    } else {
        // create marker
        var marker = new Marker();
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
            height: "300px"
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

google.maps.event.addDomListener(window, 'load', initialise);
