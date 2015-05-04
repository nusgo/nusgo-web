var map;
var nus = new google.maps.LatLng(1.2956, 103.7767);
var dummyMarkers = [
	['Kang Soon', 1.2956, 103.7767, 'lunch'],
	['Kang Soon', 1.2958, 103.7770, 'dinner'],
	['Kang Soon', 1.2960, 103.7772, 'brunch']
];
var isLogin = false;
var socket = io();
socket.on('addmarker', onMarkerReceived);
var userID;


/*function detectMarkerSelect(){
	google.maps.addListener(maps,'click', function(){
		var lat = event.LatLng.lat();
		var lng = event.LatLng.lng();
		if (this ==)
	});

	var selectedMarkerIndex;

	for (var i = 0; i < dummyMarkers.length; i++){
		dummyMarker = dummyMarkers[i];
		if (lat == dummyMarker[1] && lng == dummyMarker[2]){
			selectedMarkerIndex = i;
		}
	}

	console.log("marker selected: " + selectedMarkerIndex);
}*/
function setMarkers(map){
	console.log("dummyMarkers length: " + dummyMarkers.length);
	for (var i = 0; i < dummyMarkers.length; i++){
		var dummyMarker = dummyMarkers[i];
		var myLatLng = new google.maps.LatLng(dummyMarker[1], dummyMarker[2]);
		var marker = new google.maps.Marker({
			position: myLatLng,
			map: map,
			title: dummyMarker[0]
		});

		console.log(dummyMarker[1] + "," + dummyMarker[2] + "," + dummyMarker[3]);
	}

	/*var infowindow = new google.maps.InfoWindow({
		content: 'Latitude: ' + lat + '<br>Longitude: ' + lng + '<br>Let\'s have <b>' + mealPreference + '</b>!'
		+ '<br>"' + message + '"'
		+ '<br><div id = "deleteMarker"><b>Delete Marker</b></div>'

		content: 'blah blah blah'
	});
	google.maps.event.addListener(marker,'click',function(){
		infowindow.open(map,marker);
		$('#deleteMarker').click(function(){
			marker.setMap(null);
		});
	});
	google.maps.event.addListener(marker,'rightclick',function(event){
		marker.setMap(null);
	});*/

	var numMarkers = dummyMarkers.length;
	$('#markerCount').html("Number of people available: " + numMarkers);
}


function initialize(){
	
	initialMapSetup();

	initialiseSearchBox();

	detectUserCurrentLocation();

	disableEnterKey();

	placeJioMarker();

	setMarkers(map);

	$('#notifications').click(function(){
		$('#promptBackground').fadeIn(600);
		$('#notificationsBox').fadeIn({queue: false, duration: 'slow'});
		$('#notificationsBox').animate({
				height: "800px"
			}, 600, function(){
		});
	});

	$('#promptBackground').click(function(){
		$('#promptBackground').fadeOut(600);
		$('#notificationsBox').animate({
				height: "0px"
			}, 600, function(){
		});
		$('#notificationsBox').fadeOut({queue: false, duration: 'slow'});
	});
}

//searchBox stuff//-----------------------------------------------------
function initialiseSearchBox(){
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

    	map.fitBounds(bounds);
 	 });

	google.maps.event.addListener(map, 'bounds_changed', function() {
    	var bounds = map.getBounds();
    	searchBox.setBounds(bounds);
  	});
}

//for placing jio markers//-------------------------------------------------
function placeJioMarker(){
	google.maps.event.addListener(map, 'click', function(event) {
		console.log("MAP CLICKED");
		lat = event.latLng.lat();
		lng = event.latLng.lng();
		placeMarker(lat,lng);
	});
}

