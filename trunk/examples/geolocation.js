//var win = Titanium.UI.currentWindow;
win.backgroundColor = '#000';

var GOOGLE_API_KEY = "AIzaSyBbLABejRtICBTuKYo6Zt2Wa9t66L-aSl4";

// Hier ben ik
var latitude = 50;
var longitude = 5;

var isAndroid = false;
if (Titanium.Platform.name == 'android') {
	isAndroid = true;
}

Ti.include("version.js");
Ti.Geolocation.preferredProvider = "gps";
if (isIPhone3_2_Plus())
{
	//NOTE: starting in 3.2+, you'll need to set the applications
	//purpose property for using Location services on iPhone
	Ti.Geolocation.purpose = "GPS demo";
}

var waarbenikLabel = Titanium.UI.createLabel({
	text:'Waar ben ik ?: ',
	font:{fontSize:12, fontWeight:'bold'},
	color:'#fff',
	top:10,
	left:10,
	height:15,
	width:300
});
win.add(waarbenikLabel);

var waarbenik = Titanium.UI.createLabel({
	text:'-- nog onbekend --',
	font:{fontSize:12},
	color:'#fff',
	top:30,
	left:10,
	height:15,
	width:300
});
win.add(waarbenik);
var basicSliderLabel = Titanium.UI.createLabel({
	text:'500m' ,
	color:'#999',
	font:{
		fontFamily:'Helvetica Neue',
		fontSize:12
	},
	textAlign:'center',
	top:10,
	left: 180,
	width: 200,
	height:'auto'
});

var basicSlider = Titanium.UI.createSlider({
	min:50,
	max: 3000,
	value: 500,
	width:100,
	height:'auto',
	left: 120,
	top: 10,
	selectedThumbImage:'../images/slider_thumb.png',
	highlightedThumbImage:'../images/chat.png'
});

basicSlider.addEventListener('change',function(e)
{
	basicSliderLabel.text = Math.round(basicSlider.value) + 'm';
	Titanium.Geolocation.getCurrentPosition(waarbenik);
});

// For #806
basicSlider.addEventListener('touchstart', function(e)
{
	Ti.API.info('Touch started: '+e.value);
});
basicSlider.addEventListener('touchend', function(e)
{
	Ti.API.info('Touch ended: '+e.value);
});

basicSlider.value = 500; // For regression test purposes
win.add(basicSliderLabel);
win.add(basicSlider);

var search = Titanium.UI.createSearchBar({
	barColor:'#385292',
	showCancel:false,
	hintText:'search'
});

search.addEventListener('change', function(e)
{
	e.value; // search string as user types
});
search.addEventListener('return', function(e)
{
	search.blur();
});
search.addEventListener('cancel', function(e)
{
	search.blur();
});

var data = [];

// create table view
var tableview = Titanium.UI.createTableView({
	top: 50,
	data:data,
	search:search,
	searchHidden:true
});
win.add(tableview);

alert(1);
Titanium.Geolocation.getCurrentPosition(waarbenik);
alert(2);

