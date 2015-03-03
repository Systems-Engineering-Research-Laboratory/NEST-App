
/**
* A class that represent a vehicle. It contains one mission and one command so far, as well as one flight state.
* The vehicle doesn't need to have more than that to run the simulation (for now at least). It comes with the
* functins that allow it to behave kind of autonomously. It just goes straight to it's destination.
*/
function Vehicle(vehicleInfo, reporter, pathGen) {
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
    LatLongToXY(this.FlightState);
    this.Schedule = vehicleInfo.Schedule;
    //Garbage collect some crap. This stuff is not needed.
    for (var i = 0; i < this.Schedule.Missions.length; i++) {
        var m = this.Schedule.Missions[i];
        m.Schedule = null;
        m.Waypoints = null;
    }
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
            var misIdx = wps.length - 1;
            that.currentWaypoint = that.waypoints[0];
            that.currentWpIndex = 0;
            that.waypoints[misIdx].obj = that.Mission;
            that.waypoints[misIdx].objType = "mission";
        }
    }

    //If the mission is defined, get the waypoints associated with it
    if (this.Mission) {
        LatLongToXY(this.Mission);
        this.reporter.retrieveWaypointsByMissionId(this.Mission.id, this, this.gotNewWaypoints);
    }


    this.setReporter = function (reporter) {
        this.reporter = reporter;
    }

    this.setPathGen = function (gen) {
        this.pathGen = gen;
    }
    this.setPathGen(pathGen);
    
    this.appendLonLat = function (obj, point) {
        var pointText = point.Geography.WellKnownText;
        LatLongToXY(obj);
    }

    //Functions. Careful not to add global helper functions here.
    this.process = function (dt) {
        //If the current waypoint is null but the reporter is pending, just return.
        if (this.isAtBase() && this.battery < 1)
        {
            this.chargeBattery(dt);
            reporter.updateFlightState(this.FlightState);
            return;
        }
        if (this.currentWaypoint && this.reporter.pendingResult) {
            return;
        }
        //TODO: Check if there is a new restricted area, adjust accordingly.
        //Process this waypoint if we have one
        if (this.currentWaypoint) {
            if (this.performWaypoint(dt)) {
                console.log("Finished with waypoint " + this.currentWaypoint.WaypointName);
                //this.updateCurrentWaypoint();
                this.getNextWaypoint();
            }
        }
        else if (this.hasScheduledMissions() && this.battery >= .9) {
            this.getNextMission();
        }
            //Well, I guess we have nothing better to do!
        else if (!this.isAtBase()) {
            this.backToBase(dt);
        }
            //Charging at base
        else {
            this.chargeBattery(dt);
            //Don't let the flight states get too stale, even if we are sitting at base.
            reporter.updateFlightState(this.FlightState);
            //Make sure we don't drop the battery level 
            return;
        }

        this.FlightState.BatteryLevel -= dt / 1800;

        reporter.updateFlightState(this.FlightState);
    };
    this.getNextMission = function() {
        var missions = this.Schedule.Missions;
        this.Mission = missions.shift();
        LatLongToXY(this.Mission);
        this.reporter.retrieveWaypointsByMissionId(mission.id, this, this.gotNewWaypoints);
    }

    this.hasScheduledMissions = function () {
        return this.Schedule.Missions.length > 0;
    }

    this.chargeBattery = function (dt) {
        this.FlightState.BatteryLevel += 5 * dt / 18000;
        if (this.FlightState.BatteryLevel > 1) {
            this.FlightState.BatteryLevel = 1;
        }
    }

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
        //Find the direction it wants to go there
        heading = calculateHeading(this.FlightState.X, this.FlightState.Y, X, Y);
        //Update the vehicle's yaw.
        //Put the heading into the flight state for when it gets pushed to the server.
        this.FlightState.Yaw = heading * rad2deg;
        var idealSpeed = this.MaxVelocity;
        this.approachSpeed(idealSpeed, heading, dt);
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
        desiredSpeed = 1000;
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
        var wpComplete = false;
        var update = false;
        //TODO: Report mission progress
        switch (mis.Phase) {
            case "standby":
                {
                    update = true;
                    mis.Phase = "takeoff";
                }
            case "takeoff":
                if (this.takeOff(dt)) {
                    mis.Phase = "enroute";
                    wpComplete = false;
                    update = true;
                }
                break;
            case "enroute":
                if (this.deadReckon(dt, mis.X, mis.Y)) {
                    mis.Phase = "delivering";
                    wpComplete = false;
                    update = true;
                }
                break;
            case "delivering":
                if (this.deliver(dt, 200, 400, this.MaxVelocity)) {
                    mis.Phase = "back to base";
                    wpComplete =  true;
                    //TODO: Assign the path back to the base.
                    update = true;
                    //this.pathGen.generateBackToBaseWaypoints(this.FlightState, this.Base);
                }
                break;
            case "done":
            case "back to base":
                if (this.backToBase(dt, base.X, base.Y)) {
                    mis.Phase = "done";
                    wpComplete = true;
                    update = true;
                }
                break;
        }
        if (update) {
            this.reporter.updateMission(mis);
        }
        return wpComplete;
    }

    this.setCommand = function (target) {
        if (!this.handleNonNavigationalCommand(target)) {
            if (this.currentWaypoint) {
                target.NextWaypointId = this.currentWaypoint.Id;
            }
            var promise = this.pathGen.insertWaypoint(this.Mission, target, this.waypoints);
            //
            promise.done(function (data, textStatus, jqXHR) {
                that.reporter.ackCommand(target, target.type, "OK", true);
                //extra
                data.obj = target;
                data.objType = "command";
                that.currentWaypoint = data;
            });
            //if fail pass false
            promise.fail(function (jqXHR, textStatus, err) {
                that.reporter.ackCommand(target, target.type, "Waypoint creation failed, Error: " + err, false);
                
            });
        }
        //else non navigational
    }

    this.handleNonNavigationalCommand = function (target) {
        var handled = true;
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
                handled = false;
                this.Command = target;
        }
        return handled;
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

    this.generateWaypoints = function () {
        var target = this.Command || this.Mission;
        var type = this.Command ? "command" : "mission";
        this.waypoints = this.pathGen.brandNewTarget(this.FlightState, target, true, this);
        this.waypoints[1].obj = target;
        this.waypoints[1].objType = type;
        this.currentWaypoint = this.waypoints[0];
        this.currentWpIndex = 0;
    }

    this.getNextWaypoint = function () {
        var wp = this.currentWaypoint;
        var wps = this.waypoints;
        if (this.currentWpIndex != null && this.currentWpIndex + 1 < wps.length) {
            var nextIdx = this.currentWpIndex + 1;
            this.currentWaypoint = wps[nextIdx];
            this.currentWpIndex = nextIdx;
            console.log("UAV " + this.Callsign + " next waypoint: " + this.currentWaypoint.WaypointName);
        }
            //If we didn't find it, then put null
        else {
            console.log("UAV " + this.Callsign + " done with waypoints.");
            this.currentWaypoint = null;
            this.currentWpIdx = null;
        }
        //TODO: Report that we finished this wp
    }

    this.updateCurrentWaypoint = function () {
        var wp = this.currentWaypoint;
        var curTime = new Date();
        wp.TimeCompleted = curTime.toISOString();
        this.reporter.updateWaypoint(wp);
    }

}


