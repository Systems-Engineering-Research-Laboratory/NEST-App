var mapStyles = {
    colors: ['#1E90FF', '#FF1493', '#32CD32', '#FF8C00', '#4B0082'],
    uavFilterClick: false,

    mapOptions: {
        zoom: 18,
        center: new google.maps.LatLng(34.2420, -118.5288),
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDoubleClickZoom: true,
        styles: [{
            featureType: "poi",
            elementType: "labels",
            stylers: [
                  { visibility: "off" }
            ]
        }]
    },

    polyOptions: { //Options set for the polygon shapes and drawing manager
        strokeWeight: 0,
        fillOpacity: 0.45,
        editable: true
    },

    uavSymbolBlack: {
        path: 'M 355.5,212.5 513,312.25 486.156,345.5 404.75,315.5 355.5,329.5 308.25,315.5 224.75,345.5 197.75,313 z',
        fillColor: 'black',
        fillOpacity: 0.8,
        scale: 0.2,
        zIndex: 1,
        anchor: new google.maps.Point(355, 295)
    },

    uavCircleBlack: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'black',
        scale: 30,
        strokeWeight: 4,
        zIndex: -1
    },

    uavSymbolGreen: {
        path: 'M 355.5,212.5 513,312.25 486.156,345.5 404.75,315.5 355.5,329.5 308.25,315.5 224.75,345.5 197.75,313 z',
        fillColor: 'green',
        fillOpacity: 0.8,
        scale: 0.2,
        zIndex: 1,
        anchor: new google.maps.Point(355, 295)
    },

    mapClickIcon: {
        url: '../Content/img/markerBLUE.png',
        scaledSize: new google.maps.Size(35, 60)
    },

    goldStarBase: {
        path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
        fillColor: 'yellow',
        fillOpacity: 0.8,
        scale: 0.3,
        strokeColor: 'gold',
        strokeWeight: 4,
        anchor: new google.maps.Point(90, 140)
    },

    distanceCircleOptions: {
        radius: 8046.72, //distance in meters (5 miles)
        fillColor: '#3399FF',
        strokeWeight: 0,
        fillOpacity: 0.1,
        clickable: false,
        zindex: -99999,
    },

    flightPathOptions: {
        geodesic: true,
        strokeColor: 'blue',
        strokeOpacity: 1.0,
        strokeWeight: 2
    },

    BaseControl: function () {
        var basebutton = document.getElementById("base");
        google.maps.event.addDomListener(basebutton,'click', function () {
            map.setCenter(homeBase);
            map.setZoom(18);
        });
    },

    uavFilter: function () {
        //Click event listener
        var filterbutton = document.getElementById("filteruav");
        google.maps.event.addDomListener(filterbutton, 'click', function () {
            if (mapStyles.uavFilterClick == false) {
                var i = 1;
                while (uavs[i] != undefined || uavs[i] != null) {
                    if (assignment.assignments[uavs[i].Id - 1] != null) {
                        i++;
                        continue;
                    }
                    else {
                        uavs[i].marker.setMap(null);
                        uavs[i].markerCircle.setMap(null);
                        uavs[i].markerCircle.setVisible(false);
                        uavs[i].marker.setVisible(false);
                        i++;
                    }
                }
                mapStyles.uavFilterClick = true;
            }
            else {
                mapStyles.uavFilterClick = false;
                var i = 1;
                while ((uavs[i] != undefined || uavs[i] != null)) {
                    if (uavs[i].marker.getMap() == null) {
                        uavs[i].marker.setMap(map);
                        uavs[i].markerCircle.setMap(map);
                        uavs[i].markerCircle.setVisible(true);
                        uavs[i].marker.setVisible(true);
                        i++;
                    }
                    else
                        i++;
                }
            }
        });
    },

    //uavFilter: function(controlDiv, map) {
    //    controlDiv.style.padding = '6px';
    //    //CSS for control button exterior
    //    var controlUI = document.createElement('div');
    //    controlUI.style.backgroundColor = 'white';
    //    controlUI.style.borderStyle = 'solid';
    //    controlUI.style.borderWidth = '1px';
    //    controlUI.style.width = '53px';
    //    controlUI.style.cursor = 'pointer';
    //    controlUI.style.textAlign = 'center';
    //    controlUI.title = "Filter User Drones";
    //    controlDiv.appendChild(controlUI);

    //    //CSS for control button interior
    //    var controlText = document.createElement('div');
    //    controlText.style.fontFamily = 'Arial,sans-serif';
    //    controlText.style.fontSize = '11px';
    //    controlText.style.paddingLeft = '4px';
    //    controlText.style.paddingRight = '4px';
    //    controlText.style.paddingTop = '2px';
    //    controlText.style.paddingBottom = '4px';
    //    controlText.innerHTML = 'Filter UAVs';
    //    controlUI.appendChild(controlText);

    //    //Click event listener
    //    google.maps.event.addDomListener(controlUI, 'click', function () {
    //        if (mapStyles.uavFilterClick == false) {
    //            var i = 1;
    //            while (uavs[i] != undefined || uavs[i] != null) {
    //                if (assignment.assignments[uavs[i].Id - 1] != null) {
    //                    i++;
    //                    continue;
    //                }
    //                else {
    //                    uavs[i].marker.setMap(null);
    //                    uavs[i].markerCircle.setMap(null);
    //                    uavs[i].markerCircle.setVisible(false);
    //                    uavs[i].marker.setVisible(false);
    //                    i++;
    //                }
    //            }
    //            mapStyles.uavFilterClick = true;
    //        }
    //        else {
    //            mapStyles.uavFilterClick = false;
    //            var i = 1;
    //            while ((uavs[i] != undefined || uavs[i] != null)) {
    //                if (uavs[i].marker.getMap() == null) {
    //                    uavs[i].marker.setMap(map);
    //                    uavs[i].markerCircle.setMap(map);
    //                    uavs[i].markerCircle.setVisible(true);
    //                    uavs[i].marker.setVisible(true);
    //                    i++;
    //                }
    //                else
    //                    i++;
    //            }
    //        }
    //    });
    //},
    
    //setting trail style
    uavTrail: {
        url: '../Content/img/blue.jpg',
        fillOpacity: 0.7,
        size: new google.maps.Size(46, 44),
        scaledSize: new google.maps.Size(5, 5),
        anchor: new google.maps.Point(5, 5),
        zIndex: 10,
        clickable: false
    },

    restrictedArea: {
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        visible: true,
        editable: false
    }
};