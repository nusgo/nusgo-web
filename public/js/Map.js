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
    // Delete all marker in currentMarkers from the map
    for(var i = 0; i < this.currentMarkers.length; i++) {
        this.currentMarkers[i].deleteFromMap();
    }
    while(this.currentMarkers.length > 0) { 
        this.currentMarkers.pop();
    };
    
    // Filter out duplicate markers
    markers = this.sieveMarkers(markers);

    // Render all markers in the map
    for(var i = 0; i < markers.length; i++) {
        markers[i].showInMap(this.map);
        this.currentMarkers.push(markers[i]);
    }

    //update people count
    controller.updatePeopleCount(this.currentMarkers);
};

Map.prototype.addMarker = function(marker) {
    var alreadyShown = false;
    for(var i = 0; i < this.currentMarkers.length; i++) {
        if (this.currentMarkers[i].equals(marker)) {
            alreadyShown = true;
            break;
        }
    }
    if (!alreadyShown) {
        marker.showInMap(this.map);
        this.currentMarkers.push(marker);
    }  
    //update people count
    controller.updatePeopleCount(this.currentMarkers);
};

Map.prototype.removeMarker = function(marker) {
    var targetMarkers = this.currentMarkers.filter(function(o) {
        return marker.equals(o);
    });
    for(var i = 0; i < targetMarkers.length; i++) {
        targetMarkers[i].deleteFromMap();
    }
    this.currentMarkers = this.currentMarkers.filter(function(o) {
        return !(marker.equals(o));
    });
    //update people count
    controller.updatePeopleCount(this.currentMarkers);
};

Map.prototype.sieveMarkers = function(markers) {
    for(var i = 0; i < markers.length-1; i++){
        for(var j = i + 1; j < markers.length; j++){
            marker1 = markers[i];
            marker2 = markers[j];
            if (marker1.lat == marker2.lat && marker1.lng == marker2.lng){
                markers.splice(j,1);
                j--;
            }
        }
    }
    return markers;
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
    var self = this;

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

        self.map.fitBounds(bounds);
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

Map.prototype.closeAllInfoWindows = function() {
    for(var i = 0; i < this.currentMarkers.length; i++) {
        this.currentMarkers[i].closeInfoWindow();
    }
};

