function Marker() {
    this.id = null;
    this.userName = "";
    this.userID = 0;
    this.lat = 0;
    this.lng = 0;
    this.message = "";
    this.mealType = "";
    this.takenBy = null;
    this.mapMarker = null;
    this.map = null;
    this.infoWindow = null;
    this.mealTime = null;
}

Marker.prototype.showInMap = function(map) {
    var latLng = new google.maps.LatLng(this.lat, this.lng);
    var mealType = this.mealType;
    this.mapMarker = new google.maps.Marker({
        icon: 'img/'+ mealType + '.gif',
        optimized: false,
        position: latLng,
        map: map,
        title: this.message
    });
    this.map = map;
    var self = this;
    google.maps.event.addListener(this.mapMarker, 'click', function() {
        self.showInfoWindow();
    });
};

Marker.prototype.deleteFromMap = function() {
    this.mapMarker.setMap(null);
};

Marker.prototype.showInfoWindow = function() {
    var self = this;

    controller.map.closeAllInfoWindows();
    var messageHtml = safeConverter.makeHtml(this.message);
    var contentString =
        '<img id="profilePic" src="//graph.facebook.com/' + this.userID + '/picture?type=large" />'
        + '<b>' + this.userName + '</b> is hungry for <b>' + this.mealType + '</b>!<br>'
        + 'Time: <b>' + dateToTimeString(this.mealTime) + '</b>'
        + '<br>' + messageHtml;

    var currentUserID = controller.userAuth.userID;
    if (currentUserID === this.userID) {
        contentString += '<br><div id = "checkRequests"><b>Check Requests</b></div>';
        contentString += '<div id = "deleteMarker"><b>Delete Marker</b></div>';
    } else {
        if (true) { // andhieka : temporary solution :p
            contentString += '<br> <div id = "jioButton"><b>Jio me!</b></div>';
        } else if (this.takenBy === currentUserID) {
            contentString += '<br> <div id = "openChatButton"><b>Open Chat</b></div>';
        }
    }

    var infoWindow = new google.maps.InfoWindow({
        content: contentString
    });
    this.infoWindow = infoWindow;
    infoWindow.open(this.map, this.mapMarker);
    
    google.maps.event.addListener(infoWindow, 'domready', function() {
        $('#checkRequests').click(function() {
            controller.chatService.openChat(self.userName, self.getRoomCode(), self.mealType, self.mealTime);
        });
        $('#deleteMarker').click(function() {
            if (controller.userDidRemoveMarker) {
                controller.userDidRemoveMarker(self);
            }
        });
        $('#jioButton').click(function() {
            //Must check if user is logged in
            if(controller.userAuth.userID === 0){
                controller.displayLoginPrompt();
            } else {
                controller.chatService.joinRoom(self.getRoomCode());
                controller.chatService.openChat(self.userName, self.getRoomCode(), self.mealType, self.mealTime);
            }
        });
        $('#openChatButton').click(function() {
            controller.chatService.openChat(self.userName, self.getRoomCode());
        });
    });
};

Marker.prototype.getRoomCode = function() {
    return this.id;
};

Marker.prototype.closeInfoWindow = function() {
    if (this.infoWindow === null) return;
    this.infoWindow.close();
    this.infoWindow = null;
};

Marker.prototype.toDictionary = function() {
    return {
        id: this.id,
        lat: this.lat,
        lng: this.lng,
        message: this.message,
        mealType: this.mealType,
        userID: this.userID,
        userName: this.userName,
        mealTime: this.mealTime,
    }
};

Marker.prototype.updateWithDictionary = function(dict) {
    if (dict.id) this.id = dict.id;
    if (dict.lat) this.lat = dict.lat;
    if (dict.lng) this.lng = dict.lng;
    if (dict.message) this.message = dict.message;
    if (dict.mealType) this.mealType = dict.mealType;
    if (dict.userID) this.userID = dict.userID;
    if (dict.userName) this.userName = dict.userName;
    if (dict.mealTime) this.mealTime = new Date(dict.mealTime);
};

Marker.prototype.equals = function(other) {
    if (!(other instanceof Marker)) return false;
    if (other === this) return true;
    if (other === null) return false;
    if (other.id !== this.id) return false;
    return true;
};

function dateToTimeString(date) {
    var h = date.getHours();
    var pm = (h >= 12);
    h %= 12;
    if (h === 0) h = 12;
    var m = date.getMinutes();
    if (m < 10) m = '0' + m;
    return h + ':' + m + ' ' + (pm ? 'pm' : 'am');
}