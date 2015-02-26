/*Build each command type with the necessary data here and send it to the controller*/
/*User input is gathered and defined here, where required; the controller should just be in charge of data*/
var uavCommands = {

    /**********NAVIGATIONAL COMMANDS**********/

    //Return to base
    BackToBase: function (uav, coords) {
        //clear all waypoints
        //change mission phase to "returning"
        //set new waypoint for base
    },

    //Hold position
    HoldPos: function (uav, coords) {
        var time /*= user input*/;
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
    ForceLand: function (uav, coords) {
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
    GoTo: function (uav, coords) {
        
    },

    //Pass direct control to a pilot
    SurrenderControl: function (uav){

    },


    /*****NON-NAVIGATIONAL COMMAND*****/
    NonNav: function (uav) {
        //adjust parameters
    },
};