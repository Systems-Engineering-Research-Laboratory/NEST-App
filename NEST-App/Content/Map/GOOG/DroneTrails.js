var droneTrails = {
    waypointMarker: null,
    dropMarkerListener: null,
    trailArray: [],
    uavTrails : [{
        id: 0,
        counter: 0,
        trail: []
    }],

    //store uav trails
    //still working on it
    //todo: make the counter responsive to the actual update rate
    storeTrail: function (uavID, location) {
        var notCreated;
        var trailMarker = new google.maps.Marker({
            position: location,
            icon: mapStyles.uavTrail
        });

        for (var i = 0; i < this.uavTrails.length; i++) {
            if (this.uavTrails[i].id === uavID) {
                //set trail
                if (this.uavTrails[i].trail.length < 100) {
                    if (this.uavTrails[i].counter == 0 || this.uavTrails[i].counter == 100) {
                        this.uavTrails[i].trail.push(trailMarker);

                        if (this.uavTrails[i].counter == 100)
                            this.uavTrails[i].counter = 0
                    }

                    this.uavTrails[i].counter++;
                }
                else {
                    if (this.uavTrails[i].counter == 0 || this.uavTrails[i].counter == 100) {
                        this.uavTrails[i].trail[0].setMap(null);
                        this.uavTrails[i].trail.shift();
                        this.uavTrails[i].trail.push(trailMarker);

                        if (this.uavTrails[i].counter == 100)
                            this.uavTrails[i].counter = 0;
                    }

                    this.uavTrails[i].counter++;
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
                counter: 0,
                trail: []
            });
            this.storeTrail(uavID, location);
        }
    },

    //This function needs to be updated before it's reimplemented, if it even needs to;
    //I think this function's function can be accomplished in the DroneSelection.SelectionStateChanged(args) call
    deleteTrails: function (uavID) {
        for (var i = 0; i < this.uavTrails.length; i++) {
            if (this.uavTrails[i].id == uavID) {
                if (this.uavTrails[i].trail != undefined) {
                    for (var j = 0; j < (this.uavTrails[i].trail.length - 1) ; j++) {
                        this.uavTrails[i].trail[j].setMap(null);
                    }
                }

                break;
            }
        }
        
    },

    // click on map to set a waypoint
    // todo: make a cancel button
    // still working on it
    clickToGo: function () {
        if (selectedUAV != null) {
            mapFunctions.goTo_hide();
            var that = this;

            //setting dropMarkerListener
            this.dropMarkerListener = google.maps.event.addListener(map, 'click', function (event) {
                that.goWaypoint(event.latLng.lat(), event.latLng.lng());
                mapFunctions.ConsNotifier(this, event.latLng.lat(), event.latLng.lng(), "", "");
                
            });

            $("#UAVId").html("Select an UAV first");
            $("#goBtn").addClass("disabled");
            $("#clickToGoBtn").addClass("disabled");
        }
    },

    //still working on it -David
    
    goWaypoint: function (lat, lng) {
        //vehicleHub.server.ackCommand({
        //    CommandId: cmd.Id,
        //    CommandType: "waypoint",
        //    Reason: "OK",
        //    Accepted: true
        //}, cmd.connId);

        console.log("original waypoints");
        console.log(selectedUAV.Mission.Waypoints);

        vehicleHub.server.sendCommand({
            Latitude: lat,
            Longitude: lng,
            Altitude: 400,
            UAVID: selectedUAV.Id
        });   
    }
};