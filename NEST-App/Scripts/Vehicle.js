
/**
* A class that represent a vehicle. It contains one mission and one command so far, as well as one flight state.
* The vehicle doesn't need to have more than that to run the simulation (for now at least). It comes with the
* functins that allow it to behave kind of autonomously. It just goes straight to it's destination.
*/
function Vehicle(vehicleInfo, reporter) {
    //Model stuff
    this.Id = vehicleInfo.Id;
    this.Callsign = vehicleInfo.Callsign;
    this.Mileage = vehicleInfo.Mileage;
    this.NumDeliveries = vehicleInfo.NumDeliveries;
    this.MaxVelocity = vehicleInfo.MaxVelocity;
    this.MaxVerticalVelocty = vehicleInfo.MaxVerticalVelocity;
    this.MaxAcceleration = vehicleInfo.MaxAcceleration;
    this.UpdateRate = vehicleInfo.UpdateRate;

    //Storing other entities related to UAV
    this.FlightState = vehicleInfo.FlightState;
    this.Schedule = vehicleInfo.Schedule;
    //This is the current mission the vehicle is on.
    this.Mission = vehicleInfo.Schedule.Missions[0];
    this.Schedule = vehicleInfo.Schedule;

    //The current base of the vehicle.
    this.Base = base;

    //Append the X&Y values of the base to the vehicle.
    LatLongToXY(this.Base);

    //This is just simulation stuff.
    this.Objective = null;
    this.Command = null;
    this.descending = true;
    this.reporter = reporter;
    
    //Allows for us to use this in the callback. Closures yo
    var that = this;
    //Used as callback to retrieve waypoints from the server.
    this.gotNewWaypoints = function (data) {
        if (data.length < 2) {
            that.generateWaypoints();
        }
        else {
            var wps = data.map(function (curVal) { return new Waypoint(curVal); });
            that.waypoints = wps;
            that.currentWaypoint = that.waypoints[0];
            that.waypoints[1].obj = that.Mission;
            that.waypoints[1].objType = "mission";
        }
    }

    //If the mission is defined, get the waypoints associated with it
    if (this.Mission) {
        this.reporter.retrieveWaypointsByMissionId(this.Mission.id, this, this.gotNewWaypoints);
    }


    this.setReporter = function (reporter) {
        this.reporter = reporter;
    }

    this.setPathGen = function (gen) {
        this.pathGen = gen;
    }

    
    this.appendLonLat = function (obj, point) {
        var pointText = point.Geography.WellKnownText
        var results = pointText.match(/-?\d+(\.\d+)?/g);
        obj.Longitude = parseFloat(results[0]);
        obj.Latitude = parseFloat(results[1]);
        obj.Altitude = parseFloat(results[2]);
        LatLongToXY(obj);
    }

    appendLonLatFromDbPoint(this.FlightState, this.FlightState.Position);
    if (this.Mission) {
        appendLonLatFromDbPoint(this.Mission, this.Mission.DestinationCoordinates);
    }

    //Functions. Careful not to add global helper functions here.
    this.process = function (dt) {
        //If the current waypoint is null but the reporter is pending, just return.
        if (this.currentWaypoint && this.reporter.pendingResult) {
            return;
        }
        //Process this waypoint if we have one
        if (this.currentWaypoint) {
            if (this.performWaypoint(dt)) {
                this.getNextWaypoint();
            }
        }
        //Well, I guess we have nothing better to do!
        else if (!this.isAtBase()) {
            this.backToBase(dt);
        }
            //Charging at base
        else {
            this.FlightState.BatteryLevel += 5 * dt / 18000;
            if (this.FlightState.BatteryLevel > 1) {
                this.FlightState.BatteryLevel = 1;
            }
            //Don't let the flight states get too stale, even if we are sitting at base.
            reporter.updateFlightState(this.FlightState);
            //Make sure we don't drop the battery level 
            return;
        }

        this.FlightState.BatteryLevel -= dt / 1800;

        reporter.updateFlightState(this.FlightState);
    };

    this.performWaypoint = function(dt) {
        var wp = this.currentWaypoint;
        //Get the original object, call the callback to perform the object specific functions
        if (wp.obj) {
            switch (wp.objType) {
                case "mission":
                    return this.performMission(dt, wp.obj);
                    break;
                case "command":
                    return this.performCommand(dt, wp.obj);
                    break;
            }
            //If we are done, returns true. Means we can consume the waypoint.
            
        }
        else {
            //Just go to, this is just a navigational point.
            return this.deadReckon(dt, wp.X, wp.Y);
        }
    }

    //Advances the aircraft directly towards its destination. Nothing fancy here.
    this.deadReckon = function (dt, X, Y) {
        var reachedDest = false;
        var velocity = 20; //m/s
        //Find the direction it wants to go there
        heading = calculateHeading(this.FlightState.X, this.FlightState.Y, X, Y);
        //Update the vehicle's yaw.
        //Put the heading into the flight state for when it gets pushed to the server.
        this.FlightState.Yaw = heading * rad2deg;
        console.log(this.FlightState.Yaw);
        this.approachSpeed(this.MaxVelocity, heading, dt);
        var distanceX = X - this.FlightState.X;
        var distanceY = Y - this.FlightState.Y;
        var dX = this.FlightState.VelocityX * dt;
        var dY = this.FlightState.VelocityY * dt;
        //The distance to the target is less than the distance we would travel, i.e. it's reached it's destination
        if (Math.sqrt(distanceX*distanceX+distanceY*distanceY) < Math.abs(this.getVelocity()*dt)) {
            //We are at the target, stop and set dX to the distance to put us over the target
            dX = distanceX;
            dY = distanceY;
            this.FlightState.VelocityX = 0;
            this.FlightState.VelocityY = 0;
            //We reached the destination.
            reachedDest = true;
        }
        //Advance it forward
        this.FlightState.X += dX;
        this.FlightState.Y += dY;
        //Update the lat longs
        XYToLatLong(this.FlightState);
        return reachedDest;
    };

    this.deliver = function (dt, bottom_alt, top_alt, speed) {
        if (this.descending) {
            //Perform the descent
            if (this.targetAltitude(dt, bottom_alt, speed)) {
                this.descending = false;
                return false;
            }
        }
        else {
            //Go back up
            return this.targetAltitude(dt, top_alt, speed);
        }
    }

    //Flies to the designated altitude at the given speed.
    this.targetAltitude = function (dt, alt, speed) {
        if (this.FlightState.Altitude > alt) {
            speed = -speed;
            if (speed * dt + this.FlightState.Altitude <= alt) {
                this.FlightState.Altitude = alt;
                return true;
            }
        }
        else if (speed * dt + this.FlightState.Altitude >= alt) {
            this.FlightState.Altitude = alt;
            return true;
        }
        this.FlightState.Altitude += speed * dt;
        return false;
    }

    //This only works on the XY plane, not for vertical velocity.
    this.approachSpeed = function (desiredSpeed, heading, dt) {
        var velocity = this.getVelocity();
        if (Math.abs(velocity - desiredSpeed) < 0.005) {
            return true;
        }

        var maxAcc = this.MaxAcceleration;
        if (velocity > desiredSpeed) {
            //Accelerate vs Deccelerate
            maxAcc = -maxAcc;
        }

        var changeInSpeed = maxAcc * dt;
        var newSpeed = changeInSpeed + velocity;
        //Stores whether we have reached the desired speed or not.
        var achievedSpeed = false;
        if (newSpeed > desiredSpeed) {
            //We managed to reach our speed, but don't overshoot it.
            newSpeed = desiredSpeed;
            achievedSpeed = true;
        }
        var radHeading = heading;
        //The x is sin, not cos (because heading = 0 is north, but x is east)
        var velX = Math.sin(radHeading) * newSpeed;
        var velY = Math.cos(radHeading) * newSpeed;
        //Store the new velocity values
        this.FlightState.VelocityX = velX;
        this.FlightState.VelocityY = velY;
        return achievedSpeed;
    }

    this.getVelocity = function () {
        var velX = this.FlightState.VelocityX;
        var velY = this.FlightState.VelocityY;
        return Math.sqrt(velX * velX + velY * velY);
    }

    //Perform whatever command 
    this.performCommand = function (dt, command) {
        var cmd = command ? command : this.Command;
        switch (cmd.type) {
            case "CMD_NAV_Waypoint":
            case "CMD_NAV_Target": //Target commands just need to be dead reckoned towards the objective.
                return this.deadReckon(dt, cmd.X, cmd.Y);
                break;
            case "CMD_NAV_Hover":
                if (this.deadReckon(dt, cmd.X, cmd.Y)) {
                    if (cmd.Time > 0) {
                        cmd.Time -= dt;
                    }
                    else {
                        return true;
                    }
                }
                break;
            case "CMD_NAV_Takeoff":
                if (this.targetAltitude(cmd.Altitude)) {
                    console.log(this.Callsign + " has reached target altitude given by CMD_NAV_Takeoff");
                }
                break;
            case "CMD_NAV_Land":
                return this.flyToAndLand(dt, cmd.X, cmd.Y);
                break;

            case "CMD_DO_Return_To_Base":
                if (cmd.UseCurrent) {
                    var X = cmd.X;
                    var Y = cmd.Y;
                }
                else {
                    var X = this.base.X;
                    var Y = this.base.Y;
                }
                return this.flyToAndLand(dt, X, Y)
                break;
        }
        return true;
    }

    this.performMission = function (dt, mission) {
        var mis = mission;

        //TODO: Report mission progress
        switch (mis.Phase) {
            case "takeoff":
                if (this.takeOff(dt)) {
                    mis.Phase = "enroute";
                    return false;
                }
                break;
            case "enroute":
                if (this.deadReckon(dt, mis.X, mis.Y)) {
                    mis.Phase = "delivering";
                }
                break;
            case "delivering":
                if (this.deliver(dt, 200, 400, this.MaxVelocity)) {
                    mis.Phase = "back to base";
                }
                break;
            case "back to base":
                if (this.backToBase(dt, base.X, base.Y)) {
                    mis.Phase = "done";
                    return true;
                }
                break;
        }
    }

    this.setCommand = function (target) {
        switch (target.CommandType) {
            case "CMD_DO_Change_Speed":
                this.MaxVelocity = this.target.HorizontalVelocity || this.MaxVelocity;
                this.MaxVerticalVelocty = this.target.VelocityZ || this.MaxVerticalVelocty;
                //TODO: Report UAV changes
                break;
            case "CMD_NAV_Set_Base":
                this.Base.Latitude = target.Latitude;
                this.Base.Longitude = target.Longitude;
                LatLongToXY(this.Base);
                break;
            default:
                this.Command = target;
        }
        this.reporter.ackCommand(target, target.type, "OK");
    }

    //Makes the vehicle go back to base
    this.backToBase = function (dt) {
        return this.flyToAndLand(dt, this.Base.X, this.Base.Y);
    }
    
    this.flyToAndLand = function (dt, destX, destY) {
        var thisX = this.FlightState.X;
        var thisY = this.FlightState.Y;
        if (calculateDistance(thisX, thisY, destX, destY) > 10) {
            this.deadReckon(dt, destX, destY);
            return false;
        }
        else {
            return this.targetAltitude(dt, 0, this.MaxVerticalVelocty);
        }
    }

    this.takeOff = function (dt) {
        return this.targetAltitude(dt, 400, 15);
    }

    //Just checks to make sure that the vehicle is back at base and on the ground.
    //Does not count if it is on the floor.
    this.isAtBase = function () {
        var thisX = this.FlightState.X;
        var thisY = this.FlightState.Y;
        return this.FlightState.Altitude == 0
            && calculateDistance(thisX, thisY, base.X, base.Y) < 5;
    }

    this.generateWaypoints = function() {
        if(this.Command) {
            this.resolvePath(this.Command, [], this);
        }
        else if(this.Mission) {
            this.resolvePath(this.Mission, [], this);
        }
    }

    this.getNextWaypoint = function () {
        var wp = this.currentWaypoint;
        var wps = this.waypoints;
        //Find the next waypoint;
        for (var i = 0; i < wps.length; i++) {
            var candidate = wps[i];
            if (wp.NextWaypointId == candidate.Id) {
                this.currentWaypoint = candidate;
                break;
            }
        }
        //If we didn't find it, then put null
        if (this.currentWaypoint == wp) {
            this.currentWaypoint = null;
        }
        //TODO: Report that we finished this wp
    }
}

