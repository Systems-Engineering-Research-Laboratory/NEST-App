

//The URL where we will perform the AJAX call to get the vehicle info from the DB.
var uri = '/api/flightstate';
var runSim = false;
var dt = 1000; //Timestep in milliseconds
var phases = ["preparing", "enroute", "delivering", "returning", "landing"];




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

function pushFlightUpdates(map, hub) {
    var ids = map.ids;
    var vehicles = map.vehicles;
    for (i = 0; i < ids.length; i++) {
        var id = ids[i];
        vehicles[id].FlightState.Timestamp = new Date(Date.now()).toISOString();
        hub.server.pushFlightStateUpdate(vehicles[id].FlightState);
    }
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
}

function stopSim(eventObject) {
    runSim = false;
    updateButtons();
}

function getFlightStates(map) {
    $.ajax({
        url: '/api/flightstate',
        success: function (data, textStatus, jqXHR) {
            for (var i = 0; i < data.length; i++) {
                curVeh = map.vehicles[data[i].UAVId];
                curVeh.FlightState = data[i];
                LatLongToXY(curVeh.FlightState);
            }
            getMissions(map);
        }
    })
}

function getMissions(map) {
    var ids = map.ids;
    var vehicles = map.vehicles;
    for (var i = 0; i < map.ids.length; i++) {
        assignMission(vehicles[ids[i]]);
    }
    updateButtons();
}



$(document).ready(function () {
    //Stores the vehicles received from the AJAX call.
    var map = {
        vehicles: [],
        ids: []
    };

    $.ajax({
        url: '/api/uavs',
        success: function (data, textStatus, jqXHR) {
            for (var i = 0; i < data.length; i++) {
                map.vehicles[data[i].Id] = new Vehicle(data[i]);
                map.ids.push(data[i].Id);
            }
            getFlightStates(map);
        }
    });

    $("#start").click(start);
    $("#stop").click(stopSim);

    var vehicleHub = $.connection.vehicleHub;
    vehicleHub.client.flightStateUpdate = function (vehicle) {
        console.log(vehicle);
    }
    $.connection.hub.start().done(function mainLoop() {
        if (runSim) {
            var vehicles = map.vehicles;
            var ids = map.ids;
            for (i = 0; i < ids.length; i++) {
                id = ids[i];
                vehicles[id].process(dt/1000);
            }
            pushFlightUpdates(map, vehicleHub);
        }
        setTimeout(mainLoop, dt);
    });
});
