var uavMarker;
var map;

function initialize() {

    var mapOptions = {
        zoom: 18,
        center: new google.maps.LatLng(34.2417, -118.529)
    }
    map = new google.maps.Map(document.getElementById('map-canvas'),
                                  mapOptions);

    var uavIcon = new google.maps.MarkerImage(
        '../Content/img/drone2.png',
        null, //Size determined at runtime
        null, //Origin is 0,0
        null, //Anchor is at the bottom center of the scaled image
        new google.maps.Size(100, 100)
    );

    var myLatLng = new google.maps.LatLng(34.2417, -118.529);
    uavMarker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        icon: uavIcon,
        draggable: true
    });

    var shapeBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(34.2417, -118.529),
        new google.maps.LatLng(34.2420, -118.528)
    );

    var rectangle = new google.maps.Rectangle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        bounds: shapeBounds,
        editable: true,
        draggable: true
    });

    google.maps.event.addListener(rectangle, 'bounds_changed', newRectangle);
    infoWindow = new google.maps.InfoWindow();

    function newRectangle(event) {
        var ne = rectangle.getBounds().getNorthEast();
        var sw = rectangle.getBounds().getSouthWest();

        var contentString = '<b>Rectangle moved.</b><br>' +
            'New north-east corner: ' + ne.lat() + ', ' + ne.lng() + '<br>' +
            'New south-west corner: ' + sw.lat() + ', ' + sw.lng();

        infoWindow.setContent(contentString);
        infoWindow.setPosition(ne);
        infoWindow.open(map);
    }

    //End map initialize
}

$(document).ready(function () {
    google.maps.event.addDomListener(window, 'load', initialize);

    var vehicleHub = $.connection.vehicleHub;
    vehicleHub.client.flightStateUpdate = function (vehicle) {
        console.log(vehicle); + " " + console.log(vehicle.Latitude); + " " + console.log(vehicle.Longitude);
        uavMarker.setPosition(new google.maps.LatLng(vehicle.Latitude, vehicle.Longitude));

        var contentString2 = '<b>UAV</b><br>' +
                'Latitude: ' + vehicle.Latitude + '<br>' +
                'Longitude: ' + vehicle.Longitude;
        var infowindow2 = new google.maps.InfoWindow({
            content: contentString2
        });

        google.maps.event.addListener(uavMarker, 'click', function () {
            infowindow2.open(map, uavMarker);
        });
    }


});