//Wrapper object that wraps up communications to the server. A pretty leaky abstraction though.
//Something require callbacks leaking the fact that values cannot be returned immediately. Oh well!
function Reporter() {
    this.hub = $.connection.vehicleHub;

    this.pendingResult = false;

    this.updateMission = function (mission, opts) {
        this.putToServer('api/missions/' + mission.Id, mission);
    }

    this.updateFlightState = function (fs, opts) {
        this.hub.server.pushFlightStateUpdate(fs);
    }

    this.putToServer = function (url, success) {
        $.ajax({ url: url, sucess: success, type: 'PUT' });
    }

    this.ackCommand = function (cmd, type, reason) {
        this.hub.server.ackCommand({
            CommandId: cmd.Id,
            CommandType: type,
            Reason: reason
        }, cmd.connId);
    }

    this.retrieveWaypointsByMissionId = function(id, caller, success) {
        this.pendingResult = false;
        var url = '/api/missions/waypoints/' + id;
        return $.ajax({
            url: url,
            success: function(data, textStatus, jqXHR) {success(data, textStatus, jqXHR);}
        });
    }

    
}



function VehicleContainer (){
    this.ids = [];
    this.vehicles = [];

    this.hasVehicleById = function (id) {
        return this.ids.indexOf(id) != -1;
    }

    this.getVehicleById = function (id) {
        var idx = this.ids.indexOf(id);
        return this.vehicles[this.ids[idx]];
    }

    this.getVehicleByIndex = function (idx) {
        return this.vehicles[idx];
    }

    this.addVehicle = function (veh) {
        this.ids.push(veh.id);
        this.vehicles.push(veh);
    }
}

