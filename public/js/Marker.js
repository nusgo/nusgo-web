function Marker() {
    this.lat = 0;
    this.lng = 0;
    this.message = "";
    this.mealType = "";
    this.mapMarker = null;
}

Marker.prototype.showInMap = function(map) {
    var latLng = new google.maps.LatLng(this.lat, this.lng);
    this.mapMarker = new google.maps.Marker({
        icon: 'img/sprites.gif',
        optimized: false,
        position: latLng,
        map: map,
        title: this.message
    });
    this.mapMarker.addListener(this.mapMarker, 'click', function() {
        this.showInfoWindow();
    });
};

Marker.prototype.deleteFromMap = function() {
    this.mapMarker.setMap(null);
};

Marker.prototype.showInfoWindow = function() {
    if (this.mapMarker == null) return;

    var infoWindow = new google.maps.InfoWindow({
        content: "holding..."
    });

    this.mapMarker.html = 'Meal Preference: ' + this.mealPreference
        + '<br><div id = "deleteMarker"><b>Delete Marker</b></div>';

    infoWindow.setContent(this.mapMarker.html);
    infowindow.open(map,this);
    $('#deleteMarker').click(function(){
        this.deleteFromMap();
    });
};

Marker.prototype.toDictionary = function() {
    return {
        lat: this.lat,
        lng: this.lng,
        message: this.message,
        mealType: this.mealType,
    }
};

Marker.prototype.updateWithDictionary = function(dict) {
    if (dict.lat) this.lat = dict.lat;
    if (dict.lng) this.lng = dict.lng;
    if (dict.message) this.message = dict.message;
    if (dict.mealType) this.mealType = dict.mealType;
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
