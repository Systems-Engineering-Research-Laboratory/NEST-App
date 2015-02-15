
function WaypointManager() {
    this.schedules = [];
    this.markers = [];
    var that; //that's the stuff
    $.ajax({
        url: '/api/schedule',
        type: 'GET'
    }).success(function (data, textStatus, jqXHR) {
        this.schedules = data;
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
        if (marker.icons.fillColor === "green") {
            this.displayWaypointsPerMission(sched.CurrentMission)
        }
        else {
            //TODO: implement this function
            //this.hideWaypointsPerMission(sched.CurrentMission);
        }
    }

    this.getScheduleById = function (id) {
        for (var i = 0; i < this.schedules.length; i++) {
            if (schedules[i].UAVId == id) {
                return schdules[i].UAVId
            }
        }
        return null;
    }

    this.displayWaypointsPerMission = function (mission) {
        var wps = mission.Waypoints;
        for (var i = 0; i < wps.length; i++) {
            var wp = wps[i];
            if (wp.circle) {
                wp.circle.setMap(this.map);
            }
            else {
                var ll = new google.maps.LatLng(wp.Latitude, wp.Longitude);
                var wpOptions = {
                    center: ll,
                    map: this.map,
                    strokeColor: '#0000FF', //blue
                    strokeOpacity: 0.8,
                    fillColor: '#0000FF',
                    fillOpacity: 0.5,
                    radius: 10,
                }
                mission.point = new google.maps.Circle(wpOptions);
            }
        }
        if (mission.flightPath) {
            mission.flightPath.setMap(this.map)
        }
        else if (wps.length > 1) {
            var curWp = wps[0];
            var points = [new google.maps.LatLng(curWp.Latitude, curWp.Longitude)]
            while (curWp.NextWaypointId) {
                var nextWp = findWaypointById(id, wps);
                if (nextWp) {
                    var next = new googlemaps.LatLng(nextWp.Latitude, nextWp.Longitude);
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
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            flightPath.setMap(flightPath);
        }
    }
}

function findWaypointById(id, wps) {
    for (var i = 0; i < wps.length; i++) {
        if (wps[i].Id == id) {
            return wps[i];
        }
    }
    return null;
}