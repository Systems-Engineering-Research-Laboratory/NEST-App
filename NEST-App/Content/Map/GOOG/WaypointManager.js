
function WaypointManager() {
    //Stores the schedules for each UAV. This is how it keeps track of assigning UAVs to missions
    this.schedules = [];
    //The missions. Not stored in any particular order. 
    this.missions = [];
    //Markers. Not sure if references are needed to be stored to the markers.
    this.markers = [];
    //That is a reference this object. It allows the object to reference itself in any callbacks created
    //within the scope of this function body.
    var that = this;

    //Get all the schedules. Note that this will pull schedules that the UAV may or may not be on. The
    //function needs to be improved, or a better API call needs to be added, like allactiveschedules or
    //something
    $.ajax({
        url: '/api/schedule',
        type: 'GET'
    }).success(function (data, textStatus, jqXHR) {
        //Direct store, server returns an array
        that.schedules = data;
    });

    //Get all the missions in the database. Once again, this will probably grab way too many missions in
    //a normal case, but generally there aren't a lot of missions in the database.
    $.ajax({
        url: '/api/missions',
        type: 'GET'
    }).success(function (data, textStatus, jqXHR) {
        //Direct store, server turns an array
        that.missions = data;
    });

    //Add a callback to the listener. This is the best way to not have its own code.
    this.addMarker = function (marker) {
        google.maps.event.addListener(marker, 'icon_changed', function () {
            that.handleIconChanged(this);
        });
        this.markers.push(marker);
    }

    //This is just another function that is called in the back. IT allows more use of the this instead of using
    //using the that var. 
    this.handleIconChanged = function (marker) {
        //The marker is our way of assigning uavs to clicks. Without, we have no way to get the info about the path
        //and mission.
        if (!marker.uav) {
            return;
        }
        var uav = marker.uav;
        var Id = uav.Id;
        //Find the schedule corresponding to this uav. Ensure that the current mission is in it, or else we can't find
        //the path.
        var sched = this.getScheduleByUavId(Id);
        if (sched == null || !sched.CurrentMission) {
            return;
        }
        var miss = this.getMissionByMissionId(sched.CurrentMission);
        if (miss) {
            if (marker.icon.fillColor === "green") {
                //This was a selection, we need to display the waypoints
                this.displayWaypointsPerMission(miss)
            }
            else {
                //This was a deslection, we need to hide the waypoints.
                this.hideWaypointsPerMission(miss);
            }
        }
    }

    //This function hides the waypoints for the given mission. This involves hiding the polyline, then the waypoint
    //circles. 
    this.hideWaypointsPerMission = function (mission) {
        //If we have the flight path, set it to hide.
        if(mission.flightPath) {
            mission.flightPath.setVisible(false);
        }
        //Go through and hide the waypoints now.
        var wps = mission.Waypoints;
        if (wps) {
            this.hideWaypointMarkers(wps);
        }
    }
    
    //Hides each waypoint marker by making it not visible. Better than setMap(null).
    this.hideWaypointMarkers = function (wps) {
        for(var i = 0; i < wps.length; i++){
            var wp = wps[i];
            if (wp.circle) {
                wp.circle.setVisible(false);
            }
        }
    }

    //Helper
    this.getScheduleByUavId = function (id) {
        for (var i = 0; i < this.schedules.length; i++) {
            if (this.schedules[i].UAVId == id) {
                return this.schedules[i];
            }
        }
        return null;
    }

    //This function displays the waypoints. There's three cases to address: 
    //1. We don't have the waypoints stored in the mission
    //2. The waypoints are stored, but we created the drawings yet
    //3. The drawings were created already.
    this.displayWaypointsPerMission = function (mission) {
        if (!mission.Waypoints) {
            //Case 1, get the waypoints from the server
            $.ajax({
                url: '/api/missions/waypoints/' + mission.Id,
                type: 'GET'
            }).success(function (data, textStatus, jqXHR) {
                //Case 1 then 2: now display the waypoints for the mission waypoints.
                mission.Waypoints = data;
                //Now display
                that.displayWaypointsPerMission(mission);
            });
            //Ajax is asynchronous, so just return the function.
            return;
        } else {
            //Just create or draw the waypoints markers if we have the markers
            this.createOrDrawWaypointMarkers(mission);
        }
        //If we have the flight path just draw it.
        if (mission.flightPath) {
            mission.flightPath.setVisible(true)
        }
        else {
            //Create it
            this.createFlightPath(mission);
        }
    }

    //This function either displays the waypoint circles if we already have them, or creates them if we don't
    this.createOrDrawWaypointMarkers = function (mission) {
        var wps = mission.Waypoints;
        for (var i = 0; i < wps.length; i++) {
            var wp = wps[i];
            //If it is not in the waypoint, then create it.
            if (!wp.circle) {
                this.createWaypointMarker(wp)
            }
            //Show it on the map.
            else if (wp.IsActive) {
                wp.circle.setVisible(true);
            }
        }
    }

    this.createWaypointMarker = function (wp) {
        //Draw a circle centered around the waypoint.
        var ll = new google.maps.LatLng(wp.Latitude, wp.Longitude);
        var wpOptions = {
            center: ll,
            map: map,
            strokeColor: '#0000FF', //blue
            strokeOpacity: 0.8,
            fillColor: '#0000FF', //blue
            fillOpacity: 0.5,
            radius: 10,
            zIndex: 2,
            visible: wp.IsActive,
        }
        wp.circle = new google.maps.Circle(wpOptions);
    }

    this.createFlightPath = function (mission) {
        var wps = mission.Waypoints;
        //There's no polyline to draw if there is only one point. This should never happen though (maybe 0, not 1)
        if (wps.length > 1) {
            //First point of the path is just the first wapyoint in the array.
            var curWp = wps[0];
            //This arary contains all the points of the path
            var points = [new google.maps.LatLng(curWp.Latitude, curWp.Longitude)]
            while (curWp.NextWaypointId) {
                //Get the next waypoint.
                var nextWp = this.getWaypointById(curWp.NextWaypointId, wps);
                //If the next wp exists, then we add it to the list, and point curWp at the new waypoint.
                if (nextWp) {
                    var next = new google.maps.LatLng(nextWp.Latitude, nextWp.Longitude);
                    points.push(next);
                    curWp = nextWp;
                }
                else {
                    //Avoid null pointer. Just stop here.
                    break;
                }
            }
            //Finally create the flight path.
            var flightPath = new google.maps.Polyline({
                path: points,
                strokeColor: '#0000FF',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                zIndex: 1,
            });
            flightPath.setMap(map);
            //Add reference
            mission.flightPath = flightPath;
        }
    }

    this.getMissionByMissionId = function(id) {
        return findElemInArrayById(id, this.missions);
    }

    this.getWaypointById = function(id, wps){
        return findElemInArrayById(id, wps);
    }
}

function findElemInArrayById(id, array) {
    for (var i = 0; i < array.length; i++) {
        var elem = array[i];
        if (elem.id && elem.id == id) {
            return elem;
        }
        else if (elem.Id && elem.Id == id) {
            return elem;
        }
    }
}