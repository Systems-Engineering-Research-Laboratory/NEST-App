/*Build each command type with the necessary data here and send it to the controller*/
/*User input is gathered and defined here, where required; the controller should just be in charge of data*/
var uavCommands = {

    /**********NAVIGATIONAL COMMANDS**********/

    //Return to base
    BackToBase: function (uav, coords) {
        $.ajax({
            type: "POST",
            url: "/api/command/return/" + uid,
            data: {
                Latitude: coords.lat(),
                Longitude: coords.lng(),
                UAVId: uad.Id,
            },
            success: function (data, textStatus, jqXHR) {
                vehicleHub.server.returnCommand(data);
            }
        });
        //clear all waypoints
        //change mission phase to "returning"
        //set new waypoint for base
    },

    //Hold position
    HoldPos: function (uid, uav, coords, alt, throttle) {
        var time = 0 /*= user input*/;
        $.ajax({
            type: "POST",
            url: "/api/command/hold/" + uid,
            data: {
                
                Altitude: alt,
                Latitude: coords.lat(),
                Longitude: coords.lng(),
                UAVId: uav.Id,
                Time: time
            },
            success: function (data, textStatus, jqXHR) {
                vehicleHub.server.holdCommand(data);
                //locate uav by uav.id
                //push values returned by data
                ////wait for ack
                //if (ack) {
                //    put ack success in cmd entity
                //}
                //else {
                //    notify user that no ack was recieved
                //}
            }
        });

        //set mission phase to "holding"
        if (time == null) {
            //get and store current mission phase
            //wait until Resume()s
        }
        else {
            //wait for "time" seconds
            /*pseudocode
            ajax call to make UAV wait
            while (check time difference){  }
            this.Resume(uav);
            */
        }
        //does it resume previous path/mission or does it need a new mission?
    },

    //Resume from Hold()
    Resume: function(uav){
        //ajax call to resume
        //set mission phase to stored phase
    },

    //Immediately force a landing
    ForceLand: function (uid, uav, coords, alt, throttle) {
        $.ajax({
            type: "POST",
            url: "/api/command/land/" + uid,
            data: {
                Altitude: alt,
                Latitude: coords.lat(),
                Longitude: coords.lng(),
                Throttle: throttle,
                UAVId: uad.Id
            },
            success: function (data, textStatus, jqXHR) {
                vehicleHub.server.landCommand(data);
            }
        });
        //specify a location to land, maybe by click?
        //set mission phase to "landing"
        //ajax call to force land
        //force landing should always be followed by a return to base if the uav is not collected manually
    },

    //Insert a waypoint
    InsertWP: function (uav, coords) {
        //possibly handled elsewhere
        //specify where on the waypoint path the point is inserted
    },

    //Send UAV to these coordinates
    GoTo: function (uid, uav, coords, alt) {
        $.ajax({
            type: "POST",
            url: "/api/command/goto/"+uid,
            data: {
                Altitude: alt,
                Latitude: coords.lat(),
                Longitude: coords.lng(),
                UAVId: uav.Id
            },
            success: function (data, textStatus, jqXHR) {
                vehicleHub.server.gotoCommand(data);
            }
        });
    },

    //Pass direct control to a pilot
    SurrenderControl: function (uid, uav, alt, throttle) {
        $.ajax({
            type: "POST",
            url: "/api/command/pass/" + uid,
            data: {
                
                Altitude: alt,
                Throttle: throttle,
                UAVId: uav.Id
            }
        });

    },


    /*****NON-NAVIGATIONAL COMMAND*****/
    NonNav: function (uid, uav, coords, alt, throttle) {
        $.ajax({
            type: "POST",
            url: "/api/command/adjust/" + uid,
            data: {
                Altitude: alt,
                Latitude: coords.lat(),
                Longitude: coords.lng(),
                Throttle: throttle,
                UAVId: uad.Id
            },
            success: function (data, textStatus, jqXHR) {
                vehicleHub.server.adjustCommand(data);
            }
        });
        //adjust parameters
    },
};