
/**
 * This script is a simulation that is meant to be run in the browser. It is used for testing in place of real
 * vehicles. The implication is that this simulation should communicate with the server through the same exact
 * interface that actual live vehicle would. Thus, this simulation's code should remain mostly unreferenced. 
 * It mostly interfaces with the server through SignalR for real time updates. The server will handle most of
 * the logic.
 *
 * It works by having a main loop that repeats every second (which can be adjusted for, the loop speed is
 * passed in to the update function). The sim can be stopped and started again. In the future, the view that
 * is tired too will eventually start displaying all the statuses of the UAV. 
 *
 */

//The URL where we will perform the AJAX call to get the vehicle info from the DB.
var uri = '/api/flightstate';
var runSim = false;
var dt = 1000; //Timestep in milliseconds
var phases = ["preparing", "enroute", "delivering", "returning", "landing"];




//Just appends the X and Y coordiante of vehicles to the objects.
function prepareVehicles(vehs) {
    for(i = 0; i < vehs.length; i++) {
        vehicle = vehs[i];
        vehicle.X = longToX(vehicle.Longitude);
        vehicle.Y = latToY(vehicle.Latitude);
    }
}

//Randomly assign missions to vehicles. It's dead code right now, but might be useful for debugging later on
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

//Pushes all the flight state information to the database.
function pushFlightUpdates(map, hub) {
    var ids = map.ids;
    var vehicles = map.vehicles;
    for (i = 0; i < ids.length; i++) {
        var id = ids[i];
        vehicles[id].FlightState.Timestamp = new Date(Date.now()).toISOString();
        console.log(vehicles[id]);
        hub.server.pushFlightStateUpdate(vehicles[id].FlightState);
    }
}

//Used to update which buttons are enabled and disabled.
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

//Pull flight state info from the database.
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

var availableMissions = [];
//Pull mission information from the database.
function getMissions(map) {
    var ids = map.ids;
    var vehicles = map.vehicles;
    $.ajax({
        url: '/api/missions',
        success: function (data, textStatus, jqXHR) {
            for (var i = 0; i < data.length; i++) {
                var idx = ids.indexOf(data[i].UAVId);
                if (idx == -1) {
                    // Unassigned mission, or we don't have the vehicle information.
                    availableMissions.push(data[i]);
                    continue;
                }
                var id = ids[idx];
                vehicles[id].Mission = data[i];
                LatLongToXY(vehicles[id].Mission);
            }
            updateButtons();
        }
    })
}

function scheduleMissions(vehicleMap, missions, hub) {
    if(missions.length == 0){
        return;
    }
    //Look for unassigned vehicles while there are missions
    for(var i = 0; i < vehicleMap.ids.length && missions.length > 0; i++){
        var id = vehicleMap.ids[i];
        var vehicle = vehicleMap.vehicles[id];
        if (vehicle.Mission == null) {
            //treat js array as a queue.
            vehicle.Mission = missions.shift();
            i--; //Shift i back
            vehicle.Mission.UAVId = vehicle.Id;
            LatLongToXY(vehicle.Mission);
            hub.server.assignMission(vehicle.Id, vehicle.Mission.Id);
        }
    }
}


$(document).ready(function () {
    //Stores the vehicles received from the AJAX call.
    var map = {
        vehicles: [],
        ids: []
    };

    var vehicleHub = $.connection.vehicleHub;

    //Throws 'undefined' is not a function error...commenting out..
    //$('.dropdown-toggle').dropdown();

    //Pull the vehicles from the database
    $.ajax({
        url: '/api/uavs',
        success: function (data, textStatus, jqXHR) { flightStateCb(map, data, textStatus, jqXHR); }
    });

    $("#start").click(start);
    $("#stop").click(stopSim);

    

    //Wait until the vehicle hub is connected before we can execute the main loop.
    //The main loop will push updates via signalr, don't want to do it prematurely.
    $.connection.hub.start().done(
        function () { connectedToHub(vehicleHub, map); }
        );
});

//Flight state callback. This function will be curried and passed to the ajax query.
function flightStateCb (map, data, textStatus, jqXHR) {
 
    for (var i = 0; i < data.length; i++) {
        map.vehicles[data[i].Id] = new Vehicle(data[i]);
        map.ids.push(data[i].Id);
        console.log(data[i].Id + " " + data[i].Callsign);
        $("#dropdown-UAVIds").append('<li role="presentation"><a class="UAVId" role="menuitem" tabindex="-1" href="#">' + data[i].Id + '</a></li>');
    }
    //I think this is in the wrong spot. It probably needs to be in connection.hub.start()
    $('.UAVId').click(function (eventObject) {
        var newId = vehicleHub.server.sendCommand({
            Id: 123,
            Latitude: 34.242034,
            Longitude: -118.528763,
            Altitude: 400,
            UAVId: id
        });
        console.log(newId);
    });

    getFlightStates(map);
}

function updateSimulation(vehicleHub, map) {
    //TODO: Add scheduler here
    //Do dead reckoning on each of the aircraft
    var vehicles = map.vehicles;
    var ids = map.ids;
    for (i = 0; i < ids.length; i++) {
        id = ids[i];
        vehicles[id].process(dt / 1000);
    }
    //Pushes the flight state updates
    pushFlightUpdates(map, vehicleHub);
    scheduleMissions(map, availableMissions, vehicleHub);
}

function connectedToHub(vehicleHub, map) {
    vehicleHub.server.joinGroup("vehicles");
    setSignalrCallbacks(vehicleHub, map);
    function mainLoop() {
        //This boolean is switched by the start sim and stop sim buttons
        if (runSim) {
            updateSimulation(vehicleHub, map);
        }
        setTimeout(mainLoop, dt);
    }
    mainLoop();
}

// This function sets all the callbacks that will be called with SignalR. Please put all callbacks here.
function setSignalrCallbacks(vehicleHub, map) {
    vehicleHub.client.flightStateUpdate = function (vehicle) {
        console.log(vehicle);
    }
    //This is the listener for getting target commands from signalr
    vehicleHub.client.sendTargetCommand = function (target, connId) {
        var idx = map.ids.indexOf(target.UAVId);
        if (idx == -1) {
            //If JS doesn't find the index, just return.
            return;
        }
        //Append some additional info for the sim.
        target.Type = "target";
        LatLongToXY(target);
        map.vehicles[map.ids[idx]].setCommand(target);
        //Send an ack to the server
        //Just accept ack all commands for now.
        vehicleHub.server.ackCommand({
            Id: 1234,
            CommandId: target.Id,
            Reason: "OK",
            CommadType: "CMD_NAV_Target",
        }, connId);
    }
    vehicleHub.client.broadcastAcceptedCommand = function (ack) {
        console.log(ack);
    }
}