var map;
var homeBase = new google.maps.LatLng(34.2417, -118.529);
var uavs = {};

//DroneSelection
var selectedDrones = []; //store drones selected from any method here
var storedGroups = []; //keep track of different stored groupings of UAVs
var ctrlDown = false;
var flightLines = [];
var selectedUAV; //the uav that's been selected

//DroneTrails
var selectedTrail; //the trail that the selected uav has

//TODO: Do we need this? Are we changing this to "var theMap = map;" ?
var mapListeners = map; //use this to add listeners to the map

function uavMarkers(data, textStatus, jqXHR) {
    var pointText, results;
    console.log("Pulling Flightstates...", textStatus);
    for (var i = 0; i < data.length; i++) {
        //TODO Make a copier fuction for this:
        uavs[data[i].Id] = {};
        uavs[data[i].Id].Id = data[i].Id;
        uavs[data[i].Id].FlightState = data[i].FlightState;
        uavs[data[i].Id].Schedule = data[i].Schedule;
        uavs[data[i].Id].Missions = data[i].Schedule.Missions;
        var fs = uavs[data[i].Id].FlightState;
        uavs[data[i].Id].Alt = data[i].FlightState.Altitude;
        uavs[data[i].Id].Callsign = data[i].Callsign;
        uavs[data[i].Id].Battery = data[i].FlightState.BatteryLevel;
        uavs[data[i].Id].Position = new google.maps.LatLng(fs.Latitude, fs.Longitude);
        uavs[data[i].Id].Mission = data[i].Mission;

        var mis = uavs[data[i].Id].Mission;
        uavs[data[i].Id].Destination = new google.maps.LatLng(mis.Latitude, mis.Longitude);

        //Creates the flightpath line from uav position to destination
        flightLines[data[i].Id] = new google.maps.Polyline(mapStyles.flightPathOptions);
        flightLines[data[i].Id].setPath([uavs[data[i].Id].Position, uavs[data[i].Id].Destination]);

        var markerCircle = new google.maps.Marker({
            position: uavs[data[i].Id].Position,
            icon: mapStyles.uavCircleBlack
        });
        var marker = new MarkerWithLabel({
            position: uavs[data[i].Id].Position,
            icon: mapStyles.uavSymbolBlack,
            labelContent: uavs[data[i].Id].Callsign + '<div style="text-align: center;"><b>Alt: </b>' + uavs[data[i].Id].Alt + '<br/><b>Bat: </b>' + uavs[data[i].Id].Battery + '</div>',
            labelAnchor: new google.maps.Point(95, 20),
            labelClass: "labels",
            labelStyle: { opacity: 0.75 },
            zIndex: 999999,
            uav: uavs[data[i].Id]
        });

        uavs[data[i].Id].marker = marker;
        uavs[data[i].Id].markerCircle = markerCircle;
        uavs[data[i].Id].flightPath = flightLines[data[i].Id];
        uavs[data[i].Id].markerCircle.setMap(map);
        uavs[data[i].Id].marker.setMap(map);
        marker.set('flightPath', flightLines[data[i].Id]);
        //When fired, the UAV is marked as 'selected'
        google.maps.event.addListener(marker, 'click', (function () {droneSelection.CtrlSelect(this, selectedDrones, selectedUAV)}));
        //Events to ccur when a UAV's marker icon has changed (ie the marker's been clicked)
        google.maps.event.addListener(marker, "icon_changed", function () { droneSelection.SelectionStateChanged(this, selectedDrones, selectedUAV, flightLines, droneTrails.uavTrails, selectedTrail) });
    }
}

function goTo_show() {
    document.getElementById("CommPopPlaceHolder").style.display = "block";
}

function goTo_hide() {
    document.getElementById("CommPopPlaceHolder").style.display = "none";
}

function clear() {
    document.getElementById("go_lat").value = "";
    document.getElementById("go_long").value = "";
}

