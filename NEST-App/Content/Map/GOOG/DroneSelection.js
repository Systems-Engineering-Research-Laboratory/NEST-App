﻿var droneSelection = {
    /*CTRL-SELECT*/
    CtrlSelect: function (marker, selectedDrones) {
        selectedUAV = null;
        //console.log("Selected is: " + selectedUAV);
        clickedUAV = marker.uav;
        //UAV has been selected
        if (marker.selected == false) {//other drone-selection-related events should trigger off this!
            marker.selected = true;
            marker.setIcon(clickedUAV.marker.uavSymbolGreen);
            marker.setMap(marker.map);
            selectedUAV = marker.uav;           
            //console.log("fired true");
        }
        //UAV has been de-selected
        else {
            marker.selected = false;//other drone-selection-related events should trigger off this!
            marker.setIcon(clickedUAV.marker.uavSymbolBlack);
            marker.setMap(marker.map);
            //console.log("fired false");
        }

        //Let the selection state change listener know that the state has changed
        google.maps.event.trigger(marker, 'selection_changed');

        if (ctrlDown) {//Check if ctrl is held when a drone is selected; if so, ignore immediate key repeats and proceed
            console.log(selectedUAV);
            if (selectedUAV != null) {
                selectedDrones.push(selectedUAV);
            }
            ctrlDown = false;
            //console.log("Ctrl is pressed");
            /*else {
                //TODO: remove from selectedDrones (tricky because it's an array) 
            }*/
        }
        else {//otherwise, empty the selectedDrones list and add the drone to the empty list
            ctrlDown = false;
            while (selectedDrones.length > 0) {//clear the selected drone list
                
                var c = selectedDrones.length - 1;
                //console.log("selecteddrone length (pre) is: " + selectedDrones.length);
                //console.log("Selecteddrone (pre) is: " + selectedDrones[c]);
                selectedDrones[c].marker.setIcon(selectedDrones[c].marker.uavSymbolBlack);
                selectedDrones[c].marker.selected = false;
                google.maps.event.trigger(selectedDrones[c].marker, 'selection_changed');
                selectedDrones.pop();

            }
            if (selectedUAV != null) {
                //console.log("Selected is now: " + selectedUAV);
                //console.log("uav pushed");
                selectedDrones.push(selectedUAV);
            }
        }
        //console.log("Number of drones selected: " + selectedDrones.length);
        // enable waypoint buttons
        $("#goBtn").removeClass("disabled");
        $("#clickToGoBtn").removeClass("disabled");
        //console.log("Currently selected drones array is of length: " + selectedDrones.length);
        //console.log("Currently selected drones are: " + selectedDrones);
    },

    //This fires when a drone turns green or black, ie it has either been selected or de-selected
    //SelectionStateChanged: function (marker, selectedDrones, flightLines, uavTrails, selectedTrail) {
    //take out some unused variables -david
    SelectionStateChanged: function (marker, selectedDrones) {
        vehicleHub.server.notifySelected(marker.uav.Id, marker.selected, assignment.getUserId());
        //console.log("Selection change event fired");

        //*******************SELECTED*********************//
        if (marker.selected == true) {
            selectedUAV = marker.uav;
            var uavItem = mapFunctions.BuildUavListItem(marker.uav.Id);
            document.getElementById("uavList").appendChild(uavItem);

            //console.log(selectedUAV);
            ////Refresh current flightpath and display it
            //flightLines[marker.uav.Id] = new google.maps.Polyline({
            //    path: [marker.uav.Position, marker.uav.Destination],
            //    geodesic: true,
            //    strokeColor: 'blue',
            //    strokeOpacity: 1.0,
            //    strokeWeight: 2
            //});
            //flightLines[marker.uav.Id].setMap(marker.map);

            //TODO: ADJUST TRAIL TOGGLE SO IT FITS THE NEW SELECTION PARADIGM
            //NOTE: Maybe outsource it to a DroneTrails.js function?
            // set selected trail
            // remove trail functions entirely -david
            //for (var i = 0; i < uavTrails.length; i++) {
            //    if (uavTrails[i].id == selectedUAV.Id) {
            //        selectedTrail = uavTrails[i].trail;
            //    }
            //}

            //// draw entire trail when clicked
            //if (selectedTrail != undefined) {
            //    for (var i = 0; i < (selectedTrail.length - 1) ; i++) {
            //        selectedTrail[i].setMap(marker.map);
            //    }
            //}
            
        }
            //******************DE-SELECTED*******************//
        else if (marker.selected == false) {
            var uavItem = document.getElementById(marker.uav.Callsign);
            $('#' + marker.uav.Callsign).remove();

            //turn off battery indicator
            if (batteryCalc.circle != null) {
                batteryCalc.circle.setVisible(false);
                batteryCalc.circle = null;
            }

            //Turn off drone's flightpath
            //flightLines[marker.uav.Id].setMap(null);


            
            //TURN OFF TRAIL 
            //droneTrails.deleteTrails(selectedUAV.Id);
        }

        // toggle goWaypoint buttons
        this.WaypointBtnToggle(marker.selected, selectedUAV);

            //**************DANGER****************//
        /*else if (marker.icon.fillColor == 'red') {//"RED FOR DANGER"......placeholder in case we decide to do this
            //otherstuff
        }*/
    },

    WaypointBtnToggle: function (selected, uav) {
        if (selected == true) {
            $("#UAVId").html("UAV: " + uav.Callsign);
            $("#goBtn").removeClass("disabled");
            $("#clickToGoBtn").removeClass("disabled");
        }
        else if (selected == false) {
            $("#UAVId").html("Select an UAV first");
            $("#goBtn").addClass("disabled");
            $("#clickToGoBtn").addClass("disabled");
        }
    },

    KeyBinding: function (selectedDrones, storedGroups, evt) {
        //console.log("length in function is: " + selectedDrones.length);
        //if shift + (0 through 9) is pressed, all selected drones will be bound to that number
        if (evt.shiftKey && ((evt.which >= 48) && (evt.which <= 57))) {
            storedGroups[evt.which] = selectedDrones;

            console.log("selected is: " + selectedDrones[0]);
            console.log("selected " + selectedDrones[0].marker);
        }
        //if 0 through 9 is pressed, it restores that list of selected drones and turns them green
        else if ((evt.which >= 48) && (evt.which <= 57)) {
            while (selectedDrones.length > 0) {//clear the selected drone list
                selectedDrones.pop();
            }
            if (storedGroups[evt.which] != null) {
                selectedDrones.push(storedGroups[evt.which]);
                if (selectedDrones.length != 0) {
                    var i;
                    for (i = 0; i < selectedDrones.length; i++) {
                        //selectedDrones[i].setIcon(selectedDrones[i].uavIconGreen);
                    }
                }
            }
            //console.log("Number of selected drones: " + selectedDrones.length);
        }
        return storedGroups;
    },

    AreaSelect: function (theMap, e, mouseIsDown, shiftPressed, gridBoundingBox, selectedDrones, uavs) {
        //console.log("mouseIsDown: " + mouseIsDown);
        //console.log("shiftPressed: " + shiftPressed);
        //console.log("gridBoundingBox: " + gridBoundingBox);
        if (mouseIsDown && (shiftPressed || gridBoundingBox != null)) {
            //console.log("AreaSelect check fired");
            mouseIsDown = false;
            if (gridBoundingBox !== null) {
                var ulist = document.getElementById("uavList");
                while (ulist.firstChild) {
                    ulist.removeChild(ulist.firstChild);
                }
                while (selectedDrones.length > 0) {//clear the selected drone list
                    selectedDrones.pop();
                }
                var boundsSelectionArea = new google.maps.LatLngBounds(gridBoundingBox.getBounds().getSouthWest(), gridBoundingBox.getBounds().getNorthEast());
                for (var key in uavs) {
                    if (gridBoundingBox.getBounds().contains(uavs[key].marker.getPosition())) {
                        uavs[key].marker.selected = true; //Possibly deprecated since updating the selection paradigm
                        uavs[key].marker.setIcon(uavs[key].marker.uavSymbolGreen);
                        selectedDrones.push(uavs[key]);//push the selected markers to an array
                        console.log("Number of selected drones: " + selectedDrones.length);
                    } else {
                        uavs[key].marker.selected = false; //Possibly deprecated since updating the selection paradigm
                        uavs[key].marker.setIcon(uavs[key].marker.uavSymbolBlack);
                        console.log("Number of selected drones: " + selectedDrones.length);
                    }
                    google.maps.event.trigger(uavs[key].marker, 'selection_changed');
                }
                gridBoundingBox.setMap(null);
            }
            //console.log("BOunding box set to null");
            mapFunctions.ResetBoundingBox();
        }
        //mapFunctions.shiftPressed = false;
        //mapListeners -> map
        theMap.setOptions({
            draggable: true
        });
        mapFunctions.ResetMouseDown();
    }
};