
//Stores the vehicles received from the AJAX call.
var vehicles;
//The URL where we will perform the AJAX call to get the vehicle info from the DB.
var uri = '/api/flightstate';
var runSim = false;
var dt = 1000; //Timestep in milliseconds
var phases = ["preparing", "enroute", "delivering", "returning", "landing"];

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

function createVehicles() {
    $.ajax({
        url: uri,
        success: function (data, textStatus, jqXHR) {
            console.log(data);
            vehicles = data;
            prepareVehicles(vehicles);
            for (var i = 0; i < vehicles.length; i++) {
                assignMission(vehicles[i]);
            }
            updateButtons();
        }
    });
}

function prepareVehicles(vehs) {
    for(i = 0; i < vehs.length; i++) {
        vehicle = vehs[i];
        vehicle.X = longToX(vehicle.Longitude);
        vehicle.Y = latToY(vehicle.Latitude);
    }
}

function assignMission(vehicle) {
    var rotation = Math.random() * 360;
    var distance = Math.random() * radius;
    var xAdd = Math.cos(rotation) * distance + base.X;
    var yAdd = Math.sin(rotation) * distance + base.Y;
    var latitude = yToLat(yAdd);
    var longitude = xToLong(xAdd);
    var mission = {
        Phase: "enroute",
        Longitude: longitude,
        Latitude: latitude,
        X: xAdd,
        Y: yAdd,
    }
    vehicle.Mission = mission;
}

function buildSim() {
    createVehicles();
}

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

function deadReckon(vehicle, dt) {
    var mis = vehicle.Mission;
    var velocity = 20; //m/s
    heading = calculateHeading(vehicle.X, vehicle.Y, mis.X, mis.Y);
    vehicle.VelocityX = Math.sin(heading) * velocity;
    vehicle.VelocityY = Math.cos(heading) * velocity;
    var distanceX = vehicle.Mission.X - vehicle.X;
    var distanceY = vehicle.Mission.X - vehicle.Y;
    var dX = vehicle.VelocityX * dt;
    var dY = vehicle.VelocityY * dt;
    console.log(dX + " " + dY);
    if (dX > distanceX && dY > distanceY) {
        //We are at the target, stop and set dX to the distance to put us over the target
        dX = distanceX;
        dY = distanceY;
        vehicle.VelocityX = 0;
        vehicle.VelocityY = 0;
        //Increment the phase for the next loop.
        vehicle.Mission.Phase = "delivering";
    }
    vehicle.X += dX;
    vehicle.Y += dY;
    XYToLatLong(vehicle);
}

function processVehicle(vehicle, dt) {
    switch (vehicle.Mission.Phase) {
        case "enroute":
            deadReckon(vehicle, dt);
            console.log(vehicle);
            break;
    }
    
}

function pushFlightUpdates(vehicles) {

}

function updateButtons() {
    var startButton = $("#start");
    var stopButton = $("#stop");
    if (runSim) {
        startButton.addClass("disabled");
        stopButton.removeClass("disabled");
    }
    else {
        startButton.removeClass("disabled");
        stopButton.addClass("disabled");
    }
}

function start(eventObject) {
    runSim = true;
    updateButtons();
    mainLoop();
}

function mainLoop() {
    for (i = 0; i < vehicles.length; i++) {
        processVehicle(vehicles[i], dt/1000);
    }
    pushFlightUpdates(vehicles);
    if (runSim) {
        setTimeout(mainLoop, dt);
    }
}

function setCallbacks() {
    $("#start").click(start);
    $("#stop").click(function (eventObject) {
        runSim = false;
        updateButtons();
    });
}

$(document).ready(function () {
    setCallbacks();
    buildSim();
});