function VehicleContainer (){
    this.ids = [];
    this.vehicles = [];
    this.restrictedAreas = [];
    this.newRestrictedArea = false;

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

    this.addRestrcitedArea = function (area) {
        this.restrictedAreas.push(area);
        this.newRestrictedArea = true;
    }

    this.makeStale = function () {
        this.newRestrictedArea = false;
    }

}

// The waypoint creation logic container so that there isn't logic all over the vehicle code
function PathGenerator(areaContainer, reporter) {
    this.areaContainer = areaContainer;
    this.reporter = reporter;
    var that = this;

    this.gotNewRestrictedArea = function () {
        return this.areaContainer.newRestrictedArea;
    }

    this.brandNewTarget = function (begin, end, isMission, veh) {
        var pts = [new Waypoint({ Latitude: begin.Latitude, Longitude: begin.Longitude }),
            new Waypoint({ Latitude: end.Latitude, Longitude: end.Longitude })];
        if (isMission) {
            this.reporter.addNewRouteToMission(end.id, pts);
        }
        return pts;
    }

    this.generatePath = function(wps, veh) {
        if(this.gotNewRestrictedArea()) {
            var newWps = this.resolvePath(wps);
            return newWps;
        }
        return wps;
    }

    this.resolvePath = function(mission, wps, veh) {
        //For now, we are just going to get the direct waypoints.
        if (wps  && wps.length < 2) {
            this.withEndPoints(mission, wps, veh);
        }
        return wps;
    }

    this.withEndPoints = function (mission, wps, veh) {
        //If the wps is less than 2, then we are missing the end points of the waypoints.
        if(wps && wps.length < 2) {
            wps = this.getBeginningAndEnd(veh.FlightState, mission, wps, veh);
        }
        return wps;
    }

    //Immediately return the beginning and end of the waypoints.
    this.getBeginningAndEnd = function (begin, end, wps, veh) {

        var pts = [Waypoint({Latitude: begin.Latitude, Longitude: end.Longitude}),
            Waypoint({Latitude: end.Latitude, objective: end.Longitude})];
        
        return pts;
    }

    this.addWaypointInbetween = function (before, newPoint, wps, veh) {
        //"before" is the waypoint before the new position click
        //"newPoint" is a lat/long pair
        //"wps" is the list of waypoints
        if (!this.validatePoint(newPoint)) {
            return false;
        }
        var bidx = wps.indexOf(before);
        
        var after = bidx + 1 < wps.length? wps[bidx + 1] : null;
        //Build a new waypoint from the passed in information.
        newWp = new Waypoint({
            Latitude: newPoint.Latitude,
            Longitude: newPoint.Longitude,
            Action: newPoint.Action,
            NextWaypointId: after ? after.Id : undefined,
            NextWaypoint: after? after : undefined,
        });
        //Insert the new waypoint into the array
        wps.splice(idx + 1, 0, newWp);
        before.NextWaypoint = newWp;
        //TODO: Add reporter inserting waypoint.
        return true;
    }

    this.insertWaypoint = function (mission, newPoint, wps) {
        var promise = this.reporter.insertWaypoint(mission.id, {
            Latitude: newPoint.Latitude,
            Longitude: newPoint.Longitude,
            Altitude: newPoint.Altitude || -1,
            WaypointName: newPoint.WaypointName || "name",
            NextWaypointId: newPoint.NextWaypointId,
            IsActive: newPoint.isActive || true,
            WasSkipped: newPoint.WasSkipped || false,
            GeneratedBy: newPoint.GeneratedBy || "vehicle",
            Action: newPoint.Action || "fly through",
            MissionId: mission.id,
        });
        var cb = function (data, textStatus, jqXHR) {
            that.insertWpIntoList(data, wps);
        }
        promise.done(cb);
        return promise;
    }

    this.insertWpIntoList = function (newWp, wps) {
        for (var i = 0; i < wps.length; i++) {
            if (wps[i].NextWaypointId == newWp.NextWaypointId) {
                wps[i].NextWaypointId = newWp.Id;
                wps.splice(i, 0, newWp);
            }
        }
    }


    this.validatePoint = function (testPoint) {
        return true;
    }

    this.generateBackToBaseWaypoints = function (currentLoc, baseLocation, wps) {
        newWps = this.getBeginningAndEnd(currentLoc, baseLocation);
        var lastIndex = wps.length - 1;
        this.insertWaypoint(wps[lastIndex], newWps[0]);
        this.insertWaypoint(newWps[0], newWps[1]);
        wps.push(newWps[0]);
        wps.push(newWps[1]);
        return wps;
    }

    function checkPathIntersectsRectangle(a_rectangleMinX,
                                 a_rectangleMinY,
                                 a_rectangleMaxX,
                                 a_rectangleMaxY,
                                 a_p1x,
                                 a_p1y,
                                 a_p2x,
                                 a_p2y) {
        // Find min and max X for the segment

        minX = a_p1x;
        maxX = a_p2x;

        if(a_p1x > a_p2x)
        {
            minX = a_p2x;
            maxX = a_p1x;
        }

        // Find the intersection of the segment's and rectangle's x-projections

        if(maxX > a_rectangleMaxX)
        {
            maxX = a_rectangleMaxX;
        }

        if(minX < a_rectangleMinX)
        {
            minX = a_rectangleMinX;
        }

        if(minX > maxX) // If their projections do not intersect return false
        {
            return false;
        }

        // Find corresponding min and max Y for min and max X we found before

        minY = a_p1y;
        maxY = a_p2y;

        dx = a_p2x - a_p1x;

        if(Math.abs(dx) > 0.0000001)
        {
            a = (a_p2y - a_p1y) / dx;
            b = a_p1y - a * a_p1x;
            minY = a * minX + b;
            maxY = a * maxX + b;
        }

        if(minY > maxY)
        {
            tmp = maxY;
            maxY = minY;
            minY = tmp;
        }

        // Find the intersection of the segment's and rectangle's y-projections

        if(maxY > a_rectangleMaxY)
        {
            maxY = a_rectangleMaxY;
        }

        if(minY < a_rectangleMinY)
        {
            minY = a_rectangleMinY;
        }

        if(minY > maxY) // If Y-projections do not intersect return false
        {
            return false;
        }

        return true;
    }
}


//Convenience constructor for the waypoint. Can construct itself from information from the server, but
//also with minimal knowledge so that the path generator has a better time building one.
function Waypoint(info) {
    this.WaypointName = info.WaypointName ? info.WaypointName : "";
    this.TimeCompleted = info.TimeCompleted ? info.TimeCompleted : null;
    this.Action = info.Action ? info.Action : "fly through";
    this.GeneratedBy = info.GeneratedBy ? info.GeneratedBy : "vehicle";
    this.Altitude = info.Altitude || 400;
    this.IsActive = info.IsActive || true;
    this.MissionId = info.MissionId || null;
    this.WasSkipped = info.WasSkipped || false;
    this.NextWaypointId = info.NextWaypointId || null;
    if (info.Position) {
        appendLonLatFromDbPoint(this, info.Position);
        LatLongToXY(this);
        this.Position = info.Position;
    }
    
    this.Latitude = info.Latitude;
    this.Longitude = info.Longitude;
    LatLongToXY(this);
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