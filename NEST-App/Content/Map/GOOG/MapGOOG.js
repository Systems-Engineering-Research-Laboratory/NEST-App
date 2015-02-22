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
var wpm;

function uavMarkers(data, textStatus, jqXHR) {
    console.log("Pulling Flightstates...", textStatus);
    //mapFunctions.PopulateUAVs(data, uavs, flightLines);
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
        uavs[data[i].Id].Orientation = data[i].FlightState.Yaw;

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
            uav: uavs[data[i].Id],
            uavSymbolBlack: {
                path: 'M 355.5,212.5 513,312.25 486.156,345.5 404.75,315.5 355.5,329.5 308.25,315.5 224.75,345.5 197.75,313 z',
                fillColor: 'black',
                fillOpacity: 0.8,
                scale: 0.2,
                zIndex: 1,
                anchor: new google.maps.Point(355, 295)
            },
            uavSymbolGreen: {
                path: 'M 355.5,212.5 513,312.25 486.156,345.5 404.75,315.5 355.5,329.5 308.25,315.5 224.75,345.5 197.75,313 z',
                fillColor: 'green',
                fillOpacity: 0.8,
                scale: 0.2,
                zIndex: 1,
                anchor: new google.maps.Point(355, 295)
            }
        });
        marker.set('selected', false);
        wpm.addMarker(marker);
        uavs[data[i].Id].marker = marker;
        uavs[data[i].Id].markerCircle = markerCircle;
        uavs[data[i].Id].flightPath = flightLines[data[i].Id];
        uavs[data[i].Id].markerCircle.setMap(map);
        uavs[data[i].Id].marker.setMap(map);

        //marker.set('flightPath', flightLines[data[i].Id]);
        //When fired, the UAV is marked as 'selected'
        google.maps.event.addListener(marker, 'click', (function () {droneSelection.CtrlSelect(this, selectedDrones, selectedUAV)}));
        //Events to ccur when a UAV's marker icon has changed (ie the marker's been clicked)
        //google.maps.event.addListener(marker, "icon_changed", function () { droneSelection.SelectionStateChanged(this, selectedDrones, selectedUAV, flightLines, droneTrails.uavTrails, selectedTrail) });
        google.maps.event.addListener(marker, 'selection_changed', function () { droneSelection.SelectionStateChanged(this, selectedDrones, selectedUAV, flightLines, droneTrails.uavTrails, selectedTrail) });
    }
}

