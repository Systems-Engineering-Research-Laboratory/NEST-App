var uavMarker;
var map;
var uavIcon;
var uavTrail;
var trailArray = [];
infoWindow = new google.maps.InfoWindow;

function initialize() {

    var mapOptions = {
        zoom: 18,
        center: new google.maps.LatLng(34.2417, -118.529)
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    uavIcon = new google.maps.MarkerImage(
        '../Content/img/drone2.png',
        null, //Size determined at runtime
        null, //Origin is 0,0
        null, //Anchor is at the bottom center of the scaled image
        new google.maps.Size(100, 100)
    );

    uavTrail = new google.maps.MarkerImage(
        '../Content/img/blue.jpg',
        null,
        null,
        new google.maps.Point(4, 50),
        new google.maps.Size(5, 5)
    );

    var myLatLng = new google.maps.LatLng(34.2417, -118.529);
    uavMarker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        icon: uavIcon,
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

function placeTrail(location) {
    var marker = new google.maps.Marker({
        position: location,
        icon: uavTrail,
    });
    trailArray.push(marker);
}

$(document).ready(function () {
    google.maps.event.addDomListener(window, 'load', initialize);
    var vehicleHub = $.connection.vehicleHub;
    vehicleHub.client.flightStateUpdate = function (vehicle) {
        var LatLng = new google.maps.LatLng(vehicle.Latitude, vehicle.Longitude);
        uavMarker.setPosition(LatLng);
        placeTrail(LatLng);
        var contentString2 = '<b>UAV</b><br>' +
                'Latitude: ' + vehicle.Latitude + '<br>' +
                'Longitude: ' + vehicle.Longitude;
        infoWindow.setContent(contentString2);

        google.maps.event.addListener(uavMarker, 'click', function () {
            infoWindow.open(map, uavMarker);
            for (i = 0; i < trailArray.length; i++) {
                trailArray[i].setMap(map);
            }

        });
        google.maps.event.addListener(map, 'click', function () {
            for (i = 0; i < trailArray.length; i++) {
                trailArray[i].setMap(null);
            }
        });
    }
});