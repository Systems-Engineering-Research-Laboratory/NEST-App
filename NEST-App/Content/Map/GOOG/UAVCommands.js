/*Build each command type with the necessary data here and send it to the controller*/
/*User input is gathered and defined here, where required; the controller should just be in charge of data*/
var uavCommands = {
     cmdID: null,

    /**********NAVIGATIONAL COMMANDS**********/

    //Return to base
     BackToBase: function (uid, uav, coords) {
         var cmd = {
             Latitude: coords.lat(),
             Longitude: coords.lng(),
             UAVId: uav.Id,
         };
        $.ajax({
            type: "POST",
            url: "/api/command/return/" + uid,
            data: cmd,
            success: function (data, textStatus, jqXHR) {
                cmdID = vehicleHub.server.returnCommand(cmd);
            }
        });


        //$.ajax({
        //    type: "PUT",
        //    url: "/api/command/"
        //})
        //clear all waypoints
        //change mission phase to "returning"
        //set new waypoint for base
    },

    //Hold position
    HoldPos: function (uid, uav, coords, alt, throttle, time) {
        //var time = 0 /*= user input*/;
        var cmd = {
            Altitude: alt,
            Latitude: coords.lat(),
            Longitude: coords.lng(),
            UAVId: uav.Id,
            Time: time,
            Throttle: throttle
        };
        $.ajax({
            type: "POST",
            url: "/api/command/hold/" + uid,
            data: cmd,
            success: function (data, textStatus, jqXHR) {
                cmdID = vehicleHub.server.holdCommand(cmd);
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
        var cmd = {
            Id: 0,
            Altitude: alt,
            Latitude: coords.lat(),
            Longitude: coords.lng(),
            Throttle: throttle,
            UAVId: uav.Id
        };
        $.ajax({
            type: "POST",
            url: "/api/command/land/" + uid,
            data: cmd,
            success: function (data, textStatus, jqXHR) {
                cmdID = vehicleHub.server.landCommand(cmd);
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
        var cmd = {
            Id: 0,
            Altitude: alt,
            Latitude: coords.lat(),
            Longitude: coords.lng(),
            UAVId: uav.Id
        }
        $.ajax({
            type: "POST",
            url: "/api/command/goto/"+uid,
            data: cmd,
            success: function (data, textStatus, jqXHR) {
                cmdID = vehicleHub.server.gotoCommand(cmd);
            }
        });
    },

    //Pass direct control to a pilot
    SurrenderControl: function (uid, uav, alt, throttle) {
        var cmd = {
            Id: 0,
            Altitude: alt,
            Throttle: throttle,
            UAVId: uav.Id
        };
        $.ajax({
            type: "POST",
            url: "/api/command/pass/" + uid,
            data: cmd
        });

    },


    /*****NON-NAVIGATIONAL COMMAND*****/
    NonNav: function (uid, uav, coords, alt, throttle) {
        cmd = {
            Id: 0,
            Altitude: alt,
            Latitude: coords.lat(),
            Longitude: coords.lng(),
            Throttle: throttle,
            UAVId: uav.Id
        };
        $.ajax({
            type: "POST",
            url: "/api/command/adjust/" + uid,
            data: cmd,
            success: function (data, textStatus, jqXHR) {
                cmdID = vehicleHub.server.adjustCommand(cmd);
            }
        });
        //adjust parameters
    },
};