$(document).ready(function () {
    wpm = new WaypointManager(map);
    map = new google.maps.Map(document.getElementById('map-canvas'), mapStyles.mapOptions);
    /*map = new GMaps({
        div:'#map-canvas',
    });
    map.setOptions(mapStyles.mapOptions);*/
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
    //google.maps.event.addListener(map, "rightclick", function (event) { mapFunctions.GetLatLong(this, event) });

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

    /////////////////////////////
  
    /////////////////////////////

    new RestrictedAreasContainer(map, mapDraw.drawingManager)
    /* Event Log */
    var emitHub = $.connection.eventLogHub;

    //show the notification for every one
    emitHub.client.showNote = function (lat, lng, notifier, message) {
        mapFunctions.ConsNotifier(map, lat, lng, notifier, message);
        
    }

    $.connection.hub.start().done(function () {
        console.log("connection started for evt log");

        google.maps.event.addListener(map, "rightclick", function (event) {

            /*mapFunctions.note_show();
            document.getElementById("send").addEventListener("click", function () {
                emitHub.server.sendNote(event.latLng.lat(), event.latLng.lng(), document.getElementById("notifier").value, document.getElementById("message").value);
                mapFunctions.note_hide();
            });*/
        });


    });
    emitHub.client.newEvent = function (evt) {
        console.log(evt);
        //console.log(document.getElementById("infobox"));
        console.log(document.getElementById("warn"));
        document.getElementById("infobox").innerHTML = "<p id='warn'>Warning:</p>"+evt.message;
        document.getElementById("warn").style.color = "red";
        document.getElementById("warn").style.fontWeight = "bold";
        document.getElementById("warn").style.margin = 0;
        mapStyles.infobox.open(map, uavs[evt.UAVId].marker);
        mapStyles.infoboxAlert.open(map, uavs[evt.UAVId].marker);
    }

    var warningMessageCounter = 0;
  
    /* Vehicle Movement */
    var vehicleHub = $.connection.vehicleHub;
    vehicleHub.client.flightStateUpdate = function (vehicle) {
        //mapFunctions.vehicleHubUpdate(vehicle, uavs, selected);

        //console.log(vehicle);

        var LatLng = new google.maps.LatLng(vehicle.Latitude, vehicle.Longitude);
        droneTrails.storeTrail(vehicle.Id, LatLng);

        // draw trail
        if (selectedUAV && selectedTrail != undefined) {
            if (selectedTrail.length < 2)
                selectedTrail[selectedTrail.length - 1].setMap(map);
            else
                selectedTrail[selectedTrail.length - 2].setMap(map);
        }

        uavs[vehicle.Id].marker.setPosition(LatLng);
        uavs[vehicle.Id].markerCircle.setPosition(LatLng);
        uavs[vehicle.Id].Battery = vehicle.BatteryLevel;
        uavs[vehicle.Id].Alt = vehicle.Altitude;
        uavs[vehicle.Id].BatteryCheck = parseFloat(Math.round(vehicle.BatteryLevel * 100) / 100).toFixed(2);
        uavs[vehicle.Id].Yaw = vehicle.Yaw;


        if ((Math.round((10000000 * uavs[vehicle.Id].Orientation)) / 10000000) != (Math.round((10000000 * uavs[vehicle.Id].Yaw)) / 10000000)) {

            uavs[vehicle.Id].Orientation = uavs[vehicle.Id].Yaw;
           
            uavs[vehicle.Id].marker.uavSymbolBlack.rotation = uavs[vehicle.Id].Yaw;
            uavs[vehicle.Id].marker.uavSymbolGreen.rotation = uavs[vehicle.Id].Yaw;

            if (uavs[vehicle.Id].marker.selected == true)
                uavs[vehicle.Id].marker.setOptions({
                    icon: uavs[vehicle.Id].marker.uavSymbolGreen
                });
            else
                uavs[vehicle.Id].marker.setOptions({
                    icon: uavs[vehicle.Id].marker.uavSymbolBlack
                })
        }
        uavs[vehicle.Id].marker.setOptions({
            labelContent: uavs[vehicle.Id].Callsign + '<div style="text-align: center;"><b>Alt: </b>' + uavs[vehicle.Id].Alt + '<br/><b>Bat: </b>' + uavs[vehicle.Id].BatteryCheck + '</div>'
        });
        
        //console.log(parse);
        if (uavs[vehicle.Id].BatteryCheck < .2) {
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

    $(window).keydown(function (evt) {
        if (evt.which === 16) {
            mapFunctions.shiftPressed = true;
            //console.log("Shift key down");
        }
        if (evt.ctrlKey) {
            ctrlDown = true;
        }
        droneSelection.KeyBinding(selectedDrones, storedGroups, evt);
    }).keyup(function (evt) {
        if (evt.which === 16) {
            mapFunctions.shiftPressed = false;
            //console.log("Shift key up");
        }
    });
    google.maps.event.trigger(map, 'resize');
    var mapListeners = map;/// <-----------------------------TODO: Redundant?

    google.maps.event.addListener(mapListeners, 'mousemove', function (e) { mapFunctions.DrawBoundingBox(this, e) });
    google.maps.event.addListener(mapListeners, 'mousedown', function (e) { mapFunctions.StopMapDrag(this, e); console.log("GOOG mouseIsDown: " + mapFunctions.mouseIsDown); });
    google.maps.event.addListener(mapListeners, 'mouseup', function (e) { droneSelection.AreaSelect(this, e, mapFunctions.mouseIsDown, mapFunctions.shiftPressed, mapFunctions.gridBoundingBox, selectedDrones, uavs) });
});