var map;
var uavs = {};
var selectedDrones = []; //store drones selected from any method here
var storedGroups = []; //keep track of different stored groupings of UAVs
var ctrlPressed = false;
var infowindow = new google.maps.InfoWindow();
var homeBase = new google.maps.LatLng(34.2417, -118.529);
var uavIconBlack = new google.maps.MarkerImage(
        '../Content/img/drone2.png',
        null, //Size determined at runtime
        null, //Origin is 0,0
        null, //Anchor is at the bottom center of the scaled image
        new google.maps.Size(100, 100)
    );
var uavIconGreen = new google.maps.MarkerImage(
        '../Content/img/drone3.png',
        null,
        null,
        null,
        new google.maps.Size(100, 100)
    );

//Button for zooming to base on click
function BaseControl(controlDiv, map) {
    controlDiv.style.padding = '6px';

    //CSS for control button exterior
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'white';
    controlUI.style.borderStyle = 'solid';
    controlUI.style.borderWidth = '1px';
    controlUI.style.width = '53px';
    controlUI.style.cursor = 'pointer';
    controlUI.style.textAlign = 'center';
    controlUI.title = "Zoom to base";
    controlDiv.appendChild(controlUI);

    //CSS for control button interior
    var controlText = document.createElement('div');
    controlText.style.fontFamily = 'Arial,sans-serif';
    controlText.style.fontSize = '11px';
    controlText.style.paddingLeft = '4px';
    controlText.style.paddingRight = '4px';
    controlText.style.paddingTop = '2px';
    controlText.style.paddingBottom = '4px';
    controlText.innerHTML = 'Base';
    controlUI.appendChild(controlText);

    //Click event listener
    google.maps.event.addDomListener(controlUI, 'click', function () {
        map.setCenter(homeBase);
        map.setZoom(18);
    });
}

function uavMarkers(data, textStatus, jqXHR) {
    console.log("Pulling Flightstates...", textStatus);
    for (var i = 0; i < data.length; i++) {
        uavs[data[i].UAVId] = {};
        uavs[data[i].UAVId].lat = data[i].Latitude;
        uavs[data[i].UAVId].lng = data[i].Longitude;
        uavs[data[i].UAVId].alt = data[i].Altitude;
        uavs[data[i].UAVId].pos = new google.maps.LatLng(data[i].Latitude, data[i].Longitude);
        var marker = new MarkerWithLabel({
            position: uavs[data[i].UAVId].pos,
            map: map,
            icon: uavIconBlack,
            labelContent: uavs[data[i].UAVId].alt,
            labelAnchor: new google.maps.Point(31, 40),
            labelClass: "labels",
            labelStyle: {opacity: 0.75}
        });
        var key = data[i].UAVId.toString();
        uavs[data[i].UAVId].marker = marker;
        google.maps.event.addListener(marker, 'click', (function (marker, key, event) {

            $(window).keydown(function (evt) {
                if (evt.ctrlKey) {//If ctrl is not pressed, then clear selectedDrones[] before adding the clicked drone to the list
                    console.log("Ctrl key pressed");
                    while (selectedDrones.length > 0) {//clear the selected drone list
                        selectedDrones.pop();
                    }
                }
            });
            selectedDrones.push(marker);
            return function () {
                infowindow.setContent('<div style="line-height: 1.35; overflow: hidden; white-space: nowrap;"><b>ID: </b>' + key + '</div>');
                infowindow.open(map, marker);
                            console.log("Number of selected drones: " + selectedDrones.length);
            }

        })(marker, key));
    }
}

$(document).ready(function () {
    var mapOptions = {
        zoom: 18,
        center: new google.maps.LatLng(34.2417, -118.529),
        disableDoubleClickZoom: true
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    var homeControlDiv = document.createElement('div');
    var homeControl = new BaseControl(homeControlDiv, map);

    homeControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT].push(homeControlDiv);

    $.ajax({
        url: '/api/flightstate',
        success: function (data, textStatus, jqXHR) {
            uavMarkers(data, textStatus, jqXHR);
        }
    });

    /*Click-drag-select*/
    var shiftPressed = false;
    $(window).keydown(function (evt) {
        if (evt.shiftKey) {
            shiftPressed = true;
            console.log("Shift key down");
        }
        //if shift + (0 through 9) is pressed, all selected drones will be bound to that number
        if (evt.shiftKey && ((evt.which >= 48) && (evt.which <= 57))){
            storedGroups[evt.which] = selectedDrones;
            console.log("Number of selected drones: " + selectedDrones.length);
        }
        //if 0 through 9 is pressed, it restores that list of selected drones and turns them green
        if ((evt.which >= 48) && (evt.which <= 57)) {
            while (selectedDrones.length > 0) {//clear the selected drone list
                selectedDrones.pop();
            }
            if (storedGroups[evt.which]!=null){
                selectedDrones.push(storedGroups[evt.which]);
                if (selectedDrones.length != 0) {
                    var i;
                    for (i = 0; i < selectedDrones.length; i++) {
                        //selectedDrones[i].marker.setIcon(uavIconGreen);
                    }
                }
            }
            console.log("Number of selected drones: " + selectedDrones.length);
        }
    }).keyup(function (evt) {
        if (evt.shiftKey) {
            shiftPressed = false;
            console.log("Shift key up");
        }
    });



    var mouseDownPos, gridBoundingBox = null, mouseIsDown = 0;
    var theMap = map;

    google.maps.event.addListener(theMap, 'mousemove', function (e) {
        console.log("move mouse down, shift down", mouseIsDown, shiftPressed);
        if (mouseIsDown && (shiftPressed || gridBoundingBox != null)) {
            if (gridBoundingBox !== null) {
                var newbounds = new google.maps.LatLngBounds(mouseDownPos, null);
                newbounds.extend(e.latLng);
                gridBoundingBox.setBounds(newbounds);

            } else {
                console.log("firsts mouse move");
                gridBoundingBox = new google.maps.Rectangle({
                    map: theMap,
                    bounds: null,
                    fillOpacity: 0.15,
                    strokeWeight: 0.9,
                    clickable: false
                });
            }
        }
    });

    google.maps.event.addListener(theMap, 'mousedown', function (e) {
        if (shiftPressed) {
            mouseIsDown = 1;
            mouseDownPos = e.latLng;
            theMap.setOptions({
                draggable: false
            });
        }
    });

    google.maps.event.addListener(theMap, 'mouseup', function (e) {
        if (mouseIsDown && (shiftPressed || gridBoundingBox != null)) {
            mouseIsDown = 0;
            if (gridBoundingBox !== null) {
                while (selectedDrones.length > 0) {//clear the selected drone list
                    selectedDrones.pop();
                }
                var boundsSelectionArea = new google.maps.LatLngBounds(gridBoundingBox.getBounds().getSouthWest(), gridBoundingBox.getBounds().getNorthEast());
                for (var key in uavs) {
                    if (gridBoundingBox.getBounds().contains(uavs[key].marker.getPosition())) {
                        uavs[key].marker.setIcon(uavIconGreen);
                        selectedDrones.push(uavs[key]);//push the selected markers to an array
                        console.log("Number of selected drones: " + selectedDrones.length);
                    } else {
                        uavs[key].marker.setIcon(uavIconBlack);
                        console.log("Number of selected drones: " + selectedDrones.length);
                    }
                }
                gridBoundingBox.setMap(null);
            }
            gridBoundingBox = null;
        }
        theMap.setOptions({
            draggable: true
        });
    });


});