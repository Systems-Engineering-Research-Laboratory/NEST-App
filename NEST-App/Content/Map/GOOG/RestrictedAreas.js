var restrictedAreas = {
    ne: null,
    sw: null,
    nelat: null,
    nelon: null,
    swlat: null,
    swlon: null,
    createDate: null,
    endDate: null,
    rectangle: null,
    infoWindow: null,
    
    confirm: function (c) {
        this.infoWindow.setMap(null);

        if (c) {
            var that = this;
            $.ajax({
                type: 'POST',
                url: '/api/maprestricteds',
                data: {
                    NorthEastLatitude: that.nelat,
                    NorthEastLongitude: that.nelon,
                    SouthWestLatitude: that.swlat,
                    SouthwestLongitude: that.swlon,
                    Ceiling: 999999,
                    Creator: "Operator",
                    TimeCreated: that.createDate.toISOString(),
                    TimeEnds: that.endDate.toISOString(),
                    ReasonCreated: "Bad stuff here",
                    Warning: false
                }
            }).success(function () {
                //Delete this rectangle, we are going to add it in through the SignalR listener above.
                that.rectangle.setMap(null);
            });
        }
        else {
            this.rectangle.setMap(null);
        }
    }
};

function RestrictedAreasContainer(map, drawingManager) {
    /**
    This class is the container for all the restricted areas. Note that this is a singleton class,
    having multiple of the classes in the same instance of the map will cause each rectangle to be
    drawn twice.
    */
    //The RestrictedAreas
    this.areas = []
    //Reference to the map, just in case.
    this.map = map;
    var that = this; //Used for ajax callbacks

    this.addAreaToMap = function (area) {
        //Get the northest and southwest corners
        var ne = new google.maps.LatLng(area.NorthEastLatitude, area.NorthEastLongitude);
        var sw = new google.maps.LatLng(area.SouthWestLatitude, area.SouthWestLongitude);
        //Creates the rectangle bounds
        var bnds = new google.maps.LatLngBounds(sw, ne);
        var rect = new google.maps.Rectangle(mapStyles.restrictedArea);
        rect.setBounds(bnds);
        //Set on the map.
        rect.setMap(this.map);
        //Store the rectangle reference in the area. This will make deletion easier
        //later on.
        area.rectangle = rect;
    }

    $.connection.vehicleHub.client.newRestrictedArea = function (area) {
        //Push into the array, then add to the map.
        that.areas.push(area);
        that.addAreaToMap(area);
    };

    //This pulls the restricted areas that are stored in the database and draws them on the map.
    $.ajax({
        url: '/api/maprestricteds'
    }).success(function (data, textStatus, jqXHR) {
        //Just set the refence to the data. The data should be an array of restricted areas.
        that.areas = data;
        //Add each one to the map.
        for (var i = 0; i < that.areas.length; i++) {
            that.addAreaToMap(data[i]);
        }
    });

    //This is a refence to the drawing manager. If the drawing manager creates a rectangle, then
    //make a request to the server to display the rectangle. 
    //TODO: Report failure to put the restricted area in somehow, maybe with an event.

    //UPDATE: -david
    //1) Moved the ajax posting up top so it can be called by click event
    //2) Made the variable globle so it can be called/changed outside (sorry for making this super ugly ):
    //3) Add another listener in the rectangle complete to detect bounds change, so the user can change the bounds before confirming
    //p.s. the TODO still applys
    google.maps.event.addListener(drawingManager, 'rectanglecomplete', function (rectangle) {
        //Get the corners of the rectangle to send to the server
        restrictedAreas.ne = rectangle.getBounds().getNorthEast();
        restrictedAreas.sw = rectangle.getBounds().getSouthWest();
        restrictedAreas.nelat = restrictedAreas.ne.lat();
        restrictedAreas.nelon = restrictedAreas.ne.lng();
        restrictedAreas.swlat = restrictedAreas.sw.lat();
        restrictedAreas.swlon = restrictedAreas.sw.lng();
        restrictedAreas.createDate = new Date();
        restrictedAreas.endDate = new Date();
        restrictedAreas.endDate.setFullYear(2030); //Restricted areas never go away!
        restrictedAreas.rectangle = rectangle;

        // ask user to confirm the selection
        var content = "<strong>Confirm?</strong><br>" +
                      "<button class='btn btn-default' style='margin-right: 5px;' onclick='restrictedAreas.confirm(true)'>OK</button>" +
                      "<button class='btn btn-default' onclick='restrictedAreas.confirm(false)'>Cancel</button>";
        restrictedAreas.infoWindow = new google.maps.InfoWindow();
        restrictedAreas.infoWindow.setContent(content);
        restrictedAreas.infoWindow.setPosition(restrictedAreas.ne);
        restrictedAreas.infoWindow.open(this.map);

        // detects the bounds change
        google.maps.event.addListener(rectangle, 'bounds_changed', function () {
            restrictedAreas.infoWindow.setMap(null);

            restrictedAreas.ne = rectangle.getBounds().getNorthEast();
            restrictedAreas.sw = rectangle.getBounds().getSouthWest();
            restrictedAreas.nelat = restrictedAreas.ne.lat();
            restrictedAreas.nelon = restrictedAreas.ne.lng();
            restrictedAreas.swlat = restrictedAreas.sw.lat();
            restrictedAreas.swlon = restrictedAreas.sw.lng();
            restrictedAreas.createDate = new Date();
            restrictedAreas.endDate = new Date();
            restrictedAreas.endDate.setFullYear(2030); //Restricted areas never go away!
            restrictedAreas.rectangle = rectangle;

            // ask user to confirm the selection
            var content = "<strong>Confirm?</strong><br>" +
                          "<button class='btn btn-default' style='margin-right: 5px;' onclick='restrictedAreas.confirm(true)'>OK</button>" +
                          "<button class='btn btn-default' onclick='restrictedAreas.confirm(false)'>Cancel</button>";
            restrictedAreas.infoWindow = new google.maps.InfoWindow();
            restrictedAreas.infoWindow.setContent(content);
            restrictedAreas.infoWindow.setPosition(restrictedAreas.ne);
            restrictedAreas.infoWindow.open(this.map);
        });
    });
}