$(document).ready(function () {
    map = new google.maps.Map(document.getElementById('map-canvas'), mapStyles.mapOptions);
    var counter = 0, parse;
    var distanceCircle = new google.maps.Circle(mapStyles.distanceCircleOptions);
    distanceCircle.setCenter(homeBase);
    distanceCircle.setMap(map);
    var homeControlDiv = document.createElement('div');
    var homeControl = new mapStyles.BaseControl(homeControlDiv, map, homeBase);
    var marker = new google.maps.Marker({
        position: homeBase,
        icon: mapStyles.goldStarBase,
        map: map
    });
    homeControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT].push(homeControlDiv);

    // add event listener
    if (document.getElementById("go_lat") != isNaN && document.getElementById("go_long") != isNaN) {
        document.getElementById("goWaypoint").addEventListener("click", droneTrails.goWaypoint(document.getElementById("go_lat"), document.getElementById("go_long")));
    }

    $.ajax({
        url: '/api/uavs/getuavinfo',
        success: function (data, textStatus, jqXHR) {
            uavMarkers(data, textStatus, jqXHR);
        }
    });
    
    /**** Currently in progress 
    google.maps.event.addListener(map, 'click', function () {
        if (infobox) {
            infobox.close();
        }
    });
   */

    //Right click for infowindow coordinates on map
    google.maps.event.addListener(map, "rightclick", function (event) { mapFunctions.GetLatLong(this, event) });

    mapDraw.InitDrawingManager();
    mapDraw.drawingManager.setMap(map);
    mapDraw.drawingManager.setDrawingMode(null);
    google.maps.event.addListener(mapDraw.drawingManager, 'overlaycomplete', function (e) { mapDraw.OverlayComplete(e) });

    //Delete shapes and clear selection
    google.maps.event.addListener(mapDraw.drawingManager, 'drawingmode_changed', mapDraw.clearSelection);
    google.maps.event.addListener(map, 'click', mapDraw.clearSelection);
    google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', mapDraw.deleteSelectedShape);
    google.maps.event.addDomListener(document.getElementById('delete-all-button'), 'click', mapDraw.deleteAllShape());
    mapDraw.buildColorPalette(mapDraw.drawingManager);

    /* Event Log */
    var emitHub = $.connection.eventLogHub;
    $.connection.hub.start().done(function () {
        console.log("connection started for evt log");
    });
    var warningMessageCounter = 0;
  
    /* Vehicle Movement */
    var vehicleHub = $.connection.vehicleHub;
    vehicleHub.client.flightStateUpdate = function (vehicle) {
        //mapFunctions.vehicleHubUpdate(vehicle, uavs, selected);
        
        //console.log(vehicle); //move it down so it updates with the trail at a slower rate
        var LatLng = new google.maps.LatLng(vehicle.Latitude, vehicle.Longitude);
        //seperate trail dots a little bit
        if (counter == 0 || counter == 20) {
            console.log(vehicle);
            droneTrails.storeTrail(vehicle.Id, LatLng);
            if (counter == 20) {
                counter = 0;
            }
        } counter++;

        // draw trail
        if (selectedUAV && selectedTrail != undefined) {
            if (selectedTrail.length < 2)
                selectedTrail[selectedTrail.length - 1].setMap(map);
            else
                selectedTrail[selectedTrail.length - 2].setMap(map);
        }

        uavs[vehicle.Id].marker.setPosition(LatLng);
        uavs[vehicle.Id].markerCircle.setPosition(LatLng);
        parse = parseFloat(Math.round(vehicle.BatteryLevel * 100) / 100).toFixed(2);
        mapStyles.uavSymbolBlack.rotation = vehicle.Yaw;
        mapStyles.uavSymbolGreen.rotation = vehicle.Yaw;
        uavs[vehicle.Id].marker.setOptions({
            labelContent: uavs[vehicle.Id].Callsign + '<div style="text-align: center;"><b>Alt: </b>' + vehicle.Altitude + '<br/><b>Bat: </b>' + parse + '</div>',
            icon: uavs[vehicle.Id].marker.icon /// <-----------------TODO:  Isn't this redundant?
        });

        //console.log(parse);
        if (parse < .2) {
            //console.log(eventLog);
            //emitHub.server.emit(eventLog);
            if (warningMessageCounter == 0) {
                warningMessageCounter++;
                mapStyles.infobox.open(map, uavs[vehicle.Id].marker);
                mapStyles.infoboxAlert.open(map, uavs[vehicle.Id].marker);

                var eventLog = {
                    uav_id: uavs[vehicle.Id].Id,
                    message: mapStyles.message,
                    criticality: "critical",
                    uav_callsign: uavs[vehicle.Id].Callsign,
                    operator_screen_name: "Test Operator",
                    UAVId: uavs[vehicle.Id].Id
                };
                emitHub.server.emit(eventLog);
                $.ajax({
                    type: "POST",
                    url: "/api/uavs/postuavevent",
                    success: function () { },
                    data: eventLog
                });
            }
        }
    }
    
    vehicleHub.connection.start();

    var shiftPressed = false;
    $(window).keydown(function (evt) {
        if (evt.which === 16) {
            shiftPressed = true;
            //console.log("Shift key down");
        }
        if (evt.ctrlKey) {
            ctrlDown = true;
        }
        droneSelection.KeyBinding(selectedDrones, storedGroups, evt);
    }).keyup(function (evt) {
        if (evt.which === 16) {
            shiftPressed = false;
            //console.log("Shift key up");
        }
    });
    var mouseDownPos, gridBoundingBox = null, mouseIsDown = 0;
    var mapListeners = map;/// <-----------------------------TODO: Redundant?

    google.maps.event.addListener(mapListeners, 'mousemove', function (e) { mapFunctions.DrawBoundingBox(this, e, shiftPressed, gridBoundingBox, mouseIsDown, mouseDownPos) });
    google.maps.event.addListener(mapListeners, 'mousedown', function (e) { mapFunctions.StopMapDrag(this, e, shiftPressed, mouseIsDown, mouseDownPos) });
    google.maps.event.addListener(map, 'mouseup', function (e) {droneSelection.AreaSelect(this, e, mouseIsDown, shiftPressed, gridBoundingBox, selectedDrones, uavs)});
});