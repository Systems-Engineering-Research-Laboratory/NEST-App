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
    for (var i = 0; i < mapStyles.colors.length; ++i) {
        var currentColor = mapStyles.colors[i];
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
    for (var i = 0; i < mapStyles.colors.length; ++i) {
        var currentColor = mapStyles.colors[i];
        var colorButton = makeColorButton(currentColor);
        colorPalette.appendChild(colorButton);
        colorButtons[currentColor] = colorButton;
    }
    selectColor(mapStyles.colors[0]);
}