
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
    google.maps.event.addListener(drawingManager, 'rectanglecomplete', function (rectangle) {
        //Get the corners of the rectangle to send to the server
        var bounds = rectangle.getBounds();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        var nelat = ne.lat();
        var nelon = ne.lng();
        var swlat = sw.lat();
        var swlon = sw.lng();
        var createDate = new Date();
        var endDate = new Date();
        endDate.setFullYear(2030); //Restricted areas never go away!
        $.ajax({
            type: 'POST',
            url: '/api/maprestricteds',
            data: {
                NorthEastLatitude: nelat,
                NorthEastLongitude: nelon,
                SouthWestLatitude: swlat,
                SouthwestLongitude: swlon,
                Ceiling: 999999,
                Creator: "Operator",
                TimeCreated: createDate.toISOString(),
                TimeEnds: endDate.toISOString(),
                ReasonCreated: "Bad stuff here",
                Warning: false
            }
        }).success(function () {
            //Delete this rectangle, we are going to add it in through the SignalR listener above.
            rectangle.setMap(null);
        });
    });
    
}