function placeMarker(lat,lng) {

	$('#prompt').fadeIn({queue: false, duration: 'slow'});
	$('#prompt').animate({
			height: "300px"
		}, 600, function(){
	});
	$('#promptBackground').fadeIn(600);

	$('#promptBackground').click(function(){
		$('#prompt').animate({
				height: "0px"
			}, 600, function(){
		});
		$('#prompt').fadeOut({queue: false, duration: 'slow'});
		$('#promptBackground').fadeOut(600);
	});

	$("#submit").click(function() {
		if (isLogin == false){
			$('#prompt').animate({
					height: "0px"
				}, 600, function(){
			});
			$('#prompt').fadeOut({queue: false, duration: 'slow'});
			$('#loginPrompt').fadeIn({queue: false, duration: 'slow'});
			$('#loginPrompt').animate({
					height: "300px"
				}, 600, function(){
			});
		} else {
			console.log("Emitting marker " + location);
            socket.emit('addmarker', {
               	lat: lat,
               	lng: lng
            });
			updateMarkers(lat,lng);
			setMarkers(map);
		}
	});

	//due to change. After every click, send to datastore to update
	//Datastore return info and update entire map.
	//Which means, update map after every user action.
}

function updateMarkers(lat,lng){
			console.log("UPDATE MARKERS CALLED");
		    var mealPreference = $('input[name=meal]:checked').val();
		    var message = $('input[name=message]').val();
		    var newMarker = ['Test', lat, lng, mealPreference];
		    if (mealPreference != undefined){
		    	console.log("PUSHED");
		    	dummyMarkers.push(newMarker);
		    	console.log(newMarker);
			}
		    $('#prompt').animate({
					height: "0px"
				}, 600, function(){
			});
			$('#prompt').fadeOut({queue: false, duration: 'slow'});
			$('#promptBackground').fadeOut(600);
}

//for detecting uer current location//---------------------------------------
function detectUserCurrentLocation(){
	if(navigator.geolocation) {
	    browserSupportFlag = true;
	    navigator.geolocation.getCurrentPosition(function(position) {
	      	initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
	      	map.setCenter(initialLocation);
	    }, function() {
	      	handleNoGeolocation(browserSupportFlag);
	    });
	}
	// Browser doesn't support Geolocation
	else {
	    browserSupportFlag = false;
	    handleNoGeolocation(browserSupportFlag);
	}
}

function handleNoGeolocation(errorFlag) {
    if (errorFlag == true) {
      alert("Geolocation service failed.");
      initialLocation = nus;
    } else {
      alert("Your browser doesn't support geolocation. We've placed you in NUS, Singapore");
      initialLocation = nus;
    }
    map.setCenter(initialLocation);
}
//miscellenous/functional//-------------------------------------------

function initialMapSetup(){
	var mapProp = {
		center:nus,
		zoom:15,
		mapTypeId:google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
}

function disableEnterKey(){
	$(window).keydown(function(event){
		if (event.keyCode == 13){
			event.preventDefault();
		}
	});
}

//facebook login functions//-------------------------------------------
// This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      isLogin = true;
      testAPI();
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      isLogin = false;
      document.getElementById('status').innerHTML = 'Please log ' +
        'into this app.';
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      isLogin = false;
      document.getElementById('status').innerHTML = 'Please log ' +
        'into Facebook.';
    }
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  window.fbAsyncInit = function() {
  FB.init({
    appId      : '364948177043546',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.3' // use version 2.2
  });

  // Now that we've initialized the JavaScript SDK, we call 
  // FB.getLoginStatus().  This function gets the state of the
  // person visiting this page and can return one of three states to
  // the callback you provide.  They can be:
  //
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into
  //    your app or not.
  //
  // These three cases are handled in the callback function.

  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });

  };

  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  // Here we run a very simple test of the Graph API after login is
  // successful.  See statusChangeCallback() for when this call is made.
  function testAPI(lat,lng) {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      userID = response.id;
      console.log('Successful login for: ' + response.name + ', ' + userID);
      $('#loginButton').hide();
      document.getElementById('status').innerHTML =
        'Hello, ' + response.name + '!';
    });
    $('#loginPrompt').animate({
			height: "0px"
		}, 600, function(){
	});
	$('#loginPrompt').fadeOut({queue: false, duration: 'slow'});
	//updateMarkers(lat,lng);
	setMarkers();
  }

// Socket functions
function onMarkerReceived(marker) {
    console.log("Received marker at (%f, %f)", marker.lat, marker.lng);
}


  google.maps.event.addDomListener(window, 'load', initialize);
