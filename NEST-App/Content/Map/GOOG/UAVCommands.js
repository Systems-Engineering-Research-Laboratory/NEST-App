/*Build each command type with the necessary data here and send it to the controller*/
/*User input is gathered and defined here, where required; the controller should just be in charge of data*/
var uavCommands = {
     cmdID: null,

    /**********NAVIGATIONAL COMMANDS**********/

    //Return to base
     BackToBase: function (uid, uav, coords, ids) {
         for (var i = 0; i < ids.length; i++) {
             var cmd = {
                 Latitude: coords.lat(),
                 Longitude: coords.lng(),
                 UAVId: ids[i],
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
         }
    },

    //Hold position
    HoldPos: function (uid, uav, coords, alt, throttle, time, ids) {
        //var time = 0 /*= user input*/;
        for (var i = 0; i < ids.length; i++) {
            var cmd = {
                Altitude: alt,
                Latitude: coords.lat(),
                Longitude: coords.lng(),
                UAVId: ids[i],
                Time: time,
                Throttle: throttle
            };
            $.ajax({
                type: "POST",
                url: "/api/command/hold/" + uid,
                data: cmd,
                success: function (data, textStatus, jqXHR) {
                    cmdID = vehicleHub.server.holdCommand(cmd);
                }
            });
        }
        //set mission phase to "holding"
        //if (time == null) {
        //    //get and store current mission phase
        //    //wait until Resume()s
        //}
        //else {
        //    //wait for "time" seconds
        //    /*pseudocode
        //    ajax call to make UAV wait
        //    while (check time difference){  }
        //    this.Resume(uav);
        //    */
        //}
    },

    //Resume from Hold()
    Resume: function(uav){
        //ajax call to resume
        //set mission phase to stored phase
    },

    //Immediately force a landing
    ForceLand: function (uid, uav, coords, alt, throttle, ids) {
        for (var i = 0; i < ids.length; i++) {
            var cmd = {
                Id: 0,
                Altitude: alt,
                Latitude: coords.lat(),
                Longitude: coords.lng(),
                Throttle: throttle,
                UAVId: ids[i]
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
        }
    },

    //Insert a waypoint
    InsertWP: function (uav, coords) {
        //possibly handled elsewhere
        //specify where on the waypoint path the point is inserted
    },

    //Send UAV to these coordinates
    GoTo: function (uid, uav, coords, alt, ids) {
        for (var i = 0; i < ids.length; i++) {
            var cmd = {
                Id: 0,
                Altitude: alt,
                Latitude: coords.lat(),
                Longitude: coords.lng(),
                UAVId: ids[i]
            }
            $.ajax({
                type: "POST",
                url: "/api/command/goto/" + uid,
                data: cmd,
                success: function (data, textStatus, jqXHR) {
                    cmdID = vehicleHub.server.gotoCommand(cmd);
                }
            });
        }
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
    NonNav: function (uid, uav, coords, alt, throttle, ids) {
        for (var i = 0; i < ids.length; i++) {
            var cmd = {
                Id: 0,
                Altitude: alt,
                Latitude: coords.lat(),
                Longitude: coords.lng(),
                Throttle: throttle,
                UAVId: ids[i]
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
        }
    },
};