// The waypoint creation logic container so that there isn't logic all over the vehicle code
function PathGenerator(areaContainer, reporter) {
    this.areaContainer = areaContainer;
    this.mission = mission;
    this.waypoints = waypoints;
    this.reporter = reporter;

    this.resolvePath = function(mission, wps, veh) {
        //For now, we are just going to get the direct waypoints.
        if (wps  && wps.length < 2) {
            var wps = this.withEndPoints(mission, wps, veh);
        }
        return wps;
    }

    this.withEndPoints = function (mission, wps, veh) {
        //If the wps is less than 2, then we are missing the end points of the waypoints.
        if(wps && wps.length < 2) {
            wps = this.getBeginningAndEnd(mission, wps, veh);
        }
        return wps;
    }

    //Immediately return the beginning and end of the waypoints.
    this.getBeginningAndEnd = function (mission, wps, veh) {
        var fs = veh.FlightState;
        //If the mission is completed, just go back to base.
        var objective = mission.TimeCompleted? veh.Base : mission;
        var pts = [Waypoint({Latitude: fs.Latitude, Longitude: fs.Longitude}),
            Waypoint({Latitude: objective.Latitude, objective: mission.Longitude})];
        pts[1].obj = mission.TimeCompleted? null : mission;
        if(pt[1].obj) {
            pt[1].objType = "mission";
        }
        return pts;
    }

}


