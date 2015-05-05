function Map() {
    this.currentMarkers = []
    this.nus = new google.maps.LatLng(1.2956, 103.7767);
    var mapProp = {
        center:this.nus,
        zoom:15,
        mapTypeId:google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
    this.clickHandler = null;
    this.initialiseSearchBox();
    this.detectCurrentLocation();
}

Map.prototype.renderMarkers = function(markers) {
    console.log("Deleting %d markers", this.currentMarkers.length);
    // 1. Delete all marker in currentMarkers from the map
    for(var i = 0; i < this.currentMarkers.length; i++) {
        this.currentMarkers[i].deleteFromMap();
    }
    while(this.currentMarkers.length > 0) { 
        this.currentMarkers.pop();
    };
    
    console.log("Rendering %d markers", markers.length);
    // 2. Render all markers in the map
    for(var i = 0; i < markers.length; i++) {
        markers[i].showInMap(this.map);
        this.currentMarkers.push(markers[i]);
    }
    console.log("New current markers = ");
    console.log(markers);

};

Map.prototype.detectCurrentLocation = function() {
    var map = this.map;
    var browserSupportFlag;
    if(navigator.geolocation) {
        browserSupportFlag = true;
        navigator.geolocation.getCurrentPosition(function(position) {
            initialLocation = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude);
            map.setCenter(initialLocation);
        }, function() {
            this.handleNoGeolocation(browserSupportFlag);
        });
    } else { // Browser doesn't support Geolocation
        browserSupportFlag = false;
        this.handleNoGeolocation(browserSupportFlag);
    }
};

Map.prototype.handleNoGeolocation = function(errorFlag) {
    if (errorFlag == true) {
        alert("Geolocation service failed.");
        initialLocation = this.nus;
    } else {
        alert("Your browser doesn't support geolocation. We've placed you in NUS, Singapore");
        initialLocation = this.nus;
    }
    this.map.setCenter(initialLocation);
};

Map.prototype.initialiseSearchBox = function() {
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox((input));

    google.maps.event.addListener(searchBox, 'places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        var bounds = new google.maps.LatLngBounds();
        for (var i = 0, place; place = places[i]; i++) {
            var image = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            bounds.extend(place.geometry.location);
        }

        this.map.fitBounds(bounds);
    });

    var map = this.map;
    google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
    });
};

Map.prototype.registerClickHandler = function(obj) {
    this.clickHandler = obj;
    google.maps.event.addListener(this.map, 'click', function(event){
        lat = event.latLng.lat();
        lng = event.latLng.lng();
        obj.mapIsClicked(lat, lng);
    });

};


