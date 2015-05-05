function StorageManager() {
    this.markers = []
}

// After this method is called, marker will be pushed to the server as well
StorageManager.prototype.addMarker = function(marker) {
    this.markers.push(marker);
};

// This method will remove marker from the server as well
StorageManager.prototype.removeMarker = function(marker) {
    this.markers = this.markers.filter(function(obj){
        return obj != marker;
    });
};

StorageManager.prototype.syncWithServer = function() {
    // will update this.markers property
};


