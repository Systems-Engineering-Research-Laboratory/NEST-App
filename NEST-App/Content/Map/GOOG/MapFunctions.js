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


function GetLatLong(theMap, event){
    var lat = event.latLng.lat();
    var lng = event.latLng.lng();
    var point = new google.maps.LatLng(lat, lng);
    var infowindow = new google.maps.InfoWindow({
        content: '<div style="line-height: 1.35; overflow: hidden; white-space: nowrap;"><b>Lat: </b>' + lat + '<br/><b>Lng: </b>' + lng + '</div>',
        position: point
    });
    infowindow.open(theMap);
}

function DrawBoundingBox(theMap, e, shiftPressed, gridBoundingBox, mouseIsDown, mouseDownPos) {
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
}

function StopMapDrag(theMap, e, shiftPressed, mouseIsDown, mouseDownPos) {
    if (shiftPressed) {
        mouseIsDown = 1;
        mouseDownPos = e.latLng;
        theMap.setOptions({
            draggable: false
        });
    }
}