// state vars used by resume/pause
var locationAdded = false;
//
//  SHOW CUSTOM ALERT IF DEVICE HAS GEO TURNED OFF
if (Titanium.Geolocation.locationServicesEnabled === false)
{
	Titanium.UI.createAlertDialog({title:'Waar ben ik', message:'Your device has geo turned off - turn it on.'}).show();
}
else
{
	Titanium.UI.createAlertDialog({title:'Waar ben ik', message:'Je Geo staat aan: mooi....'}).show();
	
	if (Titanium.Platform.name != 'android') {
		var authorization = Titanium.Geolocation.locationServicesAuthorization;
		Ti.API.info('Authorization: '+authorization);
		if (authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) {
			Ti.UI.createAlertDialog({
				title:'Bla1',
				message:'You have disallowed Titanium from running geolocation services.'
			}).show();
		}
		else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
			Ti.UI.createAlertDialog({
				title:'Bla2',
				message:'Your system has disallowed Titanium from running geolocation services.'
			}).show();
		}
	}

	//
	//  SET ACCURACY - THE FOLLOWING VALUES ARE SUPPORTED
	//
	// Titanium.Geolocation.ACCURACY_BEST
	// Titanium.Geolocation.ACCURACY_NEAREST_TEN_METERS
	// Titanium.Geolocation.ACCURACY_HUNDRED_METERS
	// Titanium.Geolocation.ACCURACY_KILOMETER
	// Titanium.Geolocation.ACCURACY_THREE_KILOMETERS
	//
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;

	//
	//  SET DISTANCE FILTER.  THIS DICTATES HOW OFTEN AN EVENT FIRES BASED ON THE DISTANCE THE DEVICE MOVES
	//  THIS VALUE IS IN METERS
	//
	Titanium.Geolocation.distanceFilter = 10;


	//
	// EVENT LISTENER FOR GEO EVENTS - THIS WILL FIRE REPEATEDLY (BASED ON DISTANCE FILTER)
	//
	var locationCallback = function(e)
	{
		alert ('location getriggered');
		if (!e.success || e.error)
		{
			//updatedLocation.text = 'error:' + JSON.stringify(e.error);
			//updatedLatitude.text = '';
			//updatedLocationAccuracy.text = '';
			//updatedLocationTime.text = '';
			Ti.API.info("Code translation: "+translateErrorCode(e.code));
			return;
		}
		longitude = e.coords.longitude;
		latitude = e.coords.latitude;
		var altitude = e.coords.altitude;
		var heading = e.coords.heading;
		var accuracy = e.coords.accuracy;
		var speed = e.coords.speed;
		var timestamp = e.coords.timestamp;
		var altitudeAccuracy = e.coords.altitudeAccuracy;
		waarbenik.text = latitude + "," + longitude;
		zoek_bars(latitude, longitude);

		// reverse geo
		Titanium.Geolocation.reverseGeocoder(latitude,longitude,function(evt)
		{
			if (evt.success) {
				var places = evt.places;
				if (places && places.length) {
					waarbenik.text = places[0].address;
				} else {
					waarbenik.text = "No address found";
				}
				Ti.API.debug("reverse geolocation result = "+JSON.stringify(evt));
			}
			else {
				Ti.UI.createAlertDialog({
					title:'Reverse geo error',
					message:evt.error
				}).show();
				Ti.API.info("Code translation: "+translateErrorCode(e.code));
			}
		});

		Titanium.API.info('geo - location updated: ' + new Date(timestamp) + ' long ' + longitude + ' lat ' + latitude + ' accuracy ' + accuracy);
	}; // einde function locationCallback
	
}

var addr = "";
if (Titanium.Platform.name == 'android')
{
	//  as the destroy handler will remove the listener, only set the pause handler to remove if you need battery savings
	Ti.Android.currentActivity.addEventListener('pause', function(e) {
		Ti.API.info("pause event received");
		if (locationAdded) {
			Ti.API.info("removing location callback on pause");
			Titanium.Geolocation.removeEventListener('location', locationCallback);
			locationAdded = false;
		}
	});
	Ti.Android.currentActivity.addEventListener('destroy', function(e) {
		Ti.API.info("destroy event received");
		if (locationAdded) {
			Ti.API.info("removing location callback on destroy");
			Titanium.Geolocation.removeEventListener('location', locationCallback);
			locationAdded = false;
		}
	});
	Ti.Android.currentActivity.addEventListener('resume', function(e) {
		if (!locationAdded) {
			Ti.API.info("adding location callback on resume");
			Titanium.Geolocation.addEventListener('location', locationCallback);
			locationAdded = true;
		}
	});
}

