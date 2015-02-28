var map;
var homeBase = new google.maps.LatLng(34.2417, -118.529);
var uavs = {};
var vehicleHub;

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
        document.getElementById("goBtn").addEventListener("click", droneTrails.goWaypoint(document.getElementById("go_lat"), document.getElementById("go_long")));
    }

    $.ajax({
        url: '/api/uavs/getuavinfo',
        success: function (data, textStatus, jqXHR) {
            uavMarkers(data, textStatus, jqXHR);
        }
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
    });
    
    emitHub.client.newEvent = function (evt) {
        
        var checkMessage = evt.message.split(" ");
        if (checkMessage[0] != "Acknowledged:") {

            var boxText = document.createElement("div");
            boxText.style.cssText = "border: 1px solid black;margin-top: 8px;background: #333;color: #FFF;font-size: 10px;padding: .5em 2em;-webkit-border-radius: 2px;-moz-border-radius: 2px;border-radius: 1px;";
            boxText.innerHTML = "<span style='color: red;'>Warning: </span>" + evt.message;

            var alertText = document.createElement("div");
            alertText.style.cssText = "border: 1px solid red;height: 40px;background: #333;color: #FFF;padding: 0px 0px 15px 4px;-webkit-border-radius: 2px;-moz-border-radius: 2px;border-radius: 1px;"
            alertText.innerHTML = "<span style='color: red; font-size: 30px;'>!</span";

            var infobox = new InfoBox({
                content: boxText,
                disableAutoPan: false,
                maxWidth: 100,
                pixelOffset: new google.maps.Size(-75, 30),
                zIndex: null,
                enableEventPropagation: true,
                pane: "floatPane",
                boxStyle: {
                    opacity: 0.75,
                    width: "150px"
                },
                closeBoxMargin: "9px 1px 2px 2px"
            })
           
            var infoboxAlert = new InfoBox({
                content: alertText,
                disableAutoPan: false,
                maxWidth: 20,
                pixelOffset: new google.maps.Size(-10, -80),
                zIndex: null,
                boxStyle: {
                    opacity: 0.75,
                    width: "20px",
                },
            })

            infobox.open(map, uavs[evt.UAVId].marker);
            infoboxAlert.open(map, uavs[evt.UAVId].marker);

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
    vehicleHub = $.connection.vehicleHub;
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
        storedGroups = droneSelection.KeyBinding(selectedDrones, storedGroups, evt);
       // console.log("length in goog is: " + selectedDrones.length);
    }).keyup(function (evt) {
        if (evt.which === 16) {
            mapFunctions.shiftPressed = false;
            //console.log("Shift key up");
        }
    });

    google.maps.event.trigger(map, 'resize');
    var mapListeners = map;/// <-----------------------------TODO: Redundant?

    //MAP CONTEXT MENU - Right-click to activate
    var mapContext = mapFunctions.MapContext(map);
    google.maps.event.addListener(map, 'rightclick', function (event) {
        mapContext.show(event.latLng);
    });
    google.maps.event.addListener(mapContext, 'menu_item_selected', function (latLng, eventName) {
        mapFunctions.MapContextSelection(map, latLng, eventName, emitHub);
    });



    google.maps.event.addListener(mapListeners, 'mousemove', function (e) { mapFunctions.DrawBoundingBox(this, e) });
    google.maps.event.addListener(mapListeners, 'mousedown', function (e) { mapFunctions.StopMapDrag(this, e); });
    google.maps.event.addListener(mapListeners, 'mouseup', function (e) { droneSelection.AreaSelect(this, e, mapFunctions.mouseIsDown, mapFunctions.shiftPressed, mapFunctions.gridBoundingBox, selectedDrones, uavs) });
    google.maps.event.addListener(mapListeners, 'dblclick', function (e) {
        console.log("double clicked");
        for (var key in uavs) {
            uavs[key].marker.setIcon(uavs[key].marker.uavSymbolBlack);
        }


    })
});


