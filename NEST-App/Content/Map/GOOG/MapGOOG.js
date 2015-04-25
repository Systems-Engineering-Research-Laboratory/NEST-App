var map;
var homeBase = new google.maps.LatLng(34.2420, -118.5288);
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
var radius = 6371000;
var base_lat_radian = 34.2420 * Math.PI / 180;
var base_long_radian = -118.5288 * Math.PI / 180;
var percent_global_for_progress_bar;
var missiontable = document.getElementById("progress_table_for_info");
var progress_table = document.getElementById("progress_table");


// remove trail functions entirely -david
////Drone Trails
//var selectedTrail; //the trail that the selected uav has

//TODO: Do we need this? Are we changing this to "var theMap = map;" ?
var mapListeners = map; //use this to add listeners to the map
var wpm;


function uavMarkers(data, textStatus, jqXHR) {
    console.log("Pulling Flightstates...", textStatus);
    
    for (var i = 0; i < data.length; i++) {
        //Set UAV properties
        uavs[data[i].Id] = mapFunctions.SetUAV(data[i]);

        ////Creates the flightpath line from uav position to destination
        //flightLines[data[i].Id] = new google.maps.Polyline(mapStyles.flightPathOptions);
        //flightLines[data[i].Id].setPath([uavs[data[i].Id].Position, uavs[data[i].Id].Destination]);

        //Create the map's visual aspects of the uav
        var markerCircle = new google.maps.Marker({
            position: uavs[data[i].Id].Position,
            icon: mapStyles.uavCircleBlack,
            clickable: false
        });
        var marker = mapFunctions.SetUAVMarker(uavs[data[i].Id]);


        //Apply the UAV's visual aspects and make them appear on the map
        marker.set('selected', false);
        wpm.addMarker(marker);
        uavs[data[i].Id].marker = marker;
        uavs[data[i].Id].markerCircle = markerCircle;
        //uavs[data[i].Id].flightPath = flightLines[data[i].Id];
        uavs[data[i].Id].markerCircle.setMap(map);
        uavs[data[i].Id].marker.setMap(map);

        ///////UAV Marker listeners/////////
        //When fired, the UAV is marked as 'selected'
        google.maps.event.addListener(marker, 'click', function () {
            droneSelection.CtrlSelect(this, selectedDrones);
        });
        //Events to ccur when a UAV's marker icon has changed (ie the marker's been clicked)
        google.maps.event.addListener(marker, 'selection_changed', function () {
            //droneSelection.SelectionStateChanged(this, selectedDrones, flightLines, droneTrails.uavTrails, selectedTrail);
            //take out some unused variables -david
            droneSelection.SelectionStateChanged(this, selectedDrones);
        });
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

        // add event listener
        document.getElementById("goBtn").addEventListener("click", function () {
            if (isNaN(document.getElementById("go_lat").value) || isNaN(document.getElementById("go_long").value) || document.getElementById("go_lat").value == "" || document.getElementById("go_long").value == "") {
                console.log("Need lat lng!");
            }
            else {
                var ids = [];
                for (var i = 0; i < selectedDrones.length; i++) {
                    ids[i] = selectedDrones[i].Id;
                }
                droneTrails.goWaypoint(document.getElementById("go_lat").value, document.getElementById("go_long").value, ids);
            }    
        });


        document.getElementById("clickToGoBtn").addEventListener("click", function () {
            var ids = [];
            for (var i = 0; i < selectedDrones.length; i++) {
                ids[i] = selectedDrones[i].Id;
            }
            droneTrails.clickToGo(ids);
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
       
            if (vehicle.Id == camLockedUAV) {
                mapFunctions.CenterOnUAV(vehicle.Id);
            }

            
            //var phase = vehicle.returnphase();
            //console.log(phase);

            //console.log(document.getElementById("uav_mission_id"+vehicle.id));


            
            // MISSION PROGRESS WINDOW
            for (i = 0, j = 1, k = 0; i < missiontable.rows.length, k < progress_table.rows.length; i++, j += 2, k += 2) {
                var missionid_table = progress_table.children[0].children[k].children[1].children[4].innerHTML;
                
                //console.log(k + ", " + missionid_table);
                //check if uav is enrouting or not. (moving or not) in phase from database.
                // need to find a way to get the phase info from database inside of flightpathupdates.
                if ((vehicle.Id == uavid_progress_table)) {
                    var uavid_progress_table = missiontable.rows[i].cells[7].innerHTML;
                    var missionid_progress_table = missiontable.rows[i].cells[0].innerHTML;
                    var lat_progress_table = missiontable.rows[i].cells[2].innerHTML;
                    var long_progress_table = missiontable.rows[i].cells[3].innerHTML;
                    var total_distance = missiontable.rows[i].cells[4].innerHTML;

                    var dest_lat_radian = lat_progress_table * Math.PI / 180;
                    var dest_long_radian = long_progress_table * Math.PI / 180;
                    var current_lat_radian = vehicle.Latitude * Math.PI / 180;
                    var current_long_radian = vehicle.Longitude * Math.PI / 180;

                    var diff_base_dest_lat = base_lat_radian - dest_lat_radian;
                    var diff_base_dest_long = base_long_radian - dest_long_radian;
                    var diff_curr_dest_lat = dest_lat_radian - current_lat_radian;
                    var diff_curr_dest_long = dest_long_radian - current_long_radian;

                    var total_a1 = Math.sin(diff_base_dest_lat / 2) * Math.sin(diff_base_dest_lat / 2);
                    var total_a2 = Math.cos(base_lat_radian);
                    var total_a3 = Math.cos(dest_lat_radian);
                    var total_a4 = Math.sin(diff_base_dest_long / 2) * Math.sin(diff_base_dest_long / 2);
                    var total_a = total_a1 + (total_a2 * total_a3 * total_a4);
                    var total_c = 2 * Math.atan2(Math.sqrt(total_a), Math.sqrt(1 - total_a));
                    var total_distance = radius * total_c;
                    var total_distance_in_km = total_distance / 1000;
                    //document.getElementById("distance").innerHTML = total_distance;

                    var remaining_a1 = Math.sin(diff_curr_dest_lat / 2) * Math.sin(diff_curr_dest_lat / 2);
                    var remaining_a2 = Math.cos(dest_lat_radian);
                    var remaining_a3 = Math.cos(current_lat_radian);
                    var remaining_a4 = Math.sin(diff_curr_dest_long / 2) * Math.sin(diff_curr_dest_long / 2);
                    var remaining_a = remaining_a1 + (remaining_a2 * remaining_a3 * remaining_a4);
                    var remaining_c = 2 * Math.atan2(Math.sqrt(remaining_a), Math.sqrt(1 - remaining_a));
                    var remaining_distance = radius * remaining_c;
                    var remaining_distance_in_km = remaining_distance / 1000;

                        var percent = 100 - ((remaining_distance_in_km / total_distance_in_km) * 100);
                        percent_global_for_progress_bar = percent;
                        missiontable.rows[i].cells[4].innerHTML = total_distance;
                        progress_table.rows[j].cells[1].innerHTML = "<b>Distance to destination: </b>" + remaining_distance_in_km.toFixed(3) + " km";
                        progress_table.rows[j].cells[0].innerHTML = " " + percent.toFixed(0) + " % on delivery";
                        progress_table.rows[j].cells[0].style.color = "red";

                        var progress_row = progress_table.children[0].children[k].children[0].children[0];
                        progress_row.setAttribute("value", percent);

                        if ((percent.toFixed(0) == '100') && (vehicle.Altitude == '400')) {
                            var phase_backtobase = progress_table.children[0].children[k].children[1].children[4];
                            phase_backtobase.innerHTML = "back to base";

                            var diff_curr_base_lat = base_lat_radian - current_lat_radian;
                            var diff_curr_base_long = base_long_radian - current_long_radian;

                            var backtobase_a1 = Math.sin(diff_curr_base_lat / 2) * Math.sin(diff_curr_base_lat / 2);
                            var backtobase_a2 = Math.cos(base_lat_radian);
                            var backtobase_a3 = Math.cos(current_lat_radian);
                            var backtobase_a4 = Math.sin(diff_curr_base_long / 2) * Math.sin(diff_curr_base_long / 2);
                            var backtobase_a = backtobase_a1 + (backtobase_a2 * backtobase_a3 * backtobase_a4);
                            var backtobase_c = 2 * Math.atan2(Math.sqrt(backtobase_a), Math.sqrt(1 - backtobase_a));
                            var backtobase_distance = radius * backtobase_c;
                            var backtobase_distance_in_km = backtobase_distance / 1000;

                            percent = 100 - (backtobase_distance_in_km / total_distance_in_km) * 100;
                            progress_table.rows[j].cells[0].innerHTML = percent.toFixed(0) + " % on returning";
                            progress_table.rows[j].cells[0].style.color = "green";
                            progress_row.setAttribute("value", percent);
                        }

                        if (progress_table.children[0].children[k].children[1].children[3].innerHTML === "back to base") {
                            var diff_curr_base_lat = base_lat_radian - current_lat_radian;
                            var diff_curr_base_long = base_long_radian - current_long_radian;

                            var backtobase_a1 = Math.sin(diff_curr_base_lat / 2) * Math.sin(diff_curr_base_lat / 2);
                            var backtobase_a2 = Math.cos(base_lat_radian);
                            var backtobase_a3 = Math.cos(current_lat_radian);
                            var backtobase_a4 = Math.sin(diff_curr_base_long / 2) * Math.sin(diff_curr_base_long / 2);
                            var backtobase_a = backtobase_a1 + (backtobase_a2 * backtobase_a3 * backtobase_a4);
                            var backtobase_c = 2 * Math.atan2(Math.sqrt(backtobase_a), Math.sqrt(1 - backtobase_a));
                            var backtobase_distance = radius * backtobase_c;
                            var backtobase_distance_in_km = backtobase_distance / 1000;

                            percent = 100 - (backtobase_distance_in_km / total_distance_in_km) * 100;

                            progress_table.rows[k + 1].cells[0].innerHTML = percent.toFixed(0) + " % on returning";
                            progress_table.rows[k + 1].cells[0].style.color = "green";
                            progress_row.setAttribute("value", percent);
                            progress_table.rows[k + 1].cells[1].innerHTML = "<b>Distance to base: </b>" + backtobase_distance_in_km.toFixed(3) + " km";

                            // change if distance between uav and base is less than 0.005km, then done with mission
                            // add distance between uav and base is larger than 0.005 km, then chagne the phase state as "on delivery"
                            // change the percent of progress as 0 % after uav hit the base.
                            if (backtobase_distance_in_km.toFixed(3) < 0.007) {
                                progress_table.rows[j].cells[0].innerHTML = "Done with Mission";
                                progress_table.rows[k + 1].cells[1].innerHTML = "<b>Distance to base: </b> 0.000 km";
                                progress_table.rows[j].cells[0].style.color = "green";
                                
                                //console.log("uav lat: " + vehicle.Latitude + ", long: " + vehicle.Longitude);
                                //console.log("base: 34.2420, -118.5288");
                                for (var q = 0; q < missiontable.rows.length; q++) {
                                    var uavid_missiontable = missiontable.rows[q].cells[0].innerHTML;
                                    var boolean_missiontable = missiontable.rows[q].cells[6].innerHTML;
                                    if ((vehicle.Id == uavid_missiontable) && (boolean_missiontable === 'false')) {
                                        //console.log("row #" + q + ", " + vehicle.Id + ", " + uavid_missiontable + ": " + boolean_missiontable);
                                    }

                                }

                                if (backtobase_distance > 0) {
                                    percent = 100 - ((remaining_distance_in_km / total_distance_in_km) * 100);
                                    percent_global_for_progress_bar = percent;
                                    missiontable.rows[i].cells[4].innerHTML = total_distance;
                                    progress_table.rows[j].cells[1].innerHTML = "<b>Distance to destination: </b>" + remaining_distance_in_km.toFixed(3) + " km";
                                    progress_table.rows[j].cells[0].innerHTML = " " + percent.toFixed(0) + " % on delivery";
                                    var phase_backtobase = progress_table.children[0].children[k].children[1].children[4];
                                    phase_backtobase.innerHTML = "enroute";
                                    progress_table.rows[j].cells[0].style.color = "red";
                                    progress_row.setAttribute("value", percent);
                                }
                            }

                        //}
                    }
                    // end of whole if statement
                }
            }
            // end of whole for loop


        }

        vehicleHub.client.vehicleHasNewMission = function (uavid, schedid, missionid) {
            wpm.vehicleHasNewMission(uavid, schedid, missionid);
            //console.log(uavid + ", " + missionid);
            for (var i = 0; i < progress_table.rows.length; i += 2)
            {
                var uavid_table = progress_table.children[0].children[i].children[1].children[1].innerHTML;
                if (uavid == uavid_table)
                {
                    progress_table.children[0].children[i].children[1].children[4].innerHTML = missionid;
                }
            }
            if(!checkIfMissionInTable(missionid))
            {
                //store it
            }
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
        //close notification when back at base
        vehicleHub.client.reportBackAtBase = function (UAVId) {
            console.log("uav id for back at base: " + UAVId);
            var infobox = uavs[UAVId].infobox;
            uavs[UAVId].infobox = null;
            infobox.close();
            var infoboxAlert = uavs[UAVId].infoboxAlert;
            uavs[UAVId].infoboxAlert = null;
            infoboxAlert.close();
        }


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
                    });

                    if (uavs[evt.UAVId].infobox != null) {
                        var ibox = new InfoBox();
                        ibox = uavs[evt.UAVId].infobox;
                        ibox.close();
                    }
                    uavs[evt.UAVId].infobox = infobox;
                    infobox.open(map, uavs[evt.UAVId].marker);
                    
                    google.maps.event.addDomListener(multipleText, 'click', function () {
                        if (infobox.open) {
                            uavs[evt.UAVId].infobox = null;
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
                            uavs[evt.UAVId].infobox = null;
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
                    //warning popup showing
                    warningUavId = uavs[evt.UAVId].Id;
                    document.getElementById('criticality').innerHTML = evt.criticality;
                    document.getElementById('warningUavId').innerHTML = "UAV ID: " + uavs[evt.UAVId].Id + "<br />";
                    document.getElementById('warningUavCallsign').innerHTML = "Callsign: " + uavs[evt.UAVId].Callsign + "<br />";
                    document.getElementById('warningReason').innerHTML = "Reason: " + evt.message;
                    mapFunctions.goTo_RR_show();

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
                        uavs[evt.UAVId].infoboxAlert = infoboxAlert;
                        var i = uavs[evt.UAVId].alertOnce;
                        i++;
                        uavs[evt.UAVId].alertOnce = i;
                    }
                }

                

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
                                var accept_butt = '<input type="button" value="ACCEPT" name="ACCEPT" onclick=mapFunctions.RR_button_accept_window() style="background-color: #46d914; color: white; cursor: pointer;padding-right: 5px; padding-left: 5px; padding-top: 2px; padding-bottom: 2px; border-radius: 5px; border: none; width: 100%; border-top:2px solid transparent; margin-top: 2px;">';
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
                //console.log("Shift key down");
            }
            if (evt.ctrlKey) {
                ctrlDown = true;
                //console.log("ctrl down");
            }
            if (evt.which === 69) {
                console.log("User is: "+ assignment.getUsername());
            }
                //console.log("Shift key down");
            storedGroups = droneSelection.KeyBinding(selectedDrones, storedGroups, evt);
            // console.log("length in goog is: " + selectedDrones.length);
        }).keyup(function (evt) {
            if (evt.which === 16) {
                mapFunctions.shiftPressed = false;
                //console.log("Shift key up");
            }
            else if (evt.which === 17) {
                ctrlDown = false;
                //console.log("ctrl up");
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
            //console.log("db click");
            mapUavId = null;
            for (var key in uavs) {
                uavs[key].marker.setIcon(uavs[key].marker.uavSymbolBlack);
                uavs[key].marker.selected = false;
                google.maps.event.trigger(uavs[key].marker, 'selection_changed');
                //console.log("selection was changed");
            }
            while (selectedDrones.length > 0) {
                selectedDrones.pop();
            }
        })
    };
    google.maps.event.addDomListener(window, 'load', init);
});

