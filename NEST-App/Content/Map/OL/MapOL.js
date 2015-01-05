var toolMenu;
var toolsExpanded = false;
var uri = '/api/flightstate';
var runSim = false;
var dt = 1000; //Timestep in milliseconds
var phases = ["preparing", "enroute", "delivering", "returning", "landing"];
var dList;


//Placeholder to control the animation of the tool menu on the overview, likely with jQuery
function triggerToolMenu(e) {
    if (toolsExpanded) {
        //collapse
    }
    else {
        //expand
    }
}
////////THIS IS THE SINGLE MARKER/////////
/*This is an example of how to create a single marker on the map.
Marker elements on the map are called "features", and an array of 
features can be loaded into a map layer.Vector as the source of data,
pushing all the features onto the map as a set of markers*/

// Create the icon feature and define its geometry (location) and properties
var iconFeature = new ol.Feature({
    //Geometry defines the type of feature (line, multiline, circle, point, etc.) as well as the coordinates of the feature.
    //Remember to transform coordinates into the projection that is being used by the current map
    geometry: new ol.geom.Point(ol.proj.transform([-118.529, 34.2417], 'EPSG:4326', 'EPSG:3857')),
    name: 'Test'
});

// Set up marker style
var markerStyle = new ol.style.Style({
    image: new ol.style.Icon(({
        //"anchor" defines which part of the image is centered onto the coordinates of the feature.
        //In this case, the bottom center of the image is where the feature's coordinates are.
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        scale: 0.1,
        src: '../Content/img/drone.png'
    }))
});

//Apply the style of the feature to the location of the feature
iconFeature.setStyle(markerStyle);


//A vector layer is created here, with a feature array (of one element, in this case) as the vector source
var markers = new ol.layer.Vector({
    source: new ol.source.Vector({ features: [iconFeature] })
});
//////////////END SINGLE MARKER//////////////////





///////////PLACEHOLDER FOR DRONE LAYER//////////
/*This is designed in the style of the single-marker example described above,
however, the source will be an array of drones instead of a single element*/


var droneFeatures = [];
var droneLayer = new ol.layer.Vector({
    source: new ol.source.Vector({ features: droneFeatures }),
    visibile: true
});

// Set up Drone style
var droneStyle = new ol.style.Style({
    image: new ol.style.Icon(({
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        scale: 0.1,
        src: '../Content/drone.png'
    }))
});

//////////END DRONE LAYER PLACEHOLDER///////////////

//THIS ENTIRE FUNCTION CAN LIKELY BE DELETED
/*
function initDroneLayer(d) {
    //droneLayer.getSource().clear();
    var vehicles = d.vehicles;
    var ids = d.ids;
    if (dList.empty()) { }
    else {
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
    }

    // map.addLayer(droneLayer);
};
*/


///////MAP LAYERS//////////
//Load OpenStreetMaps tiles to a layer
var rasterOSM = new ol.layer.Tile({
    source: new ol.source.OSM({ layer: 'sat' })
});

//Load MapQuest tiles to a layer
var rasterMQ = new ol.layer.Tile({
    source: new ol.source.MapQuest({ layer: 'sat' }),
    visible: false
});

//Load Bing tiles to a layer (currently using placeholder key)
var rasterBing = new ol.layer.Tile({
    source: new ol.source.BingMaps({
        key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
        imagerySet: 'Aerial'
    }),
    visible: false
});


///////////////OPENWEATHERMAPS/////////////
/*This is a placeholder set of layers that will be pulling from the OpenWeatherMaps API
once it becomes a priority
*/

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
///////////////END OPENWEATHERMAPS////////





//Create the Map
/*"For a map to render, a view, one or more layers, and a target container are needed"
See https://openlayers.orgv3.0.0/apidoc/ol.Map.html for another basic map definition*/
var map = new ol.Map({
    layers: [rasterOSM, rasterMQ, markers, droneLayer/*, cloudLayer, pressureLayer, kmlLayer*/],
    target: 'map',
    view: new ol.View({
        center: ol.proj.transform([-118.529, 34.2417], 'EPSG:4326', 'EPSG:3857'),
        zoom: 16
    })
});


//This function gets called whenever a "Map View" radio button is selected.
//It hides inactive Views and makes the selected Map View visible.
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

function forceRefresh() {
    map.render();
}

function init() {
    toolMenu = document.getElementById("Expand");
}
window.addEventListener("load", init, false);

function new_dest_show() {
    document.getElementById("CommPopPlaceHolder").style.display = "block";
}

function new_dest_hide() {
    document.getElementById("CommPopPlaceHolder").style.display = "none";
}

$(document).ready(function () {
    //Stores the vehicles received from the AJAX call.
    /*
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
   */



    var droneSource = droneLayer.getSource();
    var featureList = droneLayer.getSource().getFeatures();
    var vehicleHub = $.connection.vehicleHub;
    vehicleHub.client.flightStateUpdate = function (vehicle) {
        console.log(vehicle); + " " + console.log(vehicle.Latitude); + " " + console.log(vehicle.Longitude);
        
        //Check to see if the drone already exists on the map via its ID
        var tempFeature = droneSource.getFeatureById(vehicle.Id); //Replace vehicle.Id with vehicle.CallSign or something else more unique
        //If it already exists, update the feature's geometry with the new location
        if (tempFeature != null) {
            tempFeature.setGeometry(new ol.geom.Point(ol.proj.transform([vehicle.Longitude, vehicle.Latitude], 'EPSG:4326', 'EPSG:3857')));
        } else {
            //Otherwise, create a new feature with a CallSign and droneStyle and add it to the source
            var newFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([vehicle.Longitude, vehicle.Latitude], 'EPSG:4326', 'EPSG:3857')),
                name: 'Test'
            });
            newFeature.setId(vehicle.Id);
            newFeature.setStyle(droneStyle);
            droneLayer.getSource().addFeature(newFeature);
            console.log("New drone created")
        }

        //console.log("The number of features is now: " + droneLayer.getSource().getFeatures().length);
    }

});
