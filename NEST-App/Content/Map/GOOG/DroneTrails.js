//store uav trails
//still working on it
function storeTrail(uavID, location) {
    var notCreated;
    //if (!notCreated) {
    // //update trail
    // for (var j = 0; j < uavTrails[uavID].trail.length; j++) {
    // o -= 0.04;
    // s -= 0.04;
    // uavTrail = {
    // url: '../Content/img/blue.jpg',
    // fillOpacity: o,
    // scale: s,
    // anchor: new google.maps.Point(46 * s, 44 * s)
    // };
    // console.log(uavTrail);
    // }
    //}
    var trailMarker = new google.maps.Marker({
        position: location,
        icon: uavTrail
    });

    for (var i = 0; i < uavTrails.length; i++) {
        if (uavTrails[i].id === uavID) {
            //set trail
            if (uavTrails[i].trail.length <= 30) {
                uavTrails[i].trail.push(trailMarker);
            }
            else {
                uavTrails[i].trail[0].setMap(null);
                uavTrails[i].trail.shift();
                uavTrails[i].trail.push(trailMarker);
            }
            notCreated = false;
            break;
        }
        else {
            notCreated = true;
        }
    }

    if (notCreated) {
        //push new uavTrails
        uavTrails.push({
            id: uavID,
            trail: []
        });
        storeTrail(uavID, location);
    }
}

// click on map to set a waypoint
// todo: make a cancel button
// still working on it
function clickToGo() {
    if (selectedUAV != null) {
        goTo_hide();

        //setting dropMarkerListener
        dropMarkerListener = google.maps.event.addListener(mapListeners, 'click', dropWaypoint(event));

        //actually adding the listener to the map
        google.maps.event.addListener(mapListeners, 'click', dropWaypoint(event));
    }
}
//still working on it -David
function dropWaypoint(event) {
    if (dropMarkerListener != null) {
        //call function to create marker
        if (waypointMarker) {
            waypointMarker.setMap(null);
            waypointMarker = null;
        }
        waypointMarker = createMarker(event.latLng, "name", "<b>Location</b><br>" + event.latLng);

        // make uav fly to the dropped pin
        goWaypoint(event.latLng.lat(), event.latLng.lng());

        // remove listener so the marker can only be placed once
        google.maps.event.removeListener(dropMarkerListener);
        dropMarkerListener = null;
    }

        // reset selected uav if there's no waypoint
    else if (waypointMarker) {
        uavInfoWindow.close();
        otherInfoWindow.close();
    }
    else {
        for (i = 0; i < trailArray.length; i++) {
            trailArray[i].setMap(null);
        }
        selectedUAV = null;
        //uavInfoWindow.close();
    }
    $("#UAVId").html("Select an UAV first");
    $("#goBtn").addClass("disabled");
    $("#clickToGoBtn").addClass("disabled");
}

//still working on it -David
function goWaypoint(lat, long) {
    //vehicleHub.server.sendCommand({
    //    Id: 123,
    //    Latitude: lat,
    //    Longitude: long,
    //    Altitude: 400,
    //    UAVId: selectedUAV
    //});
}