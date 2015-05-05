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
