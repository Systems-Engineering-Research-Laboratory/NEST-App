var map;
var markers = {};
var infowindow = new google.maps.InfoWindow();
var homeBase = new google.maps.LatLng(34.2417, -118.529);
var uavIcon = new google.maps.MarkerImage(
        '../Content/img/drone2.png',
        null, //Size determined at runtime
        null, //Origin is 0,0
        null, //Anchor is at the bottom center of the scaled image
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
            icon: uavIcon
        });
        markers[data[i].UAVId].marker = marker;
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
});