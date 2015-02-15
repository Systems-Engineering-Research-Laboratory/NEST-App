
function WaypointManager() {
    this.schedules = [];
    this.missions = [];
    this.markers = [];

    var that = this; //that's the stuff
    $.ajax({
        url: '/api/schedule',
        type: 'GET'
    }).success(function (data, textStatus, jqXHR) {
        that.schedules = data;
    });

    $.ajax({
        url: '/api/missions',
        type: 'GET'
    }).success(function (data, textStatus, jqXHR) {
        that.missions = data;
    });

    this.addMarker = function (marker) {
        google.maps.event.addListener(marker, 'icon_changed', function () {
            that.handleIconChanged(this);
        });
        this.markers.push(marker);
    }

    this.handleIconChanged = function (marker) {
        if (!marker.uav) {
            return;
        }
        var uav = marker.uav;
        var Id = uav.Id;
        var sched = this.getScheduleByUavId(Id);
        if (sched == null || !sched.CurrentMission) {
            return;
        }
        var miss = this.getMissionByMissionId(sched.CurrentMission);
        if (miss) {
            if (marker.icon.fillColor === "green") {
                this.displayWaypointsPerMission(miss)
            }
            else {
                //TODO: implement this function
                this.hideWaypointsPerMission(miss);
            }
        }
    }

    this.hideWaypointsPerMission = function (mission){
        if(mission.flightPath) {
            mission.flightPath.setVisible(false);
        }
        var wps = mission.Waypoints;
        if (wps) {
            this.hideWaypointMarkers(wps);
        }
    }
    
    this.hideWaypointMarkers = function (wps) {
        for(var i = 0; i < wps.length; i++){
            var wp = wps[i];
            if (wp.circle) {
                wp.circle.setVisible(false);
            }
        }
    }

    this.getScheduleByUavId = function (id) {
        for (var i = 0; i < this.schedules.length; i++) {
            if (this.schedules[i].UAVId == id) {
                return this.schedules[i];
            }
        }
        return null;
    }

    this.displayWaypointsPerMission = function (mission) {
        if (!mission.Waypoints) {
            $.ajax({
                url: '/api/missions/waypoints/' + mission.Id,
                type: 'GET'
            }).success(function (data, textStatus, jqXHR) {
                mission.Waypoints = data;
                that.displayWaypointsPerMission(mission);
            });
            return;
        } else {
            this.createWaypointMarkers(mission);
        }
        if (mission.flightPath) {
            mission.flightPath.setVisible(true)
        }
        else {
            this.createFlightPath(mission);
        }
    }

    this.createWaypointMarkers = function (mission) {
        var wps = mission.Waypoints;
        for (var i = 0; i < wps.length; i++) {
            var wp = wps[i];
            if (!wp.circle) {
                this.createWaypointMarker(wp)
            }
            else if (wp.IsActive) {
                wp.circle.setVisible(true);
            }
        }
    }

    this.createWaypointMarker = function (wp) {
        var ll = new google.maps.LatLng(wp.Latitude, wp.Longitude);
        var wpOptions = {
            center: ll,
            map: map,
            strokeColor: '#0000FF', //blue
            strokeOpacity: 0.8,
            fillColor: '#0000FF',
            fillOpacity: 0.5,
            radius: 10,
            zIndex: 2,
            visible: wp.IsActive,
        }
        wp.circle = new google.maps.Circle(wpOptions);
    }

    this.createFlightPath = function (mission) {
        var wps = mission.Waypoints;
        if(wps.length > 1) {
            var curWp = wps[0];
            var points = [new google.maps.LatLng(curWp.Latitude, curWp.Longitude)]
            while (curWp.NextWaypointId) {
                var nextWp = this.getWaypointById(curWp.NextWaypointId, wps);
                if (nextWp) {
                    var next = new google.maps.LatLng(nextWp.Latitude, nextWp.Longitude);
                    points.push(next);
                    curWp = nextWp;
                }
                else {
                    //Avoid null pointer
                    break;
                }
            }
            var flightPath = new google.maps.Polyline({
                path: points,
                strokeColor: '#0000FF',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                zIndex: 1,
            });
            flightPath.setMap(map);
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