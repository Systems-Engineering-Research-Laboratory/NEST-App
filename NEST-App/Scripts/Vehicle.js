
function Vehicle(vehicleInfo) {
    this.Id = vehicleInfo.Id;
    this.Callsign = vehicleInfo.Callsign;
    this.Mileage = vehicleInfo.Mileage;
    this.NumDeliveries = vehicleInfo.NumDeliveries;
    this.FlightState = null;
    this.Mission = null;
    this.Objective = null;
    this.Command = null;
    

    //Functions. Careful not to add helper functions here.
    this.process = function (dt) {
        if (this.Command != null) {
            this.performCommand(dt);
        }
        else {
            if (this.Mission == null) {
                return;
            }
            switch (this.Mission.Phase) {
                case "enroute":
                    if (this.deadReckon(dt, this.Mission.X, this.Mission.Y)) {
                        this.Mission.Phase = "delivering";
                    }
                    console.log(this);
                    break;
            }
        }
    };
    this.deadReckon = function (dt, X, Y) {
        var reachedDest = false;
        var velocity = 20; //m/s
        heading = calculateHeading(this.FlightState.X, this.FlightState.Y, X, Y);
        this.FlightState.Yaw = heading;
        this.FlightState.VelocityX = Math.sin(heading) * velocity;
        this.FlightState.VelocityY = Math.cos(heading) * velocity;
        var distanceX = X - this.FlightState.X;
        var distanceY = Y - this.FlightState.Y;
        var dX = this.FlightState.VelocityX * dt;
        var dY = this.FlightState.VelocityY * dt;
        if (Math.sqrt(distanceX*distanceX+distanceY*distanceY) < Math.abs(velocity*dt)) {
            //We are at the target, stop and set dX to the distance to put us over the target
            dX = distanceX;
            dY = distanceY;
            this.FlightState.VelocityX = 0;
            this.FlightState.VelocityY = 0;
            //Increment the phase for the next loop.
            reachedDest = true;
        }
        this.FlightState.X += dX;
        this.FlightState.Y += dY;
        XYToLatLong(this.FlightState);
        return reachedDest;
    };

    this.performCommand = function(dt) {
        switch(this.Command.Type) {
            case "target":
                if (this.deadReckon(dt, this.Command.X, this.Command.Y)) {
                    this.Command = null;
                }
        }
    }

    this.setCommand = function (target) {
        this.Command = target;
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