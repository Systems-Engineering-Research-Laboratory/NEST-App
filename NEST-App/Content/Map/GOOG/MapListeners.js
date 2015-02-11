function OverlayComplete(overlay, e) {
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
}


function GetLatLong(map, event){
    var lat = event.latLng.lat();
    var lng = event.latLng.lng();
    var point = new google.maps.LatLng(lat, lng);
    var infowindow = new google.maps.InfoWindow({
        content: '<div style="line-height: 1.35; overflow: hidden; white-space: nowrap;"><b>Lat: </b>' + lat + '<br/><b>Lng: </b>' + lng + '</div>',
        position: point
    });
    infowindow.open(map);
}
/*

google.maps.event.addListener(mapListeners, 'click', function (e) {
    if (selectedTrail != undefined) {
        for (var i = 0; i < (selectedTrail.length - 1) ; i++) {
            selectedTrail[i].setMap(null);
        }
        selectedUAV = null;
    }
});

google.maps.event.addListener(mapListeners, 'mousemove', function (e) {
    //console.log("move mouse down, shift down", mouseIsDown, shiftPressed);
    if (mouseIsDown && (shiftPressed || gridBoundingBox != null)) {
        if (gridBoundingBox !== null) {
            var newbounds = new google.maps.LatLngBounds(mouseDownPos, null);
            newbounds.extend(e.latLng);
            gridBoundingBox.setBounds(newbounds);

        } else {
            //console.log("first mouse move");
            gridBoundingBox = new google.maps.Rectangle({
                map: mapListeners,
                bounds: null,
                fillOpacity: 0.15,
                strokeWeight: 0.9,
                clickable: false
            });
        }
    }
});

google.maps.event.addListener(mapListeners, 'mousedown', function (e) {
    if (shiftPressed) {
        mouseIsDown = 1;
        mouseDownPos = e.latLng;
        mapListeners.setOptions({
            draggable: false
        });
    }
});

google.maps.event.addListener(mapListeners, 'mouseup', function (e) {
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
    mapListeners.setOptions({
        draggable: true
    });
});*/