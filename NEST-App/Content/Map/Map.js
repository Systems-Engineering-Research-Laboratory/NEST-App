var toolMenu;
var toolsExpanded = false;
var uri = '/api/flightstate';
var runSim = false;
var dt = 1000; //Timestep in milliseconds
var phases = ["preparing", "enroute", "delivering", "returning", "landing"];
var dList;
var droneFeatures = [];

function triggerToolMenu(e) {
    if (toolsExpanded) {
        //collapse
    }
    else {
        //expand
    }
}

///THIS IS THE SINGLE MARKER/////////
// Create the icon feature (geom + properties)
var iconFeature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.transform([-118.529, 34.2417], 'EPSG:4326', 'EPSG:3857')),
    name: 'Test'
});

// Set up marker style
var markerStyle = new ol.style.Style({
    image: new ol.style.Icon(({
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        scale: 0.1,
        src: '../Content/marker.png'
    }))
});


iconFeature.setStyle(markerStyle);

var markers = new ol.layer.Vector({
    source: new ol.source.Vector({ features: [iconFeature] })
});
var droneLayer = new ol.layer.Vector({
    source: new ol.source.Vector({ features: droneFeatures })
});
//////////////////////////////////////////////

// Set up Drone style
var droneStyle = new ol.style.Style({
    image: new ol.style.Icon(({
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: '../Content/drone.gif'
    }))
});


function initDroneLayer(d) {
    //droneLayer.getSource().clear();
    var vehicles = d.vehicles;
    var ids = d.ids;
    /*if (drone list is empty) { }
    else {*/
    for (i = 1; i < ids.length; i++) {
        console.log("Iterate for loop " + i);
        console.log("Current vehicle is: " + vehicles[ids[i]]);
        //Create an array of map features (drones, in this case) and initialize each feature from a drone
        droneFeatures[i] = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform([vehicles[ids[i]].FlightState.Latitude, vehicles[ids[i]].FlightState.Longitude], 'EPSG:4326', 'EPSG:3857')),
            name: ids[i]
        });

        console.log("Vehicle's Latitude is: " + vehicles[ids[i]].FlightState.Latitude);
        console.log("Vehicle's Longitude is: " + vehicles[ids[i]].FlightState.Longitude);
        console.log("Id name is " + ids[i]);

        //Apply drne marker styles and set feature id (in case a lookup is required)
        droneFeatures[i].setStyle(droneStyle);
        droneFeatures[i].setId(ids[i]);
        console.log("Passed setStyle OK");
        console.log("This feature's geometry is: " + droneFeatures[i].getId())
    }
    console.log("Exited for loop OK");
    //Rebuild the drone layer with the new set of drone features.
    droneLayer.setSource(new ol.source.Vector({ features: droneFeatures }));
    // }

    // map.addLayer(droneLayer);
};





/*
//KML Style
var markerStyle = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: ol.proj.transform([-118.529,34.2417], 'EPSG:4326', 'EPSG:3857'),
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'marker.png'}))
    })
})
*/




///////MAP LAYERS//////////
//Load OpenStreetMaps tiles
var rasterOSM = new ol.layer.Tile({
    source: new ol.source.OSM({ layer: 'sat' })
});

var rasterMQ = new ol.layer.Tile({
    source: new ol.source.MapQuest({ layer: 'sat' })
});
rasterMQ.setVisible(false);

var rasterBing = new ol.layer.Tile({
    source: new ol.source.BingMaps({
        key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
        imagerySet: 'Aerial'
    })
});
rasterBing.setVisible(false);

/*var kmlLayer = new ol.layer.Vector({
  source: new ol.source.KML({
    //extractStyles: false,
    projection: 'EPSG:3857',
    url: '../KML_Data/myplaces.kml'
    }),
    style: function(feature, resolution) {
        return style[feature.getGeometry().getType()];
    }
});
*/
/*var flightPathLayer = new ol.layer.Vector({
//extent = mapExtent

})
*/


///////////////OPENWEATHERMAPS/////////////
/*var cloudLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        projection: 'EPSG:3857',
        url: 'http://${s}.tile.openweathermap.org/map/clouds/${z}/${x}/${y}.png'
    })
})

var pressureLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        projection: 'EPSG:3857',
        url: 'http://${s}.tile.openweathermap.org/map/pressure_cntr/${z}/${x}/${y}.png'
    })
})*/
////////////////////////////////////////////





//Create the Map
var map = new ol.Map({
    layers: [rasterOSM, rasterMQ, markers, droneLayer/*, cloudLayer, pressureLayer, kmlLayer*/],
    target: 'map',
    view: new ol.View({
        center: ol.proj.transform([-118.529, 34.2417], 'EPSG:4326', 'EPSG:3857'),
        zoom: 16
    })
});


function switchLayers(i) {
    switch (i) {
        case 0:
            rasterOSM.setVisible(true);
            rasterMQ.setVisible(false);
            rasterBing.setVisible(false);
            break;
        case 1:
            rasterOSM.setVisible(false);
            rasterMQ.setVisible(true);
            rasterBing.setVisible(false);
            break;
        default:
            rasterOSM.setVisible(false);
            rasterMQ.setVisible(false);
            rasterBing.setVisible(true);
            break;
    }
}

function init() {
    toolMenu = document.getElementById("Expand");
}
window.addEventListener("load", init, false);


$(document).ready(function () {
    //Stores the vehicles received from the AJAX call.
    dList = {
        vehicles: [],
        ids: []
    };

    $.ajax({
        url: '/api/uavs',
        success: function (data, textStatus, jqXHR) {
            for (var i = 0; i < data.length; i++) {
                dList.vehicles[data[i].Id] = new Vehicle(data[i]);
                dList.ids.push(data[i].Id);
            }
            getFlightStates(dList);
        }
    });


    $("#loadDrones").click(function (dlist) {
        console.log("Init Started");
        initDroneLayer(dList)
    });
});