//Convenience constructor for the waypoint. Can construct itself from information from the server, but
//also with minimal knowledge so that the path generator has a better time building one.
function Waypoint(info) {
    this.WaypointName = info.WaypointName ? info.WaypointName : "";
    this.TimeCompleted = info.TimeCompleted ? info.TimeCompleted : null;
    this.Action = info.Action ? info.Action : "fly through";
    this.GeneratedBy = info.GeneratedBy ? info.GeneratedBy : "vehicle";
    if (info.Position) {
        appendLonLatFromDbPoint(this, info.Position);
        LatLongToXY(this);
        this.Position = info.Position;
    }
    else if(info.Latitude && info.Longitude) {
        this.Latitude = Latitude;
        this.Longitude = Longitude;
        LatLongToXY(this);
    }
    if(info.NextWaypointId) {
        this.NextWaypointId = info.NextWaypointId;
    }
    this.Id = info.Id;
}

//Helper functions and globals.

//http://en.wikipedia.org/wiki/Equirectangular_projection
//http://stackoverflow.com/questions/16266809/convert-from-latitude-longitude-to-x-y

//base of operations.
var base = {
    Latitude: 34.242034,
    Longitude: -118.528763,
}

//Convert from web mercator to WGS84 and back if needed
//Using web mercator makes sure that whatever lat longs we send out
//display correctly to the users.
var metersProj = proj4.Proj('GOOGLE');
var WGS84Proj = proj4.Proj('WGS84');
var wgsToMeters = proj4(WGS84Proj, metersProj);
var standard = Math.cos(base.Latitude);
var earthRadius = 6378100; //Radius of earth in meters
var baseXY = wgsToMeters.forward([base.Longitude, base.Latitude]);
LatLongToXY(baseXY);

