/*Build each command type with the necessary data here and send it to the controller*/
/*User input is gathered and defined here, where required; the controller should just be in charge of data*/
var uavCommands = {
 

    //TODO*********FIgure out how to handle ID

    /**********NAVIGATIONAL COMMANDS**********/

    //Return to base
    BackToBase: function (uav, coords) {
        var cmd = {
            Id: 0,
            Latitude: coords.Latitude,
            Longitude: coords.Longitude,
            UAVId: uad.Id,
        }
        $.ajax({
            type: "POST",
            url: "/api/command/return/" + uid,
            data: cmd,
        });
        //clear all waypoints
        //change mission phase to "returning"
        //set new waypoint for base
    },

    //Hold position
    HoldPos: function (uid, uav, coords, alt, throttle, time) {
        var time /*= user input*/;
        var cmd = {
            Id: 0,
            Altitude: altitude,
            Latitude: coords.Latitude,
            Longitude: coords.Longitude,
            UAVId: uad.Id,
            Time: time
        }
        $.ajax({
            type: "POST",
            url: "/api/command/hold/" + uid,
            data: cmd,
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
            Altitude: altitude,
            Latitude: coords.Latitude,
            Longitude: coords.Longitude,
            Throttle: throttle,
            UAVId: uad.Id
        }
        $.ajax({
            type: "POST",
            url: "/api/command/land/" + uid,
            data: cmd,
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
            Latitude: coords.Latitude,
            Longitude: coords.Longitude,
            UAVId: uav.Id
        };
        $.ajax({
            type: "POST",
            url: "/api/command/goto/"+uid,
            data: cmd,
        });
    },

    //Pass direct control to a pilot
    SurrenderControl: function (uid, uav, alt, throttle) {
        var cmd = {
            Id: 0,
            Altitude: alt,
            Throttle: throttle,
            UAVId: uav.Id
        }
        $.ajax({
            type: "POST",
            url: "/api/command/goto/" + uid,
            data: cmd,
        });

    },


    /*****NON-NAVIGATIONAL COMMAND*****/
    NonNav: function (uid, uav, coords, alt, throttle) {
        var cmd = {
            Id: 0,
            Altitude: altitude,
            Latitude: coords.Latitude,
            Longitude: coords.Longitude,
            Throttle: throttle,
            UAVId: uad.Id
        }
        //adjust parameters
    },
};