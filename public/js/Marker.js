function Marker() {
    this.userName = "";
    this.userID = 0;
    this.lat = 0;
    this.lng = 0;
    this.message = "";
    this.mealType = "";
    this.mapMarker = null;
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
};

Marker.prototype.deleteFromMap = function() {
    this.mapMarker.setMap(null);
};

/*Marker.prototype.showInfoWindow = function(map) {
    if (this.mapMarker == null) return;

    var infoWindow = new google.maps.InfoWindow({
        content: "holding..."
    });

    this.mapMarker.html = 'Meal Preference: ' + this.mealPreference
        + '<br><div id = "deleteMarker"><b>Delete Marker</b></div>';

    infoWindow.setContent(this.mapMarker.html);
    infoWindow.open(map,this);
    $('#deleteMarker').click(function(){
        this.deleteFromMap();
    });
};*/

Marker.prototype.toDictionary = function() {
    return {
        lat: this.lat,
        lng: this.lng,
        message: this.message,
        mealType: this.mealType,
        userID: this.userID,
        userName: this.userName
    }
};

Marker.prototype.updateWithDictionary = function(dict) {
    if (dict.lat) this.lat = dict.lat;
    if (dict.lng) this.lng = dict.lng;
    if (dict.message) this.message = dict.message;
    if (dict.mealType) this.mealType = dict.mealType;
    if (dict.userID) this.userID = dict.userID;
    if (dict.userName) this.userName = dict.userName;
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
