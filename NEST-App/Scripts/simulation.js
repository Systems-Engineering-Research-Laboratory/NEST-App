
//Stores the vehicles received from the AJAX call.
var vehicles;
//The URL where we will perform the AJAX call to get the vehicle info from the DB.
var uri = '/api/flightstate';
var runSim = false;
var dt = 1; //Timestep in seconds
var phases = ["preparing", "enroute", "delivering", "returning", "landing"];

//base of operations. Used as 0,0 in the projection
var serl = {
    latitude: 34.242034,
    longitude: -118.528763
}
//http://en.wikipedia.org/wiki/Equirectangular_projection
//http://stackoverflow.com/questions/16266809/convert-from-latitude-longitude-to-x-y
var standard = Math.cos(serl.latitude);
var earthRadius = 6378100; //Radius of earth in meters
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
            assignMissions(vehicles);
            $("#start").click(start);
        }
    });
}

function assignMissions(vehs) {
    for (i = 0; i < vehs.length; i++) {
        var rotation = Math.random() * 360;
        var distance = Math.random() * radius;
        var xAdd = cos(rotation) * distance;
        var yAdd = sin(rotation) * distance;
        var latitude = yToLat(yAdd);
        var longitude = xToLong(xAdd);
        var mission = {
            phase: "delivering",
            Longitude: longitude,
            Latitude: latitude,
            x: xAdd,
            y: yAdd,
        }
        vehs[i].mission = mission;
    }
}

function buildSim() {
    createVehicles();
}

function calculateHeading(lat1, long1, lat2, long2) {
    var dx = lat2 - lat1;
    var dy = long2 - long1;
    var heading = Math.atan2(dy, dx);
    return heading;
}

function deadReckon(vehicle) {
    var mis = vehicle.mission;
    var velocity = 20; //m/s
    var point = {
        Latitude: mis.Latitude,
        Longitude: mis.Longitude,
    };
    if (mis.phase === "delivering" || mis.phase === "preparing" || mis.phase === "landing") {
        var velocity = 0;
    }
    heading = calculateHeading(vehicle.Latitude, vehicle.Longitude, mis.Latitude, mis.Longitude);
}

function processVehicle(vehicle) {
    deadReckon(vehicle);
}

function start(eventObject) {
    runSim = true;
    mainLoop();
}

function mainLoop() {

    for (i = 0; i < vehicles.length; i++) {
        processVehicle(vehicle[i]);
    }
    if (runSim) {
        setTimeout(mainLoop, dt);
    }
}

$(document).ready(function () {
    buildSim();
});