var deg2rad = Math.PI / 180;
var rad2deg = 1 / deg2rad;

//Eventually these functions need to be phased out to get more accurate calculations.
//I'm not sure if the longitude factors into the y calculation, so I pass in the base
//Longitude to ensure the calculation is more accurate.
function latToY(latitude) {
    return wgsToMeters.forward([base.Longitude, latitude])[1];
}

function yToLat(y) {
    return wgsToMeters.inverse([base.X,y])[1];
}

//Same thing here as above.
function longToX(longitude) {
    return wgsToMeters.forward([longitude, base.Latitude])[0];
}

function xToLong(x) {
    return wgsToMeters.inverse([x, base.Y])[0];
}
//Radius of operations in meters.
var radius = 16093.4;

//Uses trigonometry to figure out the heading from the passed in UTM coordinates
function calculateHeading(x1, y1, x2, y2) {
    var dx = (x2 - x1);
    var dy = (y2 - y1);
    // atan(y/x) is the slope of a line in an x,y plane (we do dx / dy due to north being 0)
    // atan2 allows the returned range to be between (-pi, pi].
    var heading = Math.atan2(dx, dy);
    if (heading < 0) {
        //We wan this to be [0, 2pi), not (-pi, pi]
        heading += Math.PI * 2;
    }
    return heading;
}

//Opposite of the below function
function XYToLatLong(vehicle) {
    var longLat = wgsToMeters.inverse([vehicle.X, vehicle.Y]);
    vehicle.Longitude = longLat[0];
    vehicle.Latitude = longLat[1];
}

//Take the lat long and convert them to mercator using proj4js
function LatLongToXY(vehicle) {
    var xy = wgsToMeters.forward([vehicle.Longitude, vehicle.Latitude]);
    vehicle.X = xy[0];
    vehicle.Y = xy[1];
}

//Uses pythagoream theorem to calculate the distance between two points.
//Only works if you are using UTM or some equivalent. Does not work on lat longs.
function calculateDistance(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
}

//Takes the well formed geography and appends the lat and long as doubles, then appends the X and Y we get from the lat and long
appendLonLatFromDbPoint = function (obj, point) {
    var pointText = point.Geography.WellKnownText
    //This looks for doubles, e.g. 23.3, 2, -119. Requires a number in the front I think. 
    //I took it from stack overflow somewhere, so be wary
    var results = pointText.match(/-?\d+(\.\d+)?/g);
    //The point should give 3 doubles, long lat altitude in that order
    obj.Longitude = parseFloat(results[0]);
    obj.Latitude = parseFloat(results[1]);
    obj.Altitude = parseFloat(results[2]);
    //Append the XY mercator values
    LatLongToXY(obj);
}