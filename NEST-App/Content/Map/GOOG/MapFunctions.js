var mapFunctions = {   
    shiftPressed : false,
    mouseDownPos: null,
    gridBoundingBox : null,
    mouseIsDown : false,

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

    MapContext : function(){
        var contextMenuOptions = {};
        contextMenuOptions.classNames = { menu: 'context_menu', menuSeparator: 'context_menu_separator' };
        var menuItems = [];
        menuItems.push({ className: 'context_menu_item', eventName: 'get_coords', label: 'Get Coords' });
        menuItems.push({});
        menuItems.push({ className: 'context_menu_item', eventName: 'go_here', label: 'Go Here' });
        menuItems.push({ className: 'context_menu_item', eventName: 'add_waypoint', label: 'Add Waypoint' });
        contextMenuOptions.menuItems = menuItems;
        var contextMenu = new ContextMenu(map, contextMenuOptions);

        return contextMenu;
    },

    MapContextSelection : function(map, latLng, eventName){
        switch (eventName) {
            case 'get_coords':
                var coords = {
                    latLng: latLng
                }
                this.GetLatLong(map, coords);
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
        
        return uav;
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
    }
};