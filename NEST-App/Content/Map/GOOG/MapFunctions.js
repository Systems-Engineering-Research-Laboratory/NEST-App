var mapFunctions = {
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

    DrawBoundingBox: function (theMap, e, shiftPressed, gridBoundingBox, mouseIsDown, mouseDownPos) {
        //console.log("move mouse down, shift down", mouseIsDown, shiftPressed);
        if (mouseIsDown && (shiftPressed || gridBoundingBox != null)) {
            if (gridBoundingBox !== null) {
                var newbounds = new google.maps.LatLngBounds(mouseDownPos, null);
                newbounds.extend(e.latLng);
                gridBoundingBox.setBounds(newbounds);

            } else {
                //console.log("first mouse move");
                gridBoundingBox = new google.maps.Rectangle({
                    map: theMap,
                    bounds: null,
                    fillOpacity: 0.15,
                    strokeWeight: 0.9,
                    clickable: false
                });
            }
        }
    },

    StopMapDrag: function (theMap, e, shiftPressed, mouseIsDown, mouseDownPos) {
        if (shiftPressed) {
            mouseIsDown = 1;
            mouseDownPos = e.latLng;
            theMap.setOptions({
                draggable: false
            });
        }
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