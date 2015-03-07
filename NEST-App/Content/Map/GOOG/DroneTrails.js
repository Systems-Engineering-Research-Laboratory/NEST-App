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

    //displayWaypointsPerMission: function (mission) {
    //    var that = this;

    //    console.log(mission);

    //    if (mission.Waypoints.length == 0) {
    //        console.log("in displayWaypointPerMission !mission.waypoints");
    //        //Case 1, get the waypoints from the server
    //        $.ajax({
    //            url: '/api/missions/waypoints/' + mission.id,
    //            type: 'GET'
    //        }).success(function (data, textStatus, jqXHR) {
    //            //Case 1 then 2: now display the waypoints for the mission waypoints.
    //            mission.Waypoints = data;
    //            //Now display
    //            that.displayWaypointsPerMission(mission);
    //        });
    //        //Ajax is asynchronous, so just return the function.
    //        return;
    //    } else {
    //        console.log("in displayWaypointPerMission else");
    //        //Just create or draw the waypoints markers if we have the markers
    //        this.createOrDrawWaypointMarkers(mission);
    //    }

    //    this.createFlightPath(mission);
    //},

    //createOrDrawWaypointMarkers: function (mission) {
    //    console.log("in createOrDrawWaypointMarkers");
    //    var wps = mission.Waypoints;
    //    for (var i = 0; i < wps.length; i++) {
    //        var wp = wps[i];
    //        //If it is not in the waypoint, then create it.
    //        if (!wp.circle) {
    //            this.createWaypointMarker(wp)
    //        }
    //            //Show it on the map.
    //        else if (wp.IsActive) {
    //            wp.circle.setVisible(true);
    //        }
    //    }
    //},

    //createWaypointMarker: function (wp) {
    //    console.log("in createWaypointMarker");
    //    //Draw a circle centered around the waypoint.
    //    var ll = new google.maps.LatLng(wp.Latitude, wp.Longitude);
    //    var wpOptions = {
    //        center: ll,
    //        map: map,
    //        strokeColor: '#0000FF', //blue
    //        strokeOpacity: 0.8,
    //        fillColor: '#0000FF', //blue
    //        fillOpacity: 0.5,
    //        radius: 10,
    //        zIndex: 2,
    //        visible: wp.IsActive
    //    }
    //    wp.circle = new google.maps.Circle(wpOptions);
    //},

    //createFlightPath: function (mission) {
    //    var wps = mission.Waypoints;
    //    //There's no polyline to draw if there is only one point. This should never happen though (maybe 0, not 1)
    //    if (wps.length > 1) {
    //        console.log("in createFlightPath if");
    //        //First point of the path is just the first wapyoint in the array.
    //        var curWp = wps[0];
    //        //This arary contains all the points of the path
    //        var points = [new google.maps.LatLng(curWp.Latitude, curWp.Longitude)]
    //        while (curWp.NextWaypointId) {
    //            //Get the next waypoint.
    //            var nextWp = this.getWaypointById(curWp.NextWaypointId, wps);
    //            //If the next wp exists, then we add it to the list, and point curWp at the new waypoint.
    //            if (nextWp) {
    //                var next = new google.maps.LatLng(nextWp.Latitude, nextWp.Longitude);
    //                points.push(next);
    //                curWp = nextWp;
    //            }
    //            else {
    //                //Avoid null pointer. Just stop here.
    //                break;
    //            }
    //        }
    //        //Finally create the flight path.
    //        var flightPath = new google.maps.Polyline({
    //            path: points,
    //            strokeColor: '#0000FF',
    //            strokeOpacity: 1.0,
    //            strokeWeight: 2,
    //            zIndex: 1,
    //        });
    //        flightPath.setMap(map);
    //        //Add reference
    //        mission.flightPath = flightPath;
    //    }
    //}
};