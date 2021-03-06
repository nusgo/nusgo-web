var SocketEvents = Object.freeze({
    AddMarker: "addmarker",
    RemoveMarker: "removemarker",
    MarkerId: "markerid",
    Going: "going"
});

function StorageManager() {
    this.markers = [];
    this.socket = io();
    var self = this;
    this.socket.on(SocketEvents.AddMarker, function (markerInfo) {
        self.handleSocketAddMarker(markerInfo)
    });
    this.socket.on(SocketEvents.RemoveMarker, function (markerInfo) {
        self.handleSocketRemoveMarker(markerInfo);
    });
    this.socket.on(SocketEvents.Going, function (info) {
        var markerID = info.markerID;
        var user = info.user;
        for(var i = 0; i < self.markers.length; i++) {
            if (self.markers[i].id === markerID) {
                self.markers[i].appendGoingUser(user);
            }
        }
    })
    this.observers = [];
}

// Observer methods:
//  - onReceiveNewMarker(marker)
//  - onRemoveMarker(marker)
StorageManager.prototype.registerObserver = function(observer) {
    var alreadyRegistered = false;
    for(var i = 0; i < this.observers.length; i++) {
        if (observer === this.observers[i]) {
            alreadyRegistered = true;
            break;
        }
    }
    if (!alreadyRegistered) {
        this.observers.push(observer);
    }
};

// After this method is called, marker will be pushed to the server as well
StorageManager.prototype.addMarker = function(marker) {
    console.log("Pushing marker to server");
    this.markers.push(marker);
    this.socket.emit(SocketEvents.AddMarker, marker.toDictionary());
    this.socket.on(SocketEvents.MarkerId, function updateMarkerId(id) {
        marker.id = id;
        controller.chatService.joinRoom(id);
        console.log("ID received. Joining room %d", id);
    });
};

// This method will remove marker from the server as well
StorageManager.prototype.removeMarker = function(marker) {
    this.markers = this.markers.filter(function(obj){
        return obj !== marker;
    });
    this.socket.emit(SocketEvents.RemoveMarker, marker.toDictionary());
};

StorageManager.prototype.syncWithServer = function() {
    $.ajax({
        url: "/markers",
        context: this
    }).done(function(data) {
        var markerInfos = data;
        var markers = markerInfos.map(function(markerInfo) {
            var marker = new Marker();
            marker.updateWithDictionary(markerInfo);
            return marker;
        });
        console.log(markers);
        this.markers = markers;
        this.observers.map(function(observer) {
            if (observer.onRefreshMarkers) {
                observer.onRefreshMarkers(markers);
            }
        })
    });    
};

// protocol: a socket event with title "addMarker" must have the json
// representation of the marker in the event body.
StorageManager.prototype.handleSocketAddMarker = function(markerInfo) {
    var marker = new Marker();
    marker.updateWithDictionary(markerInfo);
    
    var duplicate = this.markers.filter(function(o) { return marker.equals(o); });
    if (duplicate.length == 0) {
        this.markers.push(marker);
        this.observers.map(function(observer) {
            if (observer.onReceiveNewMarker) {
                observer.onReceiveNewMarker(marker);
            }
        });
    }
};

StorageManager.prototype.handleSocketRemoveMarker = function(markerInfo) {
    var marker = new Marker();
    marker.updateWithDictionary(markerInfo);
    var containsMarker = false;
    for(var i = 0; i < this.markers.length; i++) {
        if (this.markers[i].equals(marker)) {
            containsMarker = true;
            break;
        }
    }
    if (containsMarker) {
        this.observers.map(function(observer) {
            if (observer.onRemoveMarker) {
                observer.onRemoveMarker(marker);
            }
        })
    }
};

StorageManager.prototype.onUserGoingToMarkerID = function(markerID) {
    var markers = this.markers.filter(function (m) {
        return m.id === markerID;
    });
    if (markers.length > 0) {
        var marker = markers[0];
        marker.appendGoingUser(controller.userAuth.user);
    }
};

StorageManager.prototype.isSpamMarker = function(marker) {
    var duplicates = this.markers.filter(function(m) {
        if (marker.userID != m.userID) return false;
        if (marker.mealType != m.mealType) return false;
        return true;
    });
    if (duplicates.length > 1) {
        console.log("WARNING: More than 1 spam marker with IDs:");
        console.log(duplicates.map(function(m) { return m.id; }));
    } 
    if (duplicates.length >= 1) {
        return true;
    } else {
        return false;
    }
};
