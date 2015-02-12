var droneSelection = {
    /*CTRL-SELECT*/
    CtrlSelect: function (marker, selectedDrones) {
        if (marker.icon.fillColor == 'green') {
            marker.setIcon(mapStyles.uavSymbolBlack);
            marker.setMap(marker.map);
            //TODO: deselect and remove from selectedDrone (tricky because it's an array)
        }
        else {
            marker.setIcon(mapStyles.uavSymbolGreen);//other drone-selection-related events should trigger off this!
            selectedUAV = marker.uav;
            if (ctrlDown) {//Check if ctrl is held when a drone is selected; if so, ignore immediate key repeats and proceed
                ctrlDown = false
                selectedDrones.push(selectedUAV);
            }
            else {//otherwise, empty the selectedDrones list and add the drone to the empty list
                //console.log("hit else");
                while (selectedDrones.length > 0) {//clear the selected drone list
                    selectedDrones.pop();
                }
                selectedDrones.push(selectedUAV);
            }
            console.log("Number of drones selected: " + selectedDrones.length);

            // enable waypoint buttons
            $("#goBtn").removeClass("disabled");
            $("#clickToGoBtn").removeClass("disabled");
        }
    },

    //This fires when a drone turns green or black, ie it has either been selected or de-selected
    SelectionStateChanged: function (marker, selectedDrones, selectedUAV, flightLines, uavTrails, selectedTrail) {
        //console.log("Selection change event fired");

        //*******************SELECTED*********************//
        if (marker.icon.fillColor == 'green') {
            
            selectedUAV = marker.uav;
            console.log(selectedUAV);
            //Refresh current flightpath and display it
            flightLines[marker.uav.Id] = new google.maps.Polyline({
                path: [marker.uav.Position, marker.uav.Destination],
                geodesic: true,
                strokeColor: 'blue',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            flightLines[marker.uav.Id].setMap(marker.map);

            //TODO: ADJUST TRAIL TOGGLE SO IT FITS THE NEW SELECTION PARADIGM
            //NOTE: Maybe outsource it to a DroneTrails.js function?
            // set selected trail
            for (var i = 0; i < uavTrails.length; i++) {
                if (uavTrails[i].id == selectedUAV.Id) {
                    selectedTrail = uavTrails[i].trail;
                }
            }

            // draw entire trail when clicked
            if (selectedTrail != undefined) {
                for (var i = 0; i < (selectedTrail.length - 1) ; i++) {
                    selectedTrail[i].setMap(marker.map);
                }
            }
        }
            //******************DE-SELECTED*******************//
        else if (marker.icon.fillColor == 'black') {
            console.log("UAV De-selected");

            //Turn off drone's flightpath
            flightLines[marker.uav.Id].setMap(null);

            //TURN OFF TRAIL 
            droneTrails.deleteTrails(selectedUAV.Id);
        }
            //**************DANGER****************//
        else if (marker.icon.fillColor == 'red') {//"RED FOR DANGER"......placeholder in case we decide to do this
            //otherstuff
        }
    },

    KeyBinding: function (selectedDrones, storedGroups, evt) {
        //if shift + (0 through 9) is pressed, all selected drones will be bound to that number
        if (evt.shiftKey && ((evt.which >= 48) && (evt.which <= 57))) {
            storedGroups[evt.which] = selectedDrones;
        }
        //if 0 through 9 is pressed, it restores that list of selected drones and turns them green
        if ((evt.which >= 48) && (evt.which <= 57)) {
            while (selectedDrones.length > 0) {//clear the selected drone list
                selectedDrones.pop();
            }
            if (storedGroups[evt.which] != null) {
                selectedDrones.push(storedGroups[evt.which]);
                if (selectedDrones.length != 0) {
                    var i;
                    for (i = 0; i < selectedDrones.length; i++) {
                        //selectedDrones[i].marker.setIcon(mapStyles.uavIconGreen);
                    }
                }
            }
            console.log("Number of selected drones: " + selectedDrones.length);
        }
    },

    AreaSelect: function (map, e, mouseIsDown, shiftPressed, gridBoundingBox, selectedDrones, uavs) {
        if (mouseIsDown && (shiftPressed || gridBoundingBox != null)) {
            mouseIsDown = 0;
            if (gridBoundingBox !== null) {
                while (selectedDrones.length > 0) {//clear the selected drone list
                    selectedDrones.pop();
                }
                var boundsSelectionArea = new google.maps.LatLngBounds(gridBoundingBox.getBounds().getSouthWest(), gridBoundingBox.getBounds().getNorthEast());
                for (var key in uavs) {
                    if (gridBoundingBox.getBounds().contains(uavs[key].marker.getPosition())) {
                        //selected = true; //Possibly deprecated since updating the selection paradigm
                        uavs[key].marker.setIcon(mapStyles.uavSymbolGreen);
                        selectedDrones.push(uavs[key]);//push the selected markers to an array
                        console.log("Number of selected drones: " + selectedDrones.length);
                    } else {
                        //selected = false; //Possibly deprecated since updating the selection paradigm
                        uavs[key].marker.setIcon(mapStyles.uavSymbolBlack);
                        console.log("Number of selected drones: " + selectedDrones.length);
                    }
                }
                gridBoundingBox.setMap(null);
            }
            gridBoundingBox = null;
        }
        //mapListeners -> map
        map.setOptions({
            draggable: true
        });
    }
};