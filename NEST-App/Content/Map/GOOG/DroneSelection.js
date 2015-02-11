/*CTRL-SELECT*/
function CtrlSelect(marker, selectedDrones) {
    marker.setIcon(mapStyles.uavSymbolGreen);
    marker.flightToggle = true;
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
    // set selected trail
    for (var i = 0; i < uavTrails.length; i++) {
        if (uavTrails[i].id == selectedUAV.Id) {
            selectedTrail = uavTrails[i].trail;
        }
    }
    // draw entire trail when clicked
    if (selectedTrail != undefined) {
        for (var i = 0; i < (selectedTrail.length - 1) ; i++) {
            selectedTrail[i].setMap(map);
        }
    }
    console.log("Number of drones selected: " + selectedDrones.length);

    // enable waypoint buttons
    $("#goBtn").removeClass("disabled");
    $("#clickToGoBtn").removeClass("disabled");

}


    function KeyBinding(selectedDrones, storedGroups, evt){
        //if shift + (0 through 9) is pressed, all selected drones will be bound to that number
        if (evt.shiftKey && ((evt.which >= 48) && (evt.which <= 57))) {
            storedGroups[evt.which] = selectedDrones;
            //console.log("Number of selected drones: " + selectedDrones.length);
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
                        //selectedDrones[i].marker.setIcon(uavIconGreen);
                    }
                }
            }
            console.log("Number of selected drones: " + selectedDrones.length);
        }
    }