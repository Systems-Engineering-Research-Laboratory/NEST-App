var map;
var pointText;
var results;
var parse;
var uavs = {};
var overlays = []; //Array for the polygon shapes as overlays
var drawingManager;
var selectedShape;
var uavMarker;
var selectedDrones = []; //store drones selected from any method here
var storedGroups = []; //keep track of different stored groupings of UAVs
var ctrlPressed = false;
var infobox;
var infoboxAlert;
var selected = false;
var homeBase = new google.maps.LatLng(34.2417, -118.529);
var colors = ['#1E90FF', '#FF1493', '#32CD32', '#FF8C00', '#4B0082'];
var selectedColor;
var colorButtons = {};
var polyOptions = { //Options set for the polygon shapes and drawing manager
    strokeWeight: 0,
    fillOpacity: 0.45,
    editable: true
};

var uavSymbolBlack = {
    path: 'M 355.5,212.5 513,312.25 486.156,345.5 404.75,315.5 355.5,329.5 308.25,315.5 224.75,345.5 197.75,313 z',
    fillColor: 'black',
    fillOpacity: 0.8,
    scale: 0.2,
    zIndex: 1,
    anchor: new google.maps.Point(355, 295)
};

var uavCircleBlack = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: 'black',
    scale: 30,
    strokeWeight: 4,
    zIndex: -1
};

var uavSymbolGreen = {
    path: 'M 355.5,212.5 513,312.25 486.156,345.5 404.75,315.5 355.5,329.5 308.25,315.5 224.75,345.5 197.75,313 z',
    fillColor: 'green',
    fillOpacity: 0.8,
    scale: 0.2,
    zIndex: 1,
    anchor: new google.maps.Point(355, 295)
};

var mapClickIcon = new google.maps.MarkerImage(
        '../Content/img/markerBLUE.png',
        null,
        null,
        null,
        new google.maps.Size(35, 60)
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

/******************* Emergency Info Box *********************/
    infobox = new InfoBox({
        content: document.getElementById("infobox"),
        disableAutoPan: false,
        maxWidth: 100,
        pixelOffset: new google.maps.Size(-75, 30),
        zIndex: null,
        boxStyle: {
            opacity: 0.75,
            width: "150px"
        },
        closeBoxMargin: "9px 1px 2px 2px"
    });

    infoboxAlert = new InfoBox({
        content: document.getElementById("infoboxAlert"),
        disableAutoPan: false,
        maxWidth: 20,
        pixelOffset: new google.maps.Size(-10, -80),
        zIndex: null,
        boxStyle: {
            opacity: 0.75,
            width: "20px",
        },
    });

function uavMarkers(data, textStatus, jqXHR) {
    console.log("Pulling Flightstates...", textStatus);
    for (var i = 0; i < data.length; i++) {
        uavs[data[i].Id] = {};
        uavs[data[i].Id].FlightState = data[i].FlightState;
        uavs[data[i].Id].Schedule = data[i].Schedule;
        uavs[data[i].Id].Missions = data[i].Schedule.Missions;
        pointText = uavs[data[i].Id].FlightState.Position.Geography.WellKnownText;
        results = pointText.match(/-?\d+(\.\d+)?/g);
        uavs[data[i].Id].Lat = results[1];
        uavs[data[i].Id].Lon = results[0];
        uavs[data[i].Id].Alt = results[2];
        uavs[data[i].Id].Callsign = data[i].Callsign;
        uavs[data[i].Id].Battery = data[i].FlightState.BatteryLevel;
        uavs[data[i].Id].Position = new google.maps.LatLng(results[1], results[0]);
        
        var markerCircle = new google.maps.Marker({
            position: uavs[data[i].Id].Position,
            map: map,
            icon: uavCircleBlack
        });

        var marker = new MarkerWithLabel({
            position: uavs[data[i].Id].Position,
            map: map,
            icon: uavSymbolBlack,
            labelContent: uavs[data[i].Id].Callsign + '<div style="text-align: center;"><b>Alt: </b>' + uavs[data[i].Id].Alt + '<br/><b>Bat: </b>' + uavs[data[i].Id].Battery + '</div>',
            labelAnchor: new google.maps.Point(95, 20),
            labelClass: "labels",
            labelStyle: { opacity: 0.75 }
        });

        var key = data[i].Id.toString();
        uavs[data[i].Id].marker = marker;
        uavs[data[i].Id].markerCircle = markerCircle;
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
                /****Unused infowindow set ****/
                //infowindow.setContent('<div style="line-height: 1.35; overflow: hidden; white-space: nowrap;"><b>ID: </b>' + key + '</div>');
                //infowindow.open(map, marker);
                
                console.log("Number of selected drones: " + selectedDrones.length);
            }
        })(marker, key));
    }
}

function clearSelection() {
    if (selectedShape) {
        selectedShape.setEditable(false);
        selectedShape = null;
    }
}

function setSelection(shape) {
    clearSelection();
    selectedShape = shape;
    shape.setEditable(true);
    selectColor(shape.get('fillColor') || shape.get('strokeColor'));
}

function deleteSelectedShape() {
    if (selectedShape) {
        selectedShape.setMap(null);
    }
}

function deleteAllShape() {
    for (var i = 0; i < overlays.length; i++) {
        overlays[i].overlay.setMap(null);
    }
    overlays = [];
}

