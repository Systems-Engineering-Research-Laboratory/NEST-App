var map;
var markers = {};
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
        markers[data[i].UAVId] = {};
        markers[data[i].UAVId].lat = data[i].Latitude;
        markers[data[i].UAVId].lng = data[i].Longitude;
        markers[data[i].UAVId].alt = data[i].Altitude;
        markers[data[i].UAVId].pos = new google.maps.LatLng(data[i].Latitude, data[i].Longitude);
        var marker = new google.maps.Marker({
            position: markers[data[i].UAVId].pos,
            map: map,
            icon: uavIconBlack
        });
        var key = data[i].UAVId.toString();
        markers[data[i].UAVId].marker = marker;
        google.maps.event.addListener(marker, 'click', (function (marker, key) {
            
            return function () {
                infowindow.setContent('<div style="line-height: 1.35; overflow: hidden; white-space: nowrap;"><b>ID: </b>' +key+ '</div>');
                infowindow.open(map, marker);
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
        if (evt.which === 16) { //shift key
            shiftPressed = true;
            console.log("Shift key down");
        }
    }).keyup(function (evt) {
        if (evt.which === 16) {
            shiftPressed = false;
            console.log("Shift key up");
        }
    });

    var mouseDownPos, gridBoundingBox = null, mouseIsDown = 0;
    var theMap = map;

    google.maps.event.addListener(theMap, 'mousemove', function (e) {
        console.log("move mouse down, shift down", mouseIsDown, shiftPressed);
        if ( mouseIsDown && (shiftPressed || gridBoundingBox != null )) {
            if ( gridBoundingBox !== null ) {
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
        if ( shiftPressed ) {
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
                var boundsSelectionArea = new google.maps.LatLngBounds(gridBoundingBox.getBounds().getSouthWest(), gridBoundingBox.getBounds().getNorthEast());
                for (var key in markers) { 
                    if (gridBoundingBox.getBounds().contains(markers[key].marker.getPosition())) {
                        markers[key].marker.setIcon(uavIconGreen);
                    } else {
                        markers[key].marker.setIcon(uavIconBlack);        
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