function zoek_bars(lat, lon) {
	// initialiseren 
	tableview.setData([]);

	var xhr = Titanium.Network.createHTTPClient();
	xhr.onload = function()
	{
		Ti.API.info('Bars opgevraagd');
		var searchResults = JSON.parse(this.responseText);
		if (searchResults.status =="OK")
			show_cafes(searchResults.results);
		else
			show_cafes([]);
	};
	
	xhr.onerror = function()
	{
		Ti.API.info('foutje met get');
	};
	
	xhr.open("GET","https://maps.googleapis.com/maps/api/place/search/json?location="+ lat + "," + lon + "&radius=" + basicSlider.value + "&type=cafe|night_club&sensor=false&key=" + GOOGLE_API_KEY);
	xhr.send();	
}

function show_cafes(results) {
	if (results.length > 0) {
		var i=0;
		while (i<results.length) {
			var res = results[i];
			var l = results[i].geometry.location;
			//alert(l.lat + ", " + l.lng);
			tableview.appendRow({title: res.name + " (afst: " + dist({lat:latitude, lon: longitude},{lat: l.lat, lon: l.lng}) + "m)" + "\n" + res.vicinity });
			//tableview.appendRow({title: res.name + "\n" + res.vicinity });
			i++;
		}		
	}
	else {
		tableview.appendRow([{title: 'niets gevonden'}]);
	}
}

function translateErrorCode(code) {
	if (code == null) {
		return null;
	}
	switch (code) {
		case Ti.Geolocation.ERROR_LOCATION_UNKNOWN:
			return "Location unknown";
		case Ti.Geolocation.ERROR_DENIED:
			return "Access denied";
		case Ti.Geolocation.ERROR_NETWORK:
			return "Network error";
		case Ti.Geolocation.ERROR_HEADING_FAILURE:
			return "Failure to detect heading";
		case Ti.Geolocation.ERROR_REGION_MONITORING_DENIED:
			return "Region monitoring access denied";
		case Ti.Geolocation.ERROR_REGION_MONITORING_FAILURE:
			return "Region monitoring access failure";
		case Ti.Geolocation.ERROR_REGION_MONITORING_DELAYED:
			return "Region monitoring setup delayed";
	}
}

Number.prototype.toRad = function() {  // convert degrees to radians 
  return this * Math.PI / 180; 
};
 

function dist(p1, p2) {
	var R = 6371000; // m
	var dLat = (p2.lat-p1.lat).toRad();
	var dLon = (p2.lon-p1.lon).toRad();
	p1.lat = p1.lat.toRad();
	p2.lat = p2.lat.toRad();
	
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(p1.lat) * Math.cos(p2.lat); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return Math.floor(d);
}

function waarbenik(e) {
	//
	// GET CURRENT POSITION - THIS FIRES ONCE
	//
		alert('a');
		if (!e.success || e.error)
		{
			//currentLocation.text = 'error: ' + JSON.stringify(e.error);
			Ti.API.info("Code translation: "+translateErrorCode(e.code));
			alert('error ' + JSON.stringify(e.error));
			return;
		}

		longitude = e.coords.longitude;
		latitude = e.coords.latitude;
		var altitude = e.coords.altitude;
		var heading = e.coords.heading;
		var accuracy = e.coords.accuracy;
		var speed = e.coords.speed;
		var timestamp = e.coords.timestamp;
		var altitudeAccuracy = e.coords.altitudeAccuracy;
		Ti.API.info('speed ' + speed);
		//alert('long:' + longitude + ' lat: ' + latitude);
		
		waarbenik.text = latitude + "," + longitude;
		Titanium.API.info('geo - current location: ' + new Date(timestamp) + ' long ' + longitude + ' lat ' + latitude + ' accuracy ' + accuracy);
		zoek_bars(latitude, longitude);
/*
		Titanium.Geolocation.reverseGeocoder(latitude,longitude,function(evt) {
			if (evt.success) {
				var places = evt.places;
				if (places && places.length) {
					waarbenik.text = places[0].address;
				} else {
					waarbenik.text = "No address found";
				}
				Ti.API.debug("reverse geolocation result = "+JSON.stringify(evt));
			}
			else {
				Ti.UI.createAlertDialog({
					title:'Reverse geo error',
					message:evt.error
				}).show();
				Ti.API.info("Code translation: "+translateErrorCode(e.code));
			}
		});
*/
}