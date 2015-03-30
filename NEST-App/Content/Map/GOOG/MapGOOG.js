var map;
var homeBase = new google.maps.LatLng(34.2417, -118.529);
var uavs = {};
var vehicleHub;
var warningUavId;
var mapUavId;
var event_count = 0;

//DroneSelection
var selectedDrones = []; //store drones selected from any method here
var storedGroups = []; //keep track of different stored groupings of UAVs
var ctrlDown = false;
var flightLines = [];
var selectedUAV; //the uav that's been selected
var camLockedUAV = null;

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
        google.maps.event.addListener(marker, 'click', (function () {droneSelection.CtrlSelect(this, selectedDrones)}));
        //Events to ccur when a UAV's marker icon has changed (ie the marker's been clicked)
        google.maps.event.addListener(marker, 'selection_changed', function () { droneSelection.SelectionStateChanged(this, selectedDrones, flightLines, droneTrails.uavTrails, selectedTrail) });
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
    function init() {
        //Used for communication and map.setCenter()
        mapUavId = null;
        localStorage.clear();
        //Communication via local storage changes
        if (window.addEventListener) {
            window.addEventListener("storage", handler, false);
        }
        function handler(e) {
            console.log('Successfully communicated with the other tab');
            console.log('Received data: ' + JSON.parse(localStorage.getItem('uavid')));
            mapUavId = JSON.parse(localStorage.getItem('uavid'));
        }

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

        //var homeControlDiv = document.createElement('div');
        //var homeControl = new mapStyles.BaseControl(homeControlDiv, map, homeBase);
        var marker = new google.maps.Marker({
            position: homeBase,
            icon: mapStyles.goldStarBase,
            map: map
        });
        //homeControlDiv.index = 1;
        //map.controls[google.maps.ControlPosition.TOP_RIGHT].push(homeControlDiv);
        
        //var uavFilterDiv = document.createElement('div');
        //var uavFilter = new mapStyles.uavFilter(uavFilterDiv, map);
        //uavFilterDiv.index = 1;
        //map.controls[google.maps.ControlPosition.RIGHT_TOP].push(uavFilterDiv);



        // add event listener
        document.getElementById("goBtn").addEventListener("click", function () {
            if (isNaN(document.getElementById("go_lat").value) || isNaN(document.getElementById("go_long").value) || document.getElementById("go_lat").value == "" || document.getElementById("go_long").value == "") {
                console.log("Need lat lng!");
            }
            else {
                droneTrails.goWaypoint(document.getElementById("go_lat").value, document.getElementById("go_long").value);
            }
            
        });

        $.ajax({
            url: '/api/uavs/getuavinfo',
            success: function (data, textStatus, jqXHR) {
                uavMarkers(data, textStatus, jqXHR);
            }
        });
        
        //SignalR callbacks must be set before the call to connect!
        /* Vehicle Movement */
        vehicleHub = $.connection.vehicleHub;

        //insert waypoint
        vehicleHub.client.WaypointInserted = function (id) {
            console.log("Waypoint Successfully Inserted\nMission Id: " + id);
            if (selectedUAV != null) {
                wpm.updateFlightPath(id);
            }
        }
        vehicleHub.client.newRouteForMission = function (id) {
            if (selectedUAV != null) {
                wpm.updateFlightPath(id);
            }
        }
        
        //setup client callback function
        vehicleHub.client.UavRejected = function (uavId) {
            assignment.uavRejected(uavId);
        }

        vehicleHub.client.flightStateUpdate = function (vehicle) {
            uavs[vehicle.Id] = mapFunctions.UpdateVehicle(uavs[vehicle.Id], vehicle);
            if (mapUavId != null && mapUavId === vehicle.Id) {
                var latlng = new google.maps.LatLng(vehicle.Latitude, vehicle.Longitude);
                map.setCenter(latlng);
            }
            // draw trail
            if (selectedUAV && selectedTrail != undefined) {
                if (selectedTrail.length < 2)
                    selectedTrail[selectedTrail.length - 1].setMap(map);
                else
                    selectedTrail[selectedTrail.length - 2].setMap(map);
            }

            if (uavs[vehicle.Id].BatteryCheck < .2) {
                if (uavs[vehicle.Id].BatteryWarning == 0) {
                    uavs[vehicle.Id].BatteryWarning++;

                    var eventLog = {
                        uav_id: uavs[vehicle.Id].Id,
                        message: "Low Battery",
                        criticality: "critical",
                        uav_callsign: uavs[vehicle.Id].Callsign,
                        operator_screen_name: assignment.getUsername(),
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
                warningUavId = uavs[vehicle.Id].Id;
            }
            if (vehicle.Id == camLockedUAV) {
                mapFunctions.CenterOnUAV(vehicle.Id);
            }
        }

        vehicleHub.client.vehicleHasNewMission = function (uavid, schedid, missionid) {
            wpm.vehicleHasNewMission(uavid, schedid, missionid);
        }

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

        emitHub.client.newEvent = function (evt) {
            console.log(evt);
            //deprecate -- ack check by operator -dg
            //var checkMessage = evt.message.split(" ");
            //if (checkMessage[0] != "Acknowledged:") {
            if (evt.criticality != "ACK") {
                mapFunctions.glowing();
                var i = uavs[evt.UAVId].Events;
                i++;
                uavs[evt.UAVId].Events = i;

                //default is critical
                var boxText = document.createElement("div");
                boxText.style.cssText = "border: 3px solid red; margin-top: 8px;background: #333;color: #FFF;font-size: 10px;padding: .5em 2em;-webkit-border-radius: 2px;-moz-border-radius: 2px;border-radius: 1px;";
                boxText.innerHTML = "<span style='color: red;'>Critical: </span>" + evt.message;

                var alertText = document.createElement("div");
                alertText.style.cssText = "border: 1px solid red;height: 40px;background: #333;color: #FFF;padding: 0px 0px 15px 4px;-webkit-border-radius: 2px;-moz-border-radius: 2px;border-radius: 1px;"
                alertText.innerHTML = "<span style='color: red; font-size: 30px;'>!</span>";

                var multipleText = document.createElement("div");
                multipleText.style.cssText = "border: 3px solid red;margin-top: 8px;background: #333;color: #FFF;font-size: 10px;padding: .5em 2em;-webkit-border-radius: 2px;-moz-border-radius: 2px;border-radius: 1px;";
                multipleText.innerHTML = "<span style='color: red;'>Critical: </span>" + "multiple errors, check logs!";

                if (uavs[evt.UAVId].Events > 1) {

                    if (evt.criticality === "warning")
                        multipleText.innerHTML = "<span style='color: yellow;'>Warning: </span>" + "multiple warnings, check logs";
                    else if (evt.criticality === "normal")
                        multipleText.innerHTML = "<span style='color: white;'>Event: </span>" + "multiple events, check logs";
   
                    var infobox = new InfoBox({
                        content: multipleText,
                        disableAutoPan: true,
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

                    if (uavs[evt.UAVId].infobox != null) {
                        var ibox = new InfoBox();
                        ibox = uavs[evt.UAVId].infobox;
                        ibox.close();
                    }
                    uavs[evt.UAVId].infobox = infobox;
                    infobox.open(map, uavs[evt.UAVId].marker);
                    
                    google.maps.event.addDomListener(multipleText, 'click', function () {
                        if (infobox.open) {
                            infobox.close();

                            var eventACK = {
                                uav_id: uavs[evt.UAVId].Id,
                                message: "Acknowledged: " + evt.message,
                                criticality: "normal",
                                uav_callsign: uavs[evt.UAVId].Callsign,
                                operator_screen_name: evt.operator_screen_name,
                                UAVId: uavs[evt.UAVId].Id
                            };
                            var i = uavs[evt.UAVId].Events;
                            i--;
                            uavs[evt.UAVId].Events = i;
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
                else {
                    if (evt.criticality === "warning") {
                        boxText.innerHTML = "<span style='color: yellow;'>Warning: </span>" + evt.message;
                        boxText.style.cssText = "border: 3px solid yellow; margin-top: 8px;background: #333;color: #FFF;font-size: 10px;padding: .5em 2em;-webkit-border-radius: 2px;-moz-border-radius: 2px;border-radius: 1px;";
                    }
                    else if (evt.criticality === "normal") {
                        boxText.innerHTML = "<span style='color: white;'>Event: </span>" + evt.message;
                        boxText.style.cssText = "border: 3px solid black; margin-top: 8px;background: #333;color: #FFF;font-size: 10px;padding: .5em 2em;-webkit-border-radius: 2px;-moz-border-radius: 2px;border-radius: 1px;";
                    }
                    var infobox = new InfoBox({
                        content: boxText,
                        disableAutoPan: true,
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

                    uavs[evt.UAVId].infobox = infobox;
                    infobox.open(map, uavs[evt.UAVId].marker);

                    google.maps.event.addDomListener(boxText, 'click', function () {
                        if (infobox.open) {
                            infobox.close();

                            var eventACK = {
                                uav_id: uavs[evt.UAVId].Id,
                                message: "Acknowledged: " + evt.message,
                                criticality: "ACK",
                                uav_callsign: uavs[evt.UAVId].Callsign,
                                operator_screen_name: evt.operator_screen_name,
                                UAVId: uavs[evt.UAVId].Id
                            };
                            var i = uavs[evt.UAVId].Events;
                            i--;
                            uavs[evt.UAVId].Events = i;
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
                if (evt.criticality != "normal") {
                    if (evt.criticality === "warning") {
                        alertText.style.cssText = "border: 1px solid yellow;height: 40px;background: #333;color: #FFF;padding: 0px 0px 15px 4px;-webkit-border-radius: 2px;-moz-border-radius: 2px;border-radius: 1px;"
                        alertText.innerHTML = "<span style='color: yellow; font-size: 30px;'>!</span>";
                    }
                    if (uavs[evt.UAVId].alertOnce != 1) {
                        var infoboxAlert = new InfoBox({
                            content: alertText,
                            disableAutoPan: true,
                            maxWidth: 20,
                            pixelOffset: new google.maps.Size(-10, -80),
                            zIndex: null,
                            boxStyle: {
                                opacity: 0.75,
                                width: "20px",
                            },
                        })

                        infoboxAlert.open(map, uavs[evt.UAVId].marker);
                        var i = uavs[evt.UAVId].alertOnce;
                        i++;
                        uavs[evt.UAVId].alertOnce = i;
                    }
                }

                //warning popup showing
                mapFunctions.goTo_RR_show();
                document.getElementById('warningUavId').innerHTML = "UAV ID: " + uavs[evt.UAVId].Id + "<br />";
                document.getElementById('warningUavCallsign').innerHTML = "Callsign: " + uavs[evt.UAVId].Callsign + "<br />";
                document.getElementById('warningReason').innerHTML = "Reason: " + evt.message;

                var table = document.getElementById('eventlog_table');
                var table_length = table.rows.length;
                var event_time = evt.create_date;
                var event_uav_user = document.getElementById('event_uav_user');
                
                // Right upper Event log UI
                if (event_count == 0)
                {
                    event_count++;

                    //@-webkit-keyframes glowing {0% { background-color: #004a7f; -webkit-box-shadow: 0 0 3px #004a7f; }50% { background-color: #0094ff; -webkit-box-shadow: 0 0 10px #0094ff; }100% { background-color: #004a7f; -webkit-box-shadow: 0 0 3px #004a7f; }}
                    
                    document.getElementById('event_info_uavid').innerHTML = uavs[evt.UAVId].Id;
                    document.getElementById('event_info_callsign').innerHTML = uavs[evt.UAVId].Callsign;
                    document.getElementById('event_info_msg').innerHTML = evt.message;
                    document.getElementById('event_time').innerHTML = evt.create_date;

                    if (evt.criticality === "critical")
                    {
                        document.getElementById('criticality_color').style.backgroundColor = "red";
                    }

                    else if (evt.criticality === "warning")
                    {
                        document.getElementById('criticality_color').style.backgroundColor = "yellow";
                    }

                    else if (evt.criticality === "advisory")
                    {
                        document.getElementById('criticality_color').style.backgroundColor = "orange";
                    }
                    
                    for (var i = 1; i < event_uav_user.rows.length; i++) {
                        var uav_user_id = event_uav_user.rows[i].cells[0].innerHTML;
                        var uav_user_name = event_uav_user.rows[i].cells[1].innerHTML;
                        if (uavs[evt.UAVId].Id == uav_user_id) {
                            if (uav_user_name === "")
                            {
                                document.getElementById('event_button_accept').style.display = 'block';
                                document.getElementById('event_button_decline').style.display = 'block';
                            }
                            
                            else
                            {
                                document.getElementById('event_button_accept').style.display = 'none';
                                document.getElementById('event_button_decline').style.display = 'none';
                                document.getElementById('table_button').innerHTML = "Owned by" + "<br>" + event_uav_user.rows[i].cells[1].innerHTML;
                            }
                        }
                    }
                    document.getElementById('nav-counter').innerHTML = table_length;
                }

                else if (event_count != 0)
                {
                    event_count++;
                    var row = table.insertRow(0);
                    var cell0 = row.insertCell(0);
                    var cell1 = row.insertCell(1);
                    var cell2 = row.insertCell(2);
                    var cell3 = row.insertCell(3);
                    
                    cell0.style.cssText = "width: 5%; border-bottom: 1px solid black;";
                    cell1.style.cssText = "font-size: 12px; border-bottom: 1px solid black; padding-left: 5px; width: 75%; height: 60px; line-height:100%";
                    cell2.style.cssText = "font-size: 10px; border-bottom: 1px solid black; width: 15%; padding-left: 3px; padding-right: 3px; padding-top: 0px; margin: 0px;";
                    cell3.style.cssText = "font-size: 12px; border-bottom: 1px solid black; width: 5%";
                    cell1.innerHTML = "<b>UAV # </b>" + uavs[evt.UAVId].Id + " : " + uavs[evt.UAVId].Callsign + "<b><br>Reason: </b>" + evt.message + "<br>" + event_time.fontcolor("gray").fontsize(.7);


                    for (var i = 1; i < event_uav_user.rows.length; i++) {
                        var uav_user_id = event_uav_user.rows[i].cells[0].innerHTML;
                        var uav_user_name = event_uav_user.rows[i].cells[1].innerHTML;
                        if (uavs[evt.UAVId].Id == uav_user_id) {
                            if (uav_user_name === "") {
                                var accept_butt = '<input type="button" value="ACCEPT" name="ACCEPT" onclick=mapFunctions.RR_button_accept() style="background-color: #46d914; color: white; cursor: pointer;padding-right: 5px; padding-left: 5px; padding-top: 2px; padding-bottom: 2px; border-radius: 5px; border: none; width: 100%; border-top:2px solid transparent; margin-top: 2px;">';
                                var decline_butt = '<input type="button" value="DECLINE" name="DECLINE" onclick=mapFunctions.RR_button_decline(); style="background-color: #ee3f3f;color: white;cursor: pointer;padding-right: 5px;padding-left: 5px;padding-top: 2px;padding-bottom: 2px;border-radius: 5px;border: none;width: 100%;border-top:2px solid transparent;margin-top: 2px;margin-bottom: 1px;">';
                                cell2.innerHTML = accept_butt + decline_butt;
                            }

                            else {
                                cell2.innerHTML = "Owned by" + "<br>" + event_uav_user.rows[i].cells[1].innerHTML;
                                cell3.innerHTML = '<span class="glyphicon glyphicon-remove" onclick=mapFunctions.delete_event_row();>' + '</span>';
                            }
                        }
                    }
                    
                    if (evt.criticality === "critical") {
                        cell0.style.backgroundColor = "red";
                    }

                    else if (evt.criticality === "warning") {
                        cell0.style.backgroundColor = "yellow";
                    }

                    else if (evt.criticality === "advisory") {
                        cell0.style.backgroundColor = "orange";
                    }
                    document.getElementById('nav-counter').innerHTML = (table_length + 1);
                }
            }
        }

        
        //Make sure to set all SignalR callbacks BEFORE the call to connect
        $.connection.hub.start().done(function () {
            console.log("connection started for evt log");
            //Add this connectionID to the user's list of active connections so user-specific calls can be made
            vehicleHub.server.addConnection(assignment.getUserId());

        });

        vehicleHub.connection.start();

        $(window).keydown(function (evt) {
            if (evt.which === 16) {
                mapFunctions.shiftPressed = true;
            if (evt.ctrlKey) {
                ctrlDown = true;
            }
            if (evt.which === 69) {
                console.log("User is: "+ assignment.getUsername());
            }
                //console.log("Shift key down");
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


        google.maps.event.addListener(mapListeners, 'drag', function (e) { camLockedUAV = null; });
        google.maps.event.addListener(mapListeners, 'mousemove', function (e) { mapFunctions.DrawBoundingBox(this, e) });
        google.maps.event.addListener(mapListeners, 'mousedown', function (e) { mapFunctions.StopMapDrag(this, e); });
        google.maps.event.addListener(mapListeners, 'mouseup', function (e) { droneSelection.AreaSelect(this, e, mapFunctions.mouseIsDown, mapFunctions.shiftPressed, mapFunctions.gridBoundingBox, selectedDrones, uavs) });
        google.maps.event.addListener(mapListeners, 'dblclick', function (e) {
            mapUavId = null;
            for (var key in uavs) {
                uavs[key].marker.setIcon(uavs[key].marker.uavSymbolBlack);
                uavs[key].marker.selected = false;
                google.maps.event.trigger(uavs[key].marker, 'selection_changed');
            }
        })
    };
    google.maps.event.addDomListener(window, 'load', init);
});