function checkIfMissionInTable(missionid)
{
    var runningBool = false;
    for (var i = 0; i < missiontable.rows.length; i++) {
        var runningBool = missionid == missiontable.rows[i].cells[0].innerHTML;
        if (runningBool) {
            break;
        }
    }
    return runningBool;
}

function calculateDistance(dest_lat, dest_long) {

    var dest_lat_radian = dest_lat * Math.PI / 180;
    var dest_long_radian = dest_long * Math.PI / 180;
    var diff_base_dest_lat = base_lat_radian - dest_lat_radian;
    var diff_base_dest_long = base_long_radian - dest_long_radian;

    var total_a1 = Math.sin(diff_base_dest_lat / 2) * Math.sin(diff_base_dest_lat / 2);
    var total_a2 = Math.cos(base_lat_radian);
    var total_a3 = Math.cos(dest_lat_radian);
    var total_a4 = Math.sin(diff_base_dest_long / 2) * Math.sin(diff_base_dest_long / 2);
    var total_a = total_a1 + (total_a2 * total_a3 * total_a4);
    var total_c = 2 * Math.atan2(Math.sqrt(total_a), Math.sqrt(1 - total_a));
    var total_distance = radius * total_c;
    
    return total_distance;
}


function addMissionToTheTable(mission)
{
    mission.id 
    var row = missiontable.insertRow(0);
    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    var cell2 = row.insertCell(2);
    var cell3 = row.insertCell(3);
    var cell4 = row.insertCell(4);
    var cell5 = row.insertCell(5);
    var cell6 = row.insertCell(6);
    var cell7 = row.insertCell(7);

    cell0.innerHTML = mission.id;
    cell1.innerHTML = "";                  // callsign
    cell2.innerHTML = mission.Latitude;                  // lat
    cell3.innerHTML = mission.Longitude;                  // long

    var distance = calculateDistance(cell2, cell3);

    cell4.innerHTML = distance;
    cell5.innerHTML = "";       //phase
    cell6.innerHTML = "";       //bool
    cell7.innerHTML = mission.schedid;  //uavid
}

function findMissionRowById(missionid)
{
    for (var i = 0; i < missiontable.rows.length; i++) {
        if (missionid == missiontable.rows[i].cell[0].innerHTML) 
        {
            return missiontable.rows[i];
        }
    }
}

function getCurrentMission(uavid)
{

}