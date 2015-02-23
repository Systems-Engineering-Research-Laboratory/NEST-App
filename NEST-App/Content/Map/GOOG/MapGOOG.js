var map;
var homeBase = new google.maps.LatLng(34.2417, -118.529);
var uavs = {};

//DroneSelection
var selectedDrones = []; //store drones selected from any method here
var storedGroups = []; //keep track of different stored groupings of UAVs
var ctrlDown = false;
var flightLines = [];
var selectedUAV; //the uav that's been selected

//Drone Trails
var selectedTrail; //the trail that the selected uav has

//TODO: Do we need this? Are we changing this to "var theMap = map;" ?
var mapListeners = map; //use this to add listeners to the map
var wpm;

function uavMarkers(data, textStatus, jqXHR) {
    console.log("Pulling Flightstates...", textStatus);
    
    for (var i = 0; i < data.length; i++) {
        //Set UAV properties
        uavs[data[i].Id] = mapFunctions.SetUAV(data[i]);

        //Creates the flightpath line from uav position to destination
        flightLines[data[i].Id] = new google.maps.Polyline(mapStyles.flightPathOptions);
        flightLines[data[i].Id].setPath([uavs[data[i].Id].Position, uavs[data[i].Id].Destination]);

        //Create the map's visual aspects of the uav
        var markerCircle = new google.maps.Marker({
            position: uavs[data[i].Id].Position,
            icon: mapStyles.uavCircleBlack
        });
        var marker = mapFunctions.SetUAVMarker(uavs[data[i].Id]);


        //Apply the UAV's visual aspects and make them appear on the map
        marker.set('selected', false);
        wpm.addMarker(marker);
        uavs[data[i].Id].marker = marker;
        uavs[data[i].Id].markerCircle = markerCircle;
        uavs[data[i].Id].flightPath = flightLines[data[i].Id];
        uavs[data[i].Id].markerCircle.setMap(map);
        uavs[data[i].Id].marker.setMap(map);

        ///////UAV Marker listeners/////////
        //When fired, the UAV is marked as 'selected'
        google.maps.event.addListener(marker, 'click', (function () {droneSelection.CtrlSelect(this, selectedDrones, selectedUAV)}));
        //Events to ccur when a UAV's marker icon has changed (ie the marker's been clicked)
        google.maps.event.addListener(marker, 'selection_changed', function () { droneSelection.SelectionStateChanged(this, selectedDrones, selectedUAV, flightLines, droneTrails.uavTrails, selectedTrail) });
        //UAV Context Menu
        var UAVContext = mapFunctions.UAVContext(map);
        google.maps.event.addListener(marker, 'rightclick', function (event) {
            UAVContext.show(event.latLng);
        });
        //Context Menu Selection
        google.maps.event.addListener(UAVContext, 'menu_item_selected', function (latLng, eventName) {
            mapFunctions.UAVContextSelection(map, marker, latLng, eventName);
        });

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
    

    //Right click for infowindow coordinates on map
   // google.maps.event.addListener(map, "rightclick", function (event) { mapFunctions.GetLatLong(this, event) });

   
    //MAP CONTEXT MENU - Right-click to activate
    var mapContext = mapFunctions.MapContext(map);
    google.maps.event.addListener(map, 'rightclick', function (event) {
        mapContext.show(event.latLng);
    });
    google.maps.event.addListener(mapContext, 'menu_item_selected', function (latLng, eventName) {
        mapFunctions.MapContextSelection(map, latLng, eventName);
    });



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
        
        var checkMessage = evt.message.split(" ");
        if (checkMessage[0] != "Acknowledged:") {
            document.getElementById("infobox").innerHTML = "<p id='warn'>Warning:</p>" + evt.message;
            document.getElementById("infobox").onclick = mapStyles.infobox.close();
            document.getElementById("warn").style.color = "red";
            document.getElementById("warn").style.fontWeight = "bold";
            document.getElementById("warn").style.margin = 0;

            mapStyles.infobox.open(map, uavs[evt.UAVId].marker);
            mapStyles.infoboxAlert.open(map, uavs[evt.UAVId].marker);

            google.maps.event.addDomListener(document.getElementById("infobox"), 'click', function () {
                if (mapStyles.infobox.open) {
                    mapStyles.infobox.close();

                    var eventACK = {
                        uav_id: uavs[evt.UAVId].Id,
                        message: "Acknowledged: " + evt.message,
                        criticality: "normal",
                        uav_callsign: uavs[evt.UAVId].Callsign,
                        operator_screen_name: evt.operator_screen_name,
                        UAVId: uavs[evt.UAVId].Id
                    };

                    emitHub.server.emit(eventACK);
                    $.ajax({
                        type: "POST",
                        url: "/api/uavs/postuavevent",
                        success: function () { },
                        data: eventACK
                    });

                }
            });
        }
    }
    
    var warningMessageCounter = 0;
  
    /* Vehicle Movement */
    var vehicleHub = $.connection.vehicleHub;
    vehicleHub.client.flightStateUpdate = function (vehicle) {

        uavs[vehicle.Id] = mapFunctions.UpdateVehicle(uavs[vehicle.Id], vehicle);

        //console.log(vehicle);
        // draw trail
        if (selectedUAV && selectedTrail != undefined) {
            if (selectedTrail.length < 2)
                selectedTrail[selectedTrail.length - 1].setMap(map);
            else
                selectedTrail[selectedTrail.length - 2].setMap(map);
        }
        
        if (uavs[vehicle.Id].BatteryCheck < .2) {
            if (warningMessageCounter == 0) {
                warningMessageCounter++;
                
                var eventLog = {
                    uav_id: uavs[vehicle.Id].Id,
                    message: "Low Battery",
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
    google.maps.event.addListener(mapListeners, 'mousedown', function (e) { mapFunctions.StopMapDrag(this, e); });
    google.maps.event.addListener(mapListeners, 'mouseup', function (e) { droneSelection.AreaSelect(this, e, mapFunctions.mouseIsDown, mapFunctions.shiftPressed, mapFunctions.gridBoundingBox, selectedDrones, uavs) });
});


