
/**
* A class that represent a vehicle. It contains one mission and one command so far, as well as one flight state.
* The vehicle doesn't need to have more than that to run the simulation (for now at least). It comes with the
* functins that allow it to behave kind of autonomously. It just goes straight to it's destination.
*/
function Vehicle(vehicleInfo, reporter) {
    this.Id = vehicleInfo.Id;
    this.Callsign = vehicleInfo.Callsign;
    this.Mileage = vehicleInfo.Mileage;
    this.NumDeliveries = vehicleInfo.NumDeliveries;
    this.FlightState = vehicleInfo.FlightState;
    this.Schedule = vehicleInfo.Schedule;
    this.Mission = vehicleInfo.Schedule.Missions[0];
    this.Schedule = vehicleInfo.Schedule;
    this.Objective = null;
    this.Command = null;
    this.descending = true;
    this.reporter = reporter;

    this.setReporter = function (reporter) {
        this.reporter = reporter;
    }

    this.appendLonLat = function (obj, point) {
        var pointText = point.Geography.WellKnownText
        var results = pointText.match(/-?\d+(\.\d+)?/g);
        obj.Longitude = parseFloat(results[0]);
        obj.Latitude = parseFloat(results[1]);
        obj.Altitude = parseFloat(results[2]);
        LatLongToXY(obj);
    }

    this.appendLonLat(this.FlightState, this.FlightState.Position);
    this.appendLonLat(this.Mission, this.Mission.DestinationCoordinates);

    //Functions. Careful not to add global helper functions here.
    this.process = function (dt) {
        if (this.Command != null) {
            this.performCommand(dt);
        }
        else if (this.Mission != null){
            this.performMission(dt);
        }
        else if (!this.isAtBase()) {
            this.backToBase(dt);
        }
        else {
            this.FlightState.BatteryLevel += 5 * dt / 18000;
            if (this.FlightState.BatteryLevel > 1) {
                this.FlightState.BatteryLevel = 1;
            }
            //Make sure we don't drop the battery level 
            return;
        }

        this.FlightState.BatteryLevel -= dt / 1800;

        reporter.updateFlightState(this.FlightState);
    };
    //Advances the aircraft directly towards its destination. Nothing fancy here.
    this.deadReckon = function (dt, X, Y) {
        var reachedDest = false;
        var velocity = 20; //m/s
        //Find the direction it wants to go there
        heading = calculateHeading(this.FlightState.X, this.FlightState.Y, X, Y);
        //Update the vehicle's yaw.
        //TODO: Make it actually spin slower rather than spinning instantly.
        this.FlightState.Yaw = heading;
        this.FlightState.VelocityX = Math.sin(heading) * velocity;
        this.FlightState.VelocityY = Math.cos(heading) * velocity;
        var distanceX = X - this.FlightState.X;
        var distanceY = Y - this.FlightState.Y;
        var dX = this.FlightState.VelocityX * dt;
        var dY = this.FlightState.VelocityY * dt;
        //The distance to the target is less than the distance we would travel, i.e. it's reached it's destination
        if (Math.sqrt(distanceX*distanceX+distanceY*distanceY) < Math.abs(velocity*dt)) {
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

    //Perform whatever command 
    this.performCommand = function(dt) {
        switch(this.Command.Type) {
            case "target": //Target commands just need to be dead reckoned towards the objective.
                if (this.deadReckon(dt, this.Command.X, this.Command.Y)) {
                    this.Command = null;
                }
            case "hover":
                if (this.deadReckon(dt, this.Command.X, this.Command.Y)) {
                    if (this.Command.Time > 0) {
                        this.Command.Time -= dt;
                    }
                }
        }
    }

    this.performMission = function (dt) {
        switch (this.Mission.Phase) {
            case "takeoff":
                if (this.takeOff(dt)) {
                    this.Mission.Phase = "enroute";
                }
            case "enroute":
                if (this.deadReckon(dt, this.Mission.X, this.Mission.Y)) {
                    this.Mission.Phase = "delivering";
                }
                break;
            case "delivering":
                if (this.deliver(dt, 200, 400, 5)) {
                    this.Mission.phase = "back to base";
                }
                break;
            case "back to base":
                if (this.backToBase(dt, base.X, base.Y)) {
                    this.Mission.phase = "done";
                    this.Mission = null;
                }
                break;
        }
    }

    this.setCommand = function (target) {
        this.Command = target;
    }

    //Makes the vehicle go back to base
    this.backToBase = function (dt) {
        var thisX = this.FlightState.X;
        var thisY = this.FlightState.Y;
        if (calculateDistance(thisX, thisY, base.X, base.Y) < 10) {
            this.deadReckon(dt, base.X, base.Y);
            return false;
        }
        else {
            return this.targetAltitude(dt, 0, 5);
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
}

function Reporter() {
    this.hub = $.connection.vehicleHub;

    this.updateMission = function (mission, opts) {
        this.putToServer('api/mission/' + mission.Id, mission);
    }

    this.updateFlightState = function (fs, opts) {
        this.hub.server.pushFlightStateUpdate(fs);
    }

    this.putToServer = function (url, data, success) {
        $.ajax({ url: url, data: data, sucess: success, type: 'PUT' });
    }
}

//Helper functions and globals.

//http://en.wikipedia.org/wiki/Equirectangular_projection
//http://stackoverflow.com/questions/16266809/convert-from-latitude-longitude-to-x-y

//base of operations.
var base = {
    Latitude: 34.242034,
    Longitude: -118.528763,
}

var metersProj = proj4.Proj('EPSG:3785');
var WGS84Proj = proj4.Proj('EPSG:4326');
var wgsToMeters = proj4(WGS84Proj, metersProj);
var standard = Math.cos(base.Latitude);
var earthRadius = 6378100; //Radius of earth in meters
var baseXY = wgsToMeters.forward([base.Longitude, base.Longitude]);
base.X = baseXY[0];
base.Y = baseXY[1];


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

function calculateHeading(x1, y1, x2, y2) {
    var dx = (x2 - x1);
    var dy = (y2 - y1);
    var heading = Math.atan2(dx, dy);
    return heading;
}

function XYToLatLong(vehicle) {
    var longLat = wgsToMeters.inverse([vehicle.X, vehicle.Y]);
    vehicle.Longitude = longLat[0];
    vehicle.Latitude = longLat[1];
}

function LatLongToXY(vehicle) {
    var xy = wgsToMeters.forward([vehicle.Longitude, vehicle.Latitude]);
    vehicle.X = xy[0];
    vehicle.Y = xy[1];
}

function calculateDistance(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}