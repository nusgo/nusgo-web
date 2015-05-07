function Marker() {
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
    this.dateString = "insert-time-here";
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
    controller.map.closeAllInfoWindows();

    var contentString =
        '<img id="profilePic" src="//graph.facebook.com/' + this.userID + '/picture?type=large" />'
        + '<b>' + this.userName + '</b> is hungry for <b>' + this.mealType + '</b>!<br>'
        + '<b>' + this.dateString + '</b>'
        + '<br>' + this.message;

    var currentUserID = controller.userAuth.userID;
    if (currentUserID === this.userID) {
        contentString += '<br><div id = "checkRequests"><b>Check Requests</b></div>';
        contentString += '<div id = "deleteMarker"><b>Delete Marker</b></div>';
    } else {
        if (this.takenBy === null) {
            contentString += '<br> <div id = "jioButton"><b>Jio!</b></div>';
        } else if (this.takenBy === currentUserID) {
            contentString += '<br> <div id = "openChatButton"><b>Open Chat</b></div>';
        }
    }
    var infoWindow = new google.maps.InfoWindow({
        content: contentString
    });
    this.infoWindow = infoWindow;
    infoWindow.open(this.map, this.mapMarker);
    var self = this;
    google.maps.event.addListener(infoWindow, 'domready', function() {
        $('#deleteMarker').click(function() {
            if (controller.userDidRemoveMarker) {
                controller.userDidRemoveMarker(self);
            }
        });
        $('#jioButton').click(function() {
            controller.chatService.joinRoom(self.getRoomCode());
            controller.chatService.openChat(self.userName, self.getRoomCode());
        });
        $('#openChatButton').click(function() {
            controller.chatService.joinRoom(self.getRoomCode());
            controller.chatService.openChat(self.userName, self.getRoomCode());
        });
    });
};

Marker.prototype.getRoomCode = function() {
    return this.lat.toString() + this.lng.toString();
};

Marker.prototype.closeInfoWindow = function() {
    if (this.infoWindow === null) return;
    this.infoWindow.close();
    this.infoWindow = null;
};

Marker.prototype.toDictionary = function() {
    return {
        lat: this.lat,
        lng: this.lng,
        message: this.message,
        mealType: this.mealType,
        userID: this.userID,
        userName: this.userName,
        takenBy: this.takenBy
    }
};

Marker.prototype.updateWithDictionary = function(dict) {
    if (dict.lat) this.lat = dict.lat;
    if (dict.lng) this.lng = dict.lng;
    if (dict.message) this.message = dict.message;
    if (dict.mealType) this.mealType = dict.mealType;
    if (dict.userID) this.userID = dict.userID;
    if (dict.userName) this.userName = dict.userName;
    if (dict.takenBy) this.takenBy = dict.takenBy;
};

Marker.prototype.equals = function(other) {
    if (!(other instanceof Marker)) return false;
    if (other === this) return true;
    if (other === null) return false;
    if (other.lat !== this.lat) return false;
    if (other.lng !== this.lng) return false;
    if (other.message !== this.message) return false;
    if (other.mealType !== this.mealType) return false;
    // TODO: Check for user equality
    return true;
};
