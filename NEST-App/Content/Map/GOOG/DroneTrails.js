var droneTrails = {
    waypointMarker: null,
    dropMarkerListener: null,
    trailArray: [],
    uavTrails : [{
        id: 0,
        trail: []
    }],

    //store uav trails
    //still working on it
    storeTrail: function (uavID, location) {
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
            icon: mapStyles.uavTrail
        });

        for (var i = 0; i < this.uavTrails.length; i++) {
            if (this.uavTrails[i].id === uavID) {
                //set trail
                if (this.uavTrails[i].trail.length <= 30) {
                    this.uavTrails[i].trail.push(trailMarker);
                }
                else {
                    this.uavTrails[i].trail[0].setMap(null);
                    this.uavTrails[i].trail.shift();
                    this.uavTrails[i].trail.push(trailMarker);
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
            this.uavTrails.push({
                id: uavID,
                trail: []
            });
            this.storeTrail(uavID, location);
        }
    },

    //This function needs to be updated before it's reimplemented, if it even needs to;
    //I think this function's function can be accomplished in the DroneSelection.SelectionStateChanged(args) call
    /*google.maps.event.addListener(mapListeners, 'click', function (e) {
        if (selectedTrail != undefined) {
            for (var i = 0; i < (selectedTrail.length - 1) ; i++) {
                selectedTrail[i].setMap(null);
            }
            selectedUAV = null;
        }
    });*/

    // click on map to set a waypoint
    // todo: make a cancel button
    // still working on it
    clickToGo: function () {
        if (selectedUAV != null) {
            goTo_hide();

            //setting dropMarkerListener
            this.dropMarkerListener = google.maps.event.addListener(mapListeners, 'click', this.dropWaypoint(event));

            //actually adding the listener to the map
            google.maps.event.addListener(mapListeners, 'click', dropWaypoint(event));
        }
    },
    //still working on it -David
    dropWaypoint: function (event) {
        if (dropMarkerListener != null) {
            //call function to create marker
            if (this.waypointMarker) {
                this.waypointMarker.setMap(null);
                this.waypointMarker = null;
            }
            this.waypointMarker = createMarker(event.latLng, "name", "<b>Location</b><br>" + event.latLng);

            // make uav fly to the dropped pin
            this.goWaypoint(event.latLng.lat(), event.latLng.lng());

            // remove listener so the marker can only be placed once
            google.maps.event.removeListener(this.dropMarkerListener);
            this.dropMarkerListener = null;
        }

            // reset selected uav if there's no waypoint
        else if (this.waypointMarker) {
            uavInfoWindow.close();
            otherInfoWindow.close();
        }
        else {
            for (i = 0; i < this.trailArray.length; i++) {
                this.trailArray[i].setMap(null);
            }
            selectedUAV = null;
            //uavInfoWindow.close();
        }
        $("#UAVId").html("Select an UAV first");
        $("#goBtn").addClass("disabled");
        $("#clickToGoBtn").addClass("disabled");
    },

    //still working on it -David
    goWaypoint: function (lat, long) {
        //vehicleHub.server.sendCommand({
        //    Id: 123,
        //    Latitude: lat,
        //    Longitude: long,
        //    Altitude: 400,
        //    UAVId: selectedUAV
        //});
    }
};