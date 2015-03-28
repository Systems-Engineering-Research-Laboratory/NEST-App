
/**
* A class that represent a vehicle. It contains one mission and one command so far, as well as one flight state.
* The vehicle doesn't need to have more than that to run the simulation (for now at least). It comes with the
* functins that allow it to behave kind of autonomously. It just goes straight to it's destination.
*/

var skipBattery = false;
var globalMaxVelocity;
var globalMaxAcceleration;
function Vehicle(vehicleInfo, reporter, pathGen) {
    //Model stuff
    this.Id = vehicleInfo.Id;
    this.Callsign = vehicleInfo.Callsign;
    this.Mileage = vehicleInfo.Mileage;
    this.NumDeliveries = vehicleInfo.NumDeliveries;
    this.MaxVelocity = vehicleInfo.MaxVelocity;
    this.MaxVerticalVelocity = vehicleInfo.MaxVerticalVelocity;
    this.MaxAcceleration = vehicleInfo.MaxAcceleration;
    this.UpdateRate = vehicleInfo.UpdateRate;
    this.hasCommsLink = true;

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
        this.preprocess();
        //Process this waypoint if we have one
        if (!this.hasCommsLink) {
            //Uh oh, loss of link. 
            this.FlightState.BatteryLevel -= dt / 1800;
            if (this.FlightState.BatteryLevel > .5) {
                //So we don't report out or follow waypoints, just hover
                return;
            } else if (!this.generatedContingency) {
                this.generatedContingency = true;
                this.brandNewTarget(this.Base, false);
            }
        }
        if (this.currentWaypoint) {
            if (this.performWaypoint(dt)) {
                console.log("Finished with waypoint " + this.currentWaypoint.WaypointName);
                this.getNextWaypoint();
            }
        }
        else if (this.hasScheduledMissions() && this.FlightState.BatteryLevel >= .9) {
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
        if (this.hasCommsLink) {
            reporter.updateFlightState(this.FlightState);
        }
    };

    this.preprocess = function () {
        //If the current waypoint is null but the reporter is pending, just return.
        if (this.isAtBase() && this.FlightState.BatteryLevel < 1) {
            this.chargeBattery(dt);
            reporter.updateFlightState(this.FlightState);
            return;
        }
        if (this.currentWaypoint && this.reporter.pendingResult) {
            return;
        }
        if (this.pathGen.gotNewRestrictedArea() && this.waypoints) {
            var resolved = this.pathGen.buildSafeRoute(this.waypoints, this.FlightState, this.currentWpIndex);
            this.currentWpIndex += 1;
            this.currentWaypoint = this.waypoints[this.currentWpIndex];
            if (this.hasCommsLink && resolved) {
                this.reporter.addNewRouteToMission(this.Mission.id, this.waypoints);
                this.reporter.reportReroute(this.Id, this.Callsign);
            }
        }
    }

    this.setCommsLink = function (isConnected) {
        this.hasCommsLink = isConnected;
    }

    
    this.getNextMission = function () {
        var missions = this.Schedule.Missions;
        this.Mission = missions.shift();
        while (this.Mission && this.isMissionCompleted()) {
            this.Mission = missions.shift();
        }
        if (this.Mission) {
            if (this.Mission.Phase === "delivering") {
                this.Mission.Phase = "enroute";
                reporter.updateMission(this.Mission);
            }
            LatLongToXY(this.Mission);
            //Ignore stuff in the database for now.
            this.generateWaypoints(this.Mission, "mission");
            console.log("generated waypoints");
            reporter.broadcastNewMission(this.Id, this.Schedule.Id, this.Mission.id);
            console.log(this.Callsign + " moved on to mission " + this.Mission.id);
        }
    }


    this.isMissionCompleted = function () {
        if (this.Mission) {
            return this.Mission.Phase === "done" || this.Mission.Phase === "back to base";
        }
        return false;
    }

    this.hasScheduledMissions = function () {
        return this.Schedule.Missions.length > 0;
    }

    this.chargeBattery = function (dt) {
        this.FlightState.BatteryLevel += 5 * dt / 18000;
        if (skipBattery || this.FlightState.BatteryLevel > 1) {
            this.FlightState.BatteryLevel = 1;
        }
    }

    this.performWaypoint = function (dt) {
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
            if (this.flyToAltitude(dt, this.currentWaypoint.Altitude)) {
                return this.deadReckon(dt, wp.X, wp.Y, true);
            }
        }
    }

    //Advances the aircraft directly towards its destination. Nothing fancy here.
    this.deadReckon = function (dt, X, Y, retainSpeed) {
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
        if (Math.sqrt(distanceX * distanceX + distanceY * distanceY) < Math.abs(this.getVelocity() * dt)) {
            //We are at the target, stop and set dX to the distance to put us over the target
            dX = distanceX;
            dY = distanceY;
            //We reached the destination.
            reachedDest = true;
            if (!retainSpeed) {
                this.FlightState.VelocityX = 0;
                this.FlightState.VelocityY = 0;
            }
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

    this.flyToAltitude = function (dt, alt) {
        return this.targetAltitude(dt, alt, this.MaxVerticalVelocity);
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
        desiredSpeed = globalMaxVelocity || desiredSpeed;
        var velocity = this.getVelocity();

        var maxAcc = globalMaxAcceleration || this.MaxAcceleration;
        if (Math.abs(velocity - desiredSpeed) < 0.005) {
            maxAcc = 0;
        }
        else if (velocity > desiredSpeed) {
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
                return this.deadReckon(dt, cmd.X, cmd.Y, true);
                break;
            case "CMD_NAV_Hover":
                if (this.deadReckon(dt, cmd.X, cmd.Y, false)) {
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
                if (this.deliver(dt, 200, 400, this.MaxVerticalVelocity)) {
                    mis.Phase = "back to base";
                    wpComplete = true;
                    //TODO: Assign the path back to the base.
                    update = true;
                    this.pathGen.appendSafeRouteToMission(this.waypoints, this.FlightState, this.Base, mis.id, this.hasCommsLink);
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
        if (this.hasCommsLink && !this.handleNonNavigationalCommand(target)) {
            if (this.currentWaypoint) {
                this.pathGen.insertIntermediateTarget(this.waypoints,
                    this.FlightState,
                    target,
                    this.currentWpIndex,
                    this.hasCommsLink,
                    this.Mission.id
                    );
                this.currentWaypoint = this.waypoints[this.currentWpIndex]
            }
        }
        //else non navigational
    }

    this.handleNonNavigationalCommand = function (target) {
        var handled = true;
        switch (target.CommandType) {
            case "CMD_DO_Change_Speed":
                this.MaxVelocity = this.target.HorizontalVelocity || this.MaxVelocity;
                this.MaxVerticalVelocity = this.target.VelocityZ || this.MaxVerticalVelocity;
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
        if (calculateDistance(thisX, thisY, destX, destY) > .1) {
            this.deadReckon(dt, destX, destY);
            return false;
        }
        else {
            return this.targetAltitude(dt, 0, this.MaxVerticalVelocity);
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
            && calculateDistance(thisX, thisY, this.Base.X, this.Base.Y) < 5;
    }

    this.generateWaypoints = function (target, type) {
        var target = target || this.Command || this.Mission;
        if (!type) {
            var type = this.Command ? "command" : (this.Mission ? "mission" : "target");
        }
        //generates new waypoints
        this.brandNewTarget(target, true);
        var n = this.waypoints.length;
        this.waypoints[n - 1].obj = target;
        this.waypoints[n - 1].objType = type;
    }

    this.generateWaypointsAndAppend = function (target) {
        var target = target || this.Command || this.Mission;
        var type = this.Command ? "command" : (this.Mission ? "mission" : "target");

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

    this.brandNewTarget = function(target, reportOut){
        var wps = this.pathGen.brandNewTarget(this.FlightState, target, reportOut, this);
        this.waypoints = wps;
        this.currentWpIndex = 0;
        this.currentWaypoint = this.waypoints[this.currentWpIndex];
    }

    this.addMissionToSchedule = function (mis) {
        this.Schedule.push(mis);
    }

    this.setNewCurrentMission = function (misId) {
        for (var i = 0; i < this.Schedule.length; i++) {
            if (this.Schedule[i].id == misId) {
                var foundMis = this.Schedule.splice(i, 1);
            }
        }
        if (foundMis) {
            if (this.Mission && !this.isMissionCompleted()) {
                //Requeue the current mission if it is not done
                //Set to the front
                this.Schedule.unshift(this.Mission);
            }
            this.Schedule.unshift(foundMis);
        }
    }

    this.getNextMission();
}


function VehicleContainer() {
    this.ids = [];
    this.vehicles = [];
    this.restrictedAreas = [];
    this.newRestrictedArea = false;

    var $this = this;
    $.connection.vehicleHub.client.newRestrictedArea = function (area) {
        $this.addRestrictedArea(area);
    }

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

    this.addRestrictedArea = function (area) {
        areaToEuclidean(area);
        this.restrictedAreas.push(area);
        this.newRestrictedArea = true;
        this.buildGraph();
    }

    this.addRestrictedAreas = function (areas) {
        this.restrictedAreas.concat(areas);
        this.buildGraph();
    }

    this.makeStale = function () {
        this.newRestrictedArea = false;
    }

    var $this = this;
    $.ajax({
        url: '/api/maprestricteds',
    }).success(function (data, textStatus, jqXHR) {
        for (var i = 0; i < data.length; i++) {
            $this.addRestrictedArea(data[i]);
        }
    })

    this.buildGraph = function () {
        var areas = this.restrictedAreas;
        prepareAreas(this.restrictedAreas);
        for (var i = 0; i < areas.length; i++) {
            area = areas[i];
            area.edges = [];
            for (var j = i; j < areas.length; j++) {
                var neighbor = areas[j];
                this.getEdges(area, neighbor);
            }
        }
    }

    this.getEdges = function (area1, area2) {
        var areas = this.restrictedAreas;

        for (var j = 0; j < area1.corners.length; j++) {
            var c1 = area1.corners[j];
            for (var k = 0; k < area2.corners.length; k++) {
                var c2 = area2.corners[k];
                var int = false;
                for (var i = 0; i < areas.length && !int; i++) {
                    var a = areas[i];
                    int = checkPathIntersectsRectangle(a.SouthWestX, a.SouthWestY, a.NorthEastX, a.NorthEastY,
                        c1.X, c1.Y, c2.X, c2.Y);

                }
                if (!int) {
                    var cDistance = d(c1.X, c1.Y, c2.X, c2.Y);
                    c1.edges.push({
                        vertex: c2,
                        distance: cDistance
                    });
                    c2.edges.push({
                        vertex: c1,
                        distance: cDistance
                    });
                }
            }
        }
    }
}


function prepareAreas(areas) {
    for (var i = 0; i < areas.length; i++) {
        addCornersToArea(areas[i]);
        areas[i].edges = [];
    }
}

function addCornersToArea(area) {
    var xs = [area.NorthEastX + 20, area.SouthWestX - 20];
    var ys = [area.NorthEastY + 20, area.SouthWestY - 20];
    area.corners = [];
    for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 2; j++) {
            var corner = {
                X: xs[j],
                Y: ys[i]
            };
            XYToLatLong(corner);
            area.corners.push(corner);
            corner.edges = [];
        }
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

    this.brandNewTarget = function (begin, end, reportOut, veh) {
        var pts = [new Waypoint({ Latitude: end.Latitude, Longitude: end.Longitude })];
        this.buildSafeRoute(pts, begin, 0);
        if (reportOut) {
            var promise = this.reporter.addNewRouteToMission(end.id, pts);
            promise.success(function (data, textStatus, jqXHR) {
                for (var i = 0; i < pts.length; i++) {
                    pts[i].updateInfo(data[i]);
                }
            });
        }
        else {
            //The algorithm failed in this case. Eventually address this.
        }
        return pts;
    }


    this.insertIntermediateTarget = function (wps, curPos, target, beforeIndex, report, missionId) {
        //Safely inserts a target into a list of waypoints. 
        var tempWps = this.brandNewTarget(curPos, target, false);
        tempWps.splice(0, 1);
        //insertMultiPointsIntoList inserts after an index, so use beforeIndex -1 to make the beforeIndex the afterIndex
        insertMultiPointsIntoList(wps, tempWps, beforeIndex - 1);
        //Ensure that the rest of it is already connected.
        //TODO: Make this more efficient. The only connection that needs to be checked is the connection between
        //the old route and the new target
        this.buildSafeRoute(wps, curPos, beforeIndex);
        if (report) {
            //Report out if needed.
            var jq = this.reporter.addNewRouteToMission(missionId, wps);
            jq.success(function (data, textStatus, jqXHR) {
                for (var i = 0; i < wps.length; i++) {
                    wps[i].updateInfo(data[i]);
                }
            });
        }
        return tempWps[tempWps.length - 1];
    }


    this.appendSafeRouteToMission = function (wps, curPos, target, missionId, reportOut) {
        var tempRoute = [new Waypoint(wps[wps.length - 1]), new Waypoint(target)];
        this.buildSafeRoute(tempRoute, curPos);
        if (missionId && reportOut) {
            //bug here, nothing being sent to server.
            var jqxhr = reporter.appendRouteToMission(missionId, tempRoute);
            var $this = this;
            jqxhr.success(function (data, textStatus, jqXHR) {
                for (var i = 0; i < tempRoute.length; i++) {
                    tempRoute[i].updateInfo(data[i]);
                }
            });
        }
        insertMultiPointsIntoList(wps, tempRoute, wps.length - 1);
    }

    this.generatePath = function (wps, veh) {
        if (this.gotNewRestrictedArea()) {
            var newWps = this.resolvePath(wps);
            return newWps;
        }
        return wps;
    }

    this.addWaypointInbetween = function (before, newPoint, wps, veh) {
        //"before" is the waypoint before the new position click
        //"newPoint" is a lat/long pair
        //"wps" is the list of waypoints
        if (!this.validatePoint(newPoint)) {
            return false;
        }
        var bidx = wps.indexOf(before);

        var after = bidx + 1 < wps.length ? wps[bidx + 1] : null;
        //Build a new waypoint from the passed in information.
        newWp = new Waypoint({
            Latitude: newPoint.Latitude,
            Longitude: newPoint.Longitude,
            Action: newPoint.Action,
            NextWaypointId: after ? after.Id : undefined,
            NextWaypoint: after ? after : undefined,
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

    function insertMultiPointsIntoList(wps, cands, after) {
        for (var i = 0; i < cands.length; i++) {
            wps.splice(after + 1, 0, cands[i]);
            after++;
        }
    }

    this.movePointsOutOfAreas = function (wps) {
        for (var i = 0; i < wps.length; i++) {
            this.movePointOutOfArea(wps[i]);
        }
    }

    this.movePointOutOfArea = function (wp) {
        var areas = this.areaContainer.restrictedAreas;
        for (var i = 0; i < areas.length; i++) {
            if (this.checkIfPointInArea(wp, areas[i])) {
                this.movePointToCorner(wp, areas[i]);
            }
        }
    }

    this.movePointToCorner = function (wp, area) {
        var dist1 = Math.abs(wp.X - area.NorthEastX);
        var dist2 = Math.abs(wp.X - area.SouthWestX);
        wp.X = dist1 < dist2 ? area.NorthEastX : area.SouthWestX;
        dist1 = Math.abs(wp.Y - area.NorthEastY);
        dist2 = Math.abs(wp.Y - area.SouthWestY);
        wp.Y = dist1 < dist2 ? area.NorthEastY : area.SouthWestY;
        this.reporter.updateWaypoint(wp);
        console.log("Moved point ", wp.WaypointName, wp.Id);
    }

    this.checkIfPointInArea = function (p, area) {
        return p.X > area.SouthWestX && p.Y > area.SouthWestY && p.X < area.NorthEastX && p.Y < area.NorthEastY;
    }

    function getAreaIntersectionsFiltered(p1, p2, area) {
        ints = getAreaIntersections(p1, p2, area);
        var filt = [];
        for (var i = 0; i < ints.length; i++) {
            var int = ints[i];
            if (int) {
                filt.push(int);
            }
        }
        if (d(p1.X, p1.Y, filt[0].X, filt[0].Y) > d(p1.X, p1.Y, filt[1].X, filt[1].Y)) {
            filt.reverse();
        }
        return filt;
    }

    function getAreaIntersections(p1, p2, area) {
        var ints = [
            intersectsSide(area.SouthWestY, area.NorthEastY, area.NorthEastX, p1.Y, p1.X, p2.Y, p2.X, true),
            intersectsSide(area.SouthWestX, area.NorthEastX, area.NorthEastY, p1.X, p1.Y, p2.X, p2.Y),
            intersectsSide(area.SouthWestY, area.NorthEastY, area.SouthWestX, p1.Y, p1.X, p2.Y, p2.X, true),
            intersectsSide(area.SouthWestX, area.NorthEastX, area.SouthWestY, p1.X, p1.Y, p2.X, p2.Y),
        ];
        return ints;
    }

    function fixOppositeEdgeIntersection(area, int1, int2, isNorthSouthInt) {
        if (!isNorthSouthInt) {
            //The two points intersect through the east and west edges
            var edgeCenter = (area.NorthEastY + area.SouthWestY) / 2;
            var vertical = int1.Y - edgeCenter + int2.Y - edgeCenter;
            var pt1 = {
                X: area.NorthEastX + 1
            }
            var pt2 = {
                X: area.SouthWestX - 1
            }
            if (vertical < 0) {
                //The points average out to being closer to the bottom
                pt1.Y = area.SouthWestY - 1;
                pt2.Y = area.SouthWestY - 1;
            } else {
                pt1.Y = area.NorthEastY + 1;
                pt2.Y = area.NorthEastY + 1;
            }
        }
        else {
            var edgeCenter = (area.NorthEastX + area.SouthWestX) / 2;
            var horizontal = int1.X - edgeCenter + int2.X - edgeCenter;
            var pt1 = {
                Y: area.NorthEastY
            };
            var pt2 = {
                Y: area.SouthWestY
            };
            if (horizontal < 0) {
                //Average out to being more west
                pt1.X = area.SouthWestX - 1;
                pt2.X = area.SouthWestX - 1;
            } else {
                pt1.X = area.NorthEastX + 1;
                pt2.X = area.NorthEastX + 1;
            }
        }
        XYToLatLong(pt1);
        XYToLatLong(pt2);
        return [new Waypoint(pt1), new Waypoint(pt2)];
    }

    function intersectsSide(axMin, axMax, y, px1, py1, px2, py2, reverse) {
        if (Math.abs(py1 - py2) < .00001) {
            return false;
        }
        var num = (px2 - px1);
        var denom = (py2 - py1);
        var xInt = num / denom * (y - py1) + px1;
        var intersects = xInt <= axMax && xInt >= axMin;
        if (!intersects) {
            return null;
        }
        else {
            if (reverse) {
                return {
                    Y: xInt,
                    X: y,
                }
            }
            else {
                return {
                    X: xInt,
                    Y: y
                }
            }
        }

    }

    //Checks if the path of two waypoints intersects an area
    this.checkIfIntersect = function (p1, p2, area) {
        var intersects = checkPathIntersectsRectangle(area.SouthWestX, area.SouthWestY, area.NorthEastX, area.NorthEastY,
            p1.X, p1.Y, p2.X, p2.Y);
        if (intersects) console.log("checkIfIntersect found an intersection!");
        return intersects;
    }

    this.buildAndReportSafeRoute = function (wps, curPos, startIndex, missionId) {
        var resolved = this.buildAndReportSafeRoute(wps, curPos, startIndex, missionId);
        if (resolved) {
            this.reporter.addNewRouteToMission(this.waypoints, missionId);
        }
    }

    

    this.buildSafeRoute = function (wps, curPos, startIndex) {
        if (!startIndex) {
            startIndex = 0;
        }
        wps.splice(startIndex, 0, new Waypoint(curPos));
        var areas = this.areaContainer.restrictedAreas;
        var addedPoints = false;
        removeDisposableWps(wps);
        for (var i = startIndex; i < wps.length - 1; i++) {
            if (checkPathIntersectsArea(wps[i], wps[i] + 1, areas)) {
                var newwps = this.connectSafely(wps[i], wps[i + 1]);
                //The algorithm failed
                if (newwps.length == 0) {
                    continue;
                }
                wps[i].prev = null;
                wps[i].edges = null;
                wps[i + 1].prev = null;
                wps[i + 1].edges = null;
                insertMultiPointsIntoList(wps, newwps, i);
                i += newwps.length;
                addedPoints = addedPoints || newwps.length > 0;
            }
        }
        return addedPoints;
    }

    function removeDisposableWps(wps) {
        for (var i = 0; i < wps.length; i++) {
            if (wps[i].disposable) {
                wps.splice(i, 1);
                i--;
            }
        }
    }

    this.connectSafely = function (p1, p2) {
        var result = this.dijkstra(p1, p2);
        var wps = buildWpsFromArray(result);
        return wps;
    }

    this.dijkstra = function (p1, p2) {
        var areas = this.areaContainer.restrictedAreas;
        var foundInt = false;
        for (var i = 0; i < areas.length && !foundInt; i++) {
            var area = areas[i];
            foundInt = checkPathIntersectsRectangle(area.SouthWestX, area.SouthWestY, area.NorthEastX, area.NorthEastY,
            p1.X, p1.Y, p2.X, p2.Y);
        }
        if (!foundInt) {
            return [];
        }
        this.appendPointEdges(p2);
        this.appendPointEdges(p1);
        var result = this.doDijkstras(p1, p2);
        this.removePointEdges(p1, p2);
        return result;
    }

    function buildWpsFromArray(arr) {
        var wps = [];
        for (var i = 0 ; i < arr.length; i++) {
            var newWp = new Waypoint(arr[i]);
            //mark that this is a non-essential waypoints, e.g. generated by Dijkstra's
            newWp.disposable = true;
            wps.push(newWp);
        }
        return wps;
    }

    this.appendPointEdges = function (p) {
        var areas = this.areaContainer.restrictedAreas;
        p.edges = [];
        for (var i = 0; i < areas.length; i++) {
            var area = areas[i];
            for (var j = 0; j < area.corners.length; j++) {
                this.checkIfConnected(p, area.corners[j]);
            }
        }
    }

    this.removePointEdges = function (p1, p2) {
        var areas = this.areaContainer.restrictedAreas;
        for (var i = 0; i < areas.length; i++) {
            var a = areas[i];
            for (var j = 0; j < a.corners.length; j++) {
                var edges = a.corners[j].edges
                this.removeDisposableEdges(edges);
            }
        }
        if (p1) {
            p1.edges = null;
            if (p2) {
                p2.edges = null;
            }
        }
    }

    this.removeDisposableEdges = function(edges) {
        for (var i = 0; i < edges.length; i++) {
            var e = edges[i];
            if (e.disposable) {
                edges.splice(i, 1);
                i--;
            }
        }
    }

    this.checkIfConnected = function (p, c) {
        var areas = this.areaContainer.restrictedAreas;
        var isConnected = true;
        for (var i = 0; i < areas.length; i++) {
            var a = areas[i];
            for (var j = 0; j < a.corners.length; j++) {

                isConnected = !checkPathIntersectsRectangle(a.SouthWestX, a.SouthWestY, a.NorthEastX, a.NorthEastY,
                                c.X, c.Y, p.X, p.Y);
                if (!isConnected) {
                    return;
                }
            }
        }
        if (isConnected) {
            var cDistance = d(c.X, c.Y, p.X, p.Y);
            p.edges.push({
                vertex: c,
                distance: cDistance
            });
            c.edges.push({
                vertex: p,
                distance: cDistance,
                disposable: true,
            });
        }
    }

    this.doDijkstras = function (p1, p2, edges) {
        var verts = this.buildGraph(p2);
        p1.algoDist = 0;
        verts.push(p1);
        while (verts.length > 0) {

            var u = popArrayMin(verts);
            if (u == p2) {
                //We found it, break.
                break;
            }
            for (var i = 0; i < u.edges.length; i++) {
                var edge = u.edges[i];
                var v = edge.vertex;
                var alt = u.algoDist + edge.distance;
                if (alt < v.algoDist) {
                    v.algoDist = alt;
                    v.prev = u;
                }
            }
        }
        return getDijkstrasResult(p1, p2);
    }

    function getDijkstrasResult(p1, p2) {
        var result = [];
        var current = p2;
        while (current && current.prev != p1) {
            result.push(current.prev);
            current = current.prev;
        }
        //The algorithm was successful
        if (current) {
            result.reverse();
            return result;
        } else {
            return [];
        }
    }

    function popArrayMin(arr) {
        var minValue = Infinity;
        var minIndex = -1;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].algoDist < minValue) {
                minIndex = i;
                minValue = arr[i].algoDist;
            }
        }
        return arr.splice(minIndex, 1)[0];
    }


    this.buildGraph = function (endPoint) {
        var areas = this.areaContainer.restrictedAreas;
        var edges = [];
        for (var i = 0; i < areas.length; i++) {
            var area = areas[i];
            edges = edges.concat(area.corners);
        }
        for (var i = 0; i < edges.length; i++) {
            edges[i].algoDist = Infinity
            edges[i].prev = null;
        }
        endPoint.algoDist = Infinity;
        edges.push(endPoint);
        return edges;
    }

    
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

    if (a_p1x > a_p2x) {
        minX = a_p2x;
        maxX = a_p1x;
    }

    // Find the intersection of the segment's and rectangle's x-projections

    if (maxX > a_rectangleMaxX) {
        maxX = a_rectangleMaxX;
    }

    if (minX < a_rectangleMinX) {
        minX = a_rectangleMinX;
    }

    if (minX > maxX) // If their projections do not intersect return false
    {
        return false;
    }

    // Find corresponding min and max Y for min and max X we found before

    minY = a_p1y;
    maxY = a_p2y;

    dx = a_p2x - a_p1x;

    if (Math.abs(dx) > 0.0000001) {
        a = (a_p2y - a_p1y) / dx;
        b = a_p1y - a * a_p1x;
        minY = a * minX + b;
        maxY = a * maxX + b;
    }

    if (minY > maxY) {
        tmp = maxY;
        maxY = minY;
        minY = tmp;
    }

    // Find the intersection of the segment's and rectangle's y-projections

    if (maxY > a_rectangleMaxY) {
        maxY = a_rectangleMaxY;
    }

    if (minY < a_rectangleMinY) {
        minY = a_rectangleMinY;
    }

    if (minY > maxY) // If Y-projections do not intersect return false
    {
        return false;
    }

    return true;
}

function checkPathIntersectsArea(p1, p2, areas) {
    for (var i = 0; i < areas.length; i++) {
        var int = checkPathIntersectsRectangle(area.SouthWestX, area.SouthWestY, area.NorthEastX, area.NorthEastY,
            p1.X, p1.Y, p2.X, p2.Y);
        if (int) {
            return int;
        }
    }
    return false;
}


//Convenience constructor for the waypoint. Can construct itself from information from the server, but
//also with minimal knowledge so that the path generator has a better time building one.
function Waypoint(info) {

    this.updateInfo = function (info) {
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

    this.updateInfo(info);
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
    return wgsToMeters.inverse([base.X, y])[1];
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

function areaToEuclidean(area) {
    var latlon = {
        Latitude: area.NorthEastLatitude,
        Longitude: area.NorthEastLongitude
    }
    LatLongToXY(latlon);
    area.NorthEastX = latlon.X;
    area.NorthEastY = latlon.Y;
    latlon = {
        Latitude: area.SouthWestLatitude,
        Longitude: area.SouthWestLongitude
    }
    LatLongToXY(latlon);
    area.SouthWestX = latlon.X;
    area.SouthWestY = latlon.Y;
}

//Uses pythagoream theorem to calculate the distance between two points.
//Only works if you are using UTM or some equivalent. Does not work on lat longs.
function calculateDistance(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
}

var d = calculateDistance;
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

function findWaypointById(wps, id) {
    for (var i = 0; i < wps.length; i++) {
        if (wps[i].Id == id) {
            return wps[i];
        }
    }
    return null;
}