
function Vehicle(vehicleInfo) {
    this.Id = vehicleInfo.Id;
    this.Callsign = vehicleInfo.Callsign;
    this.Mileage = vehicleInfo.Mileage;
    this.NumDeliveries = vehicleInfo.NumDeliveries;
    this.FlightState = null;
    this.Mission = null;
    

    //Functions. Careful not to add helper functions here.
    this.process = process;
    this.deadReckon = deadReckon;
}

//Methods

function process(dt) {
    switch (this.Mission.Phase) {
        case "enroute":
            this.deadReckon(dt);
            console.log(this);
            break;
    }
}

function deadReckon(dt) {
    var mis = this.Mission;
    var velocity = 20; //m/s
    heading = calculateHeading(this.FlightState.X, this.FlightState.Y, mis.X, mis.Y);
    this.FlightState.VelocityX = Math.sin(heading) * velocity;
    this.FlightState.VelocityY = Math.cos(heading) * velocity;
    var distanceX = this.Mission.X - this.FlightState.X;
    var distanceY = this.Mission.X - this.FlightState.Y;
    var dX = this.FlightState.VelocityX * dt;
    var dY = this.FlightState.VelocityY * dt;
    console.log(dX + " " + dY);
    if (dX > distanceX && dY > distanceY) {
        //We are at the target, stop and set dX to the distance to put us over the target
        dX = distanceX;
        dY = distanceY;
        this.FlightState.VelocityX = 0;
        this.FlightState.VelocityY = 0;
        //Increment the phase for the next loop.
        this.Mission.Phase = "delivering";
    }
    this.FlightState.X += dX;
    this.FlightState.Y += dY;
    XYToLatLong(this.FlightState);
}

//Helper functions and globals.

//http://en.wikipedia.org/wiki/Equirectangular_projection
//http://stackoverflow.com/questions/16266809/convert-from-latitude-longitude-to-x-y

//base of operations. Used as 0,0 in the projection
var base = {
    Latitude: 34.242034,
    Longitude: -118.528763,
}
var standard = Math.cos(base.Latitude);
var earthRadius = 6378100; //Radius of earth in meters
base.X = longToX(base.Longitude);
base.Y = latToY(base.Latitude);
function latToY(latitude) {
    return latitude * earthRadius;
}

function yToLat(y) {
    return y / earthRadius;
}

function longToX(longitude) {
    return longitude * standard * earthRadius;
}

function xToLong(x) {
    return x / (standard * earthRadius);
}
//Radius of operations in meters.
var radius = 16093.4;

function calculateHeading(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var heading = Math.atan2(dy, dx);
    return heading;
}

function XYToLatLong(vehicle) {
    vehicle.Latitude = yToLat(vehicle.Y);
    vehicle.Longitude = xToLong(vehicle.X);
}

function LatLongToXY(vehicle) {
    vehicle.Y = latToY(vehicle.Latitude);
    vehicle.X = longToX(vehicle.Longitude);
}