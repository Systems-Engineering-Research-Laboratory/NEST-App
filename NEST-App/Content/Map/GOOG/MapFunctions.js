var mapFunctions = {   
    shiftPressed : false,
    mouseDownPos: null,
    gridBoundingBox : null,
    mouseIsDown : false,

    //Returns the latlong of the clicked point
    GetLatLong: function (theMap, event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        var point = new google.maps.LatLng(lat, lng);
        var infowindow = new google.maps.InfoWindow({
            content: '<div style="line-height: 1.35; overflow: hidden; white-space: nowrap;"><b>Lat: </b>' + lat + '<br/><b>Lng: </b>' + lng + '</div>',
            position: point,
            zIndex: 2
        });
        infowindow.open(theMap);
    },

    //Creates the context menu for the map
    MapContext : function(theMap){
        var contextMenuOptions = {};
        contextMenuOptions.classNames = { menu: 'context_menu', menuSeparator: 'context_menu_separator' };
        var menuItems = [];
        menuItems.push({ className: 'context_menu_item', eventName: 'send_note', label: 'Send Note' });
        menuItems.push({ className: 'context_menu_item', eventName: 'get_coords', label: 'Get Coords' });
        menuItems.push({});
        menuItems.push({ className: 'context_menu_item', eventName: 'go_here', label: 'Go Here' });
        menuItems.push({ className: 'context_menu_item', eventName: 'add_waypoint', label: 'Add Waypoint' });
        contextMenuOptions.menuItems = menuItems;
        var contextMenu = new ContextMenu(theMap, contextMenuOptions);

        return contextMenu;
    },
    //Controls context menu selection for the map
    MapContextSelection : function(map, latLng, eventName, emitHub){
        switch (eventName) {
            case 'get_coords':
                var coords = {
                    latLng: latLng
                }
                this.GetLatLong(map, coords);
                break;
            case 'send_note':
                mapFunctions.note_show();
                document.getElementById("send").addEventListener("click", function () {
                    emitHub.server.sendNote(latLng.lat(), latLng.lng(), document.getElementById("notifier").value, document.getElementById("message").value);
                    mapFunctions.note_hide();
                });
                break;
            case 'go_here':
                this.goTo_show();
                break;
            case 'add_waypoint':
                this.goTo_show();
                break;
            default:
                break;
        }
    },

    //Creates the context menu for UAVs
    UAVContext: function (theMap) {
        var contextMenuOptions = {};
        contextMenuOptions.classNames = { menu: 'context_menu', menuSeparator: 'context_menu_separator' };
        var menuItems = [];
        menuItems.push({ className: 'context_menu_item', eventName: 'get_details', label: 'UAV Details' });
        menuItems.push({ className: 'context_menu_item', eventName: 'non_nav', label: 'Adjust Parameters' });
        menuItems.push({ className: 'context_menu_item', eventName: 'hold', label: 'Hold Position' });
        menuItems.push({ className: 'context_menu_item', eventName: 'insert_waypoint', label: 'Insert Waypoint' });
        menuItems.push({ className: 'context_menu_item', eventName: 'go_to', label: 'Go to...' });
        menuItems.push({ className: 'context_menu_item', eventName: 'force_land', label: 'Force Land' });
        menuItems.push({ className: 'context_menu_item', eventName: 'return', label: 'Return to Base' });
        contextMenuOptions.menuItems = menuItems;
        var contextMenu = new ContextMenu(theMap, contextMenuOptions);

        return contextMenu;
    },
    //Controls context menu selection for UAVs
    UAVContextSelection: function (map, marker, latLng, eventName) {
        var uid = assignment.getUserId();
        var uav = marker.uav;
        //placeholders until UI is implemented
        var alt = 0;
        var throttle = 0;
        var time = 0;
        /////////////////
        switch (eventName) {
            case 'get_details':
                window.open("http://localhost:53130/detailview", "_blank");
                //console.log("Trying to open window");
                break;
            case 'non_nav':
                if (!assignment.isUavAssignedToUser(marker.uav.Id)) {
                    console.log("You're not the owner");
                } else {
                    //create ui
                    uavCommands.NonNav(uid, uav, latLng, alt, throttle);}
                break;
            case 'hold':
                if (!assignment.isUavAssignedToUser(marker.uav.Id)) {
                      console.log("You're not the owner");
                } else {
                    //create ui
                    uavCommands.HoldPos(uid, uav, latLng, alt, throttle);
                }
                break;
            case 'insert_waypoint':
                if (!assignment.isUavAssignedToUser(marker.uav.Id)) {
                    console.log("You're not the owner");
                } else {
                    //create ui
                uavCommands.InsertWP(uid, marker.uav, latLng);}
                break;
            case 'go_to':
                if (!assignment.isUavAssignedToUser(marker.uav.Id)) {
                    console.log("You're not the owner");
                } else {
                    //create ui
                    uavCommands.GoTo(uid, marker.uav, latLng, alt);}
                break;
            case 'force_land':
                if (!assignment.isUavAssignedToUser(marker.uav.Id)) {
                    console.log("You're not the owner");
                }else{
                    //create ui
                    uavCommands.ForceLand(uid, marker.uav, latLng, alt, throttle);
                }
                break;
            case 'return':
                if (!assignment.isUavAssignedToUser(marker.uav.Id)) {
                    console.log("You're not the owner");
                }else{
                    //create ui
                    uavCommands.BackToBase(uid, marker.uav, latLng);
                }
                break;
            default:
                break;
        }
    },



    ConsNotifier: function (theMap, lat, lng, notifier, message) {
        var location = new google.maps.LatLng(lat, lng);
        var noteMarker = new google.maps.Marker({
            map: theMap,
            position: location,
            icon: mapStyles.mapClickIcon,
            draggable: false,
            animation: google.maps.Animation.DROP
        });
        theMap.panTo(location);

        if (message != "") {
            var contentString = '<div id="content">' +
            '<h4>' + notifier + '</h4>' +
            '<p>' + message + '</p>' +
            '</div>';

            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            infowindow.open(map, noteMarker);
            document.getElementById("message").value = "";
        }

        if (droneTrails.dropMarkerListener != null) {
            google.maps.event.removeListener(droneTrails.dropMarkerListener);
            droneTrails.dropMarkerListener = null;
        }
    },

    DrawBoundingBox: function (theMap, e) {
        //console.log("move mouse down, shift down", this.mouseIsDown, this.shiftPressed);
        if (this.mouseIsDown && (this.shiftPressed || this.gridBoundingBox != null)) {
            if (this.gridBoundingBox != null) {
                //console.log("fire first if");
                //console.log("Bounding box: " + this.gridBoundingBox);
                var newbounds = new google.maps.LatLngBounds(this.mouseDownPos, null);
                newbounds.extend(e.latLng);
                this.gridBoundingBox.setBounds(newbounds);

            } else {
                //console.log("box created");
                this.gridBoundingBox = new google.maps.Rectangle({
                    map: theMap,
                    bounds: null,
                    fillOpacity: 0.15,
                    strokeWeight: 0.9,
                    clickable: false
                });
            }
        }
    },

    ResetBoundingBox : function (){
        this.gridBoundingBox = null;
    },

    ResetMouseDown : function (){
        this.mouseDownPos = null;
    },


    StopMapDrag: function (theMap, e) {
        //console.log("StopMapDrag fired");
        if (this.shiftPressed) {
            //console.log("MouseDown true");
            this.mouseIsDown = true;
            this.mouseDownPos = e.latLng;
            theMap.setOptions({
                draggable: false
            });
        }
    },

    //This function takes uav info form an ajax call and then uses it to populate/update the list of drones
    SetUAV : function (uavData){
        var uav = {};
        uav.Id = uavData.Id;
        uav.FlightState = uavData.FlightState;
        uav.Schedule = uavData.Schedule;
        uav.Missions = uavData.Schedule.Missions;
        var fs = uav.FlightState;
        uav.Alt = uavData.FlightState.Altitude;
        uav.Callsign = uavData.Callsign;
        uav.Battery = uavData.FlightState.BatteryLevel;
        uav.Position = new google.maps.LatLng(fs.Latitude, fs.Longitude);
        uav.Mission = uavData.Mission;
        uav.Orientation = uavData.FlightState.Yaw;
        var mis = uav.Mission;
        uav.Destination = new google.maps.LatLng(mis.Latitude, mis.Longitude);
        uav.Events = 0;
        uav.infobox = null;
        return uav;
    },

    SetUAVMarker : function(uav){
        var marker = new MarkerWithLabel({
            position: uav.Position,
            icon: mapStyles.uavSymbolBlack,
            labelContent: uav.Callsign + '<div style="text-align: center;"><b>Alt: </b>' + uav.Alt + '<br/><b>Bat: </b>' + uav.Battery + '</div>',
            labelAnchor: new google.maps.Point(95, 20),
            labelClass: "labels",
            labelStyle: { opacity: 0.75 },
            zIndex: 999999,
            uav: uav,
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
        return marker;
    },

    UpdateVehicle : function(uav, updatedUAV){
        var LatLng = new google.maps.LatLng(updatedUAV.Latitude, updatedUAV.Longitude);
        droneTrails.storeTrail(updatedUAV.Id, LatLng);

        uav.marker.setPosition(LatLng);
        uav.markerCircle.setPosition(LatLng);
        uav.Battery = updatedUAV.BatteryLevel;
        uav.Alt = updatedUAV.Altitude;
        uav.BatteryCheck = parseFloat(Math.round(updatedUAV.BatteryLevel * 100) / 100).toFixed(2);
        uav.Yaw = updatedUAV.Yaw;

        //Check drone heading and adjust as necessary
        if ((Math.round((10000000 * uav.Orientation)) / 10000000) != (Math.round((10000000 * uav.Yaw)) / 10000000)) {

            uav.Orientation = uav.Yaw;

            uav.marker.uavSymbolBlack.rotation = uav.Yaw;
            uav.marker.uavSymbolGreen.rotation = uav.Yaw;

            if (uav.marker.selected == true)
                uav.marker.setOptions({
                    icon: uav.marker.uavSymbolGreen
                });
            else
                uav.marker.setOptions({
                    icon: uav.marker.uavSymbolBlack
                })
        }

        uav.marker.setOptions({
            labelContent: uav.Callsign + '<div style="text-align: center;"><b>Alt: </b>' + uav.Alt + '<br/><b>Bat: </b>' + uav.BatteryCheck + '</div>'
        });

        return uav;
    },

    goTo_show: function () {
        document.getElementById("CommPopPlaceHolder").style.display = "block";
        document.getElementById("waypoint_popup").style.display = "block";
    },

    note_show: function () {
        document.getElementById("CommPopPlaceHolder").style.display = "block";
        document.getElementById("notification").style.display = "block";
    },

    goTo_hide: function () {
        document.getElementById("CommPopPlaceHolder").style.display = "none";
        document.getElementById("waypoint_popup").style.display = "none";
    },

    note_hide: function () {
        document.getElementById("CommPopPlaceHolder").style.display = "none";
        document.getElementById("notification").style.display = "none";
    },

    clear: function () {
        document.getElementById("go_lat").value = "";
        document.getElementById("go_long").value = "";
    },

    // USER INTERFACE PROMPT TO ACCEPT OR REJECT UAV ASSIGNMENT ON MAP
    goTo_RR_show: function () {
        document.getElementById("RoundRobin_popup").style.display = "block";
    },

    goTo_RR_hide: function () {
        $(".RoundRobin_popup").fadeOut("slow", function () { });
    },

    RR_button_accept: function () {
        $(".RoundRobin_popup").fadeOut("slow", function () { });
        document.getElementById('RR_choice_p').innerHTML = "You have accepted UAV";
        document.getElementById('RR_choice_p').style.color = "green";
        document.getElementById('RR_outer_result').style.display = "block";
        $(".RR_outer_result").fadeOut("slow", function () {});
    },


    RR_button_decline: function () {
        $.ajax({
            type: 'POST',
            url: '/api/uavs/rejectassignment?uavid=' + warningUavId + '&userid=' + assignment.getUserId(),
            success: function () {
                $(".RoundRobin_popup").fadeOut("slow", function () { });
                document.getElementById('RR_choice_p').innerHTML = "You have declined UAV";
                document.getElementById('RR_choice_p').style.color = "red";
                document.getElementById('RR_outer_result').style.display = "block";
                $(".RR_outer_result").fadeOut("slow", function () { });
            }
        });
        
    }
};