function selectColor(color) {
    selectedColor = color;
    for (var i = 0; i < colors.length; ++i) {
        var currentColor = colors[i];
        colorButtons[currentColor].style.border = currentColor == color ? '2px solid #789' : '2px solid #fff';
    }

    //Fill the shapes with the color selected by user
    var polylineOptions = drawingManager.get('polylineOptions');
    polylineOptions.strokeColor = color;
    drawingManager.set('polylineOptions', polylineOptions);

    var rectangleOptions = drawingManager.get('rectangleOptions');
    rectangleOptions.fillColor = color;
    drawingManager.set('rectangleOptions', rectangleOptions);

    var circleOptions = drawingManager.get('circleOptions');
    circleOptions.fillColor = color;
    drawingManager.set('circleOptions', circleOptions);

    var polygonOptions = drawingManager.get('polygonOptions');
    polygonOptions.fillColor = color;
    drawingManager.set('polygonOptions', polygonOptions);
}

function setSelectedShapeColor(color) {
    if (selectedShape) {
        if (selectedShape.type == google.maps.drawing.OverlayType.POLYLINE) {
            selectedShape.set('strokeColor', color);
        } else {
            selectedShape.set('fillColor', color);
        }
    }
}

function makeColorButton(color) {
    var button = document.createElement('span');
    button.className = 'color-button';
    button.style.backgroundColor = color;
    google.maps.event.addDomListener(button, 'click', function () {
        selectColor(color);
        setSelectedShapeColor(color);
    });

    return button;
}

function buildColorPalette() {
    var colorPalette = document.getElementById('color-palette');
    for (var i = 0; i < colors.length; ++i) {
        var currentColor = colors[i];
        var colorButton = makeColorButton(currentColor);
        colorPalette.appendChild(colorButton);
        colorButtons[currentColor] = colorButton;
    }
    selectColor(colors[0]);
}

$(document).ready(function () {
    var mapOptions = {
        zoom: 18,
        center: new google.maps.LatLng(34.2417, -118.529),
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDoubleClickZoom: true,
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    var homeControlDiv = document.createElement('div');
    var homeControl = new BaseControl(homeControlDiv, map);

    homeControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT].push(homeControlDiv);

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
    google.maps.event.addListener(map, "rightclick", function (event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        var point = new google.maps.LatLng(lat, lng);
        var infowindow = new google.maps.InfoWindow({
            content: '<div style="line-height: 1.35; overflow: hidden; white-space: nowrap;"><b>Lat: </b>' + lat + '<br/><b>Lng: </b>' + lng + '</div>',
            position: point
        });
        infowindow.open(map);
    });

    //Drawing manager top left, allows user to draw shapes and lines on the map
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        markerOptions: {
            draggable: true
        },
        polylineOptions: {
            editable: true
        },
        rectangleOptions: polyOptions,
        circleOptions: polyOptions,
        polygonOptions: polyOptions,
        map: map
    });

    drawingManager.setMap(map);
    drawingManager.setDrawingMode(null);

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {
        overlays.push(e);
        if (e.type != google.maps.drawing.OverlayType.MARKER) {
            //Switch to non-drawing after a shape is drawn
            drawingManager.setDrawingMode(null);
            //Select the shape when user clicks on it
            var newShape = e.overlay;
            newShape.type = e.type;
            google.maps.event.addListener(newShape, 'click', function () {
                setSelection(newShape);
            });
            setSelection(newShape);
        }
    });

    //Delete shapes and clear selection
    google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
    google.maps.event.addListener(map, 'click', clearSelection);
    google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', deleteSelectedShape);
    google.maps.event.addDomListener(document.getElementById('delete-all-button'), 'click', deleteAllShape);
    buildColorPalette();


    /* Vehicle movement */
    var vehicleHub = $.connection.vehicleHub;
    vehicleHub.client.flightStateUpdate = function (vehicle) {
        console.log(vehicle);
        var LatLng = new google.maps.LatLng(vehicle.Latitude, vehicle.Longitude);
        uavs[vehicle.Id].marker.setPosition(LatLng);
        uavs[vehicle.Id].markerCircle.setPosition(LatLng);
        parse = parseFloat(Math.round(vehicle.BatteryLevel * 100) / 100).toFixed(2);
        uavSymbolBlack.rotation = vehicle.Yaw;
        uavSymbolGreen.rotation = vehicle.Yaw;
        if (selected == false)
            uavs[vehicle.Id].marker.setIcon(uavSymbolBlack);
        else
            uavs[vehicle.Id].marker.setIcon(uavSymbolGreen);
        uavs[vehicle.Id].marker.setOptions({
            labelContent: uavs[vehicle.Id].Callsign + '<div style="text-align: center;"><b>Alt: </b>' + vehicle.Altitude + '<br/><b>Bat: </b>' + parse + '</div>',
            icon: uavs[vehicle.Id].marker.icon
        });
        console.log(parse);
        if (parse < .2) {
            infobox.open(map, uavs[vehicle.Id].marker);
            infoboxAlert.open(map, uavs[vehicle.Id].marker);
        }
    }

    /*Click-drag-select*/
    var shiftPressed = false;
    $(window).keydown(function (evt) {
        if (evt.which === 16) {
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
        if (evt.which === 16) {
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
                console.log("first mouse move");
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
                        selected = true;
                        uavs[key].marker.setIcon(uavSymbolGreen);
                        selectedDrones.push(uavs[key]);//push the selected markers to an array
                        console.log("Number of selected drones: " + selectedDrones.length);
                    } else {
                        selected = false;
                        uavs[key].marker.setIcon(uavSymbolBlack);
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