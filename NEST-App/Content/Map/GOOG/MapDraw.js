var mapDraw = {
    selectedColor: null,
    selectedShape: null,
    overlays: [],//Array for the polygon shapes as overlays
    colorButtons : {},
    drawingManager: null,
    //Drawing manager top left, allows user to draw shapes and lines on the map
    InitDrawingManager : function () {
        this.drawingManager = new google.maps.drawing.DrawingManager(
        {
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            markerOptions: {
                draggable: true
            },
            polylineOptions: {
                editable: true
            },
            rectangleOptions: mapStyles.polyOptions,
            circleOptions: mapStyles.polyOptions,
            polygonOptions: mapStyles.polyOptions,
        });
    },

    clearSelection: function () {
        if (this.selectedShape) {
            this.selectedShape.setEditable(false);
            this.selectedShape = null;
        }
    },

    setSelection: function (shape) {
        this.clearSelection();
        this.selectedShape = shape;
        shape.setEditable(true);
        this.selectColor(shape.get('fillColor') || shape.get('strokeColor'));
    },

    deleteSelectedShape: function () {
        if (this.selectedShape) {
            this.selectedShape.setMap(null);
        }
    },

    deleteAllShape: function () {
        for (var i = 0; i < this.overlays.length; i++) {
            this.overlays[i].overlay.setMap(null);
        }
        this.overlays = [];
    },

    selectColor: function (color) {
        this.selectedColor = color;
        for (var i = 0; i < mapStyles.colors.length; ++i) {
            var currentColor = mapStyles.colors[i];
            this.colorButtons[currentColor].style.border = currentColor == color ? '2px solid #789' : '2px solid #fff';
        }

        //Fill the shapes with the color selected by user
        var polylineOptions = this.drawingManager.get('polylineOptions');
        polylineOptions.strokeColor = color;
        this.drawingManager.set('polylineOptions', polylineOptions);

        var rectangleOptions = this.drawingManager.get('rectangleOptions');
        rectangleOptions.fillColor = color;
        this.drawingManager.set('rectangleOptions', rectangleOptions);

        var circleOptions = this.drawingManager.get('circleOptions');
        circleOptions.fillColor = color;
        this.drawingManager.set('circleOptions', circleOptions);

        var polygonOptions = this.drawingManager.get('polygonOptions');
        polygonOptions.fillColor = color;
        this.drawingManager.set('polygonOptions', polygonOptions);
    },

    setSelectedShapeColor: function (color) {
        if (this.selectedShape) {
            if (this.selectedShape.type == google.maps.drawing.OverlayType.POLYLINE) {
                this.selectedShape.set('strokeColor', color);
            } else {
                this.selectedShape.set('fillColor', color);
            }
        }
    },

    makeColorButton: function (color) {
        var button = document.createElement('span');
        button.className = 'color-button';
        button.style.backgroundColor = color;
        google.maps.event.addDomListener(button, 'click', function () {
            this.selectColor(color);
            this.setSelectedShapeColor(color);
        });

        return button;
    },

    buildColorPalette: function () {
        var colorPalette = document.getElementById('color-palette');
        for (var i = 0; i < mapStyles.colors.length; ++i) {
            var currentColor = mapStyles.colors[i];
            var colorButton = this.makeColorButton(currentColor);
            colorPalette.appendChild(colorButton);
            this.colorButtons[currentColor] = colorButton;
        }
        this.selectColor(mapStyles.colors[0]);
    },

    OverlayComplete: function (e) {
        this.overlays.push(e);
        if (e.type != google.maps.drawing.OverlayType.MARKER) {
            //Switch to non-drawing after a shape is drawn
            this.drawingManager.setDrawingMode(null);
            //Select the shape when user clicks on it
            var newShape = e.overlay;
            newShape.type = e.type;
            google.maps.event.addListener(newShape, 'click', function () {
                this.setSelection(newShape);
            });
            this.setSelection(newShape);
        }
    }
};