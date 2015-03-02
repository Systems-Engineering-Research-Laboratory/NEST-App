
//Object that stores the current user that is signed in and the Ids of the uavs that they are assigned to.
assignment = {
    //Just do the init because the object's properties are invalid until the dom is loaded and read.
    init: function () {
        var $this = this;
        $(document).ready(function () {
            //This stores the username and user_id as one object/
            var userJson = $('#current_user').html();
            $this.user = JSON.parse(userJson);
            
            //The array of Uav assignments
            var assgnJson = $('#assignment_array').html();
            $this.assignments = JSON.parse(assgnJson);

            //Not sure if this is needed
            $this.ready = true;
        });

        //Checks if the user is assigned to this uav
        this.isUavAssignedToUser = function (uavId) {
            return this.assignments.indexOf(uavId) != -1;
        }

        //Gets the username, string
        this.getUsername = function () {
            return this.user.username;
        },

        //Gets the user id, int
        this.getUserId = function () {
            return this.user.user_id;
        }

        //An array of UavId integers that this user is assigned to
        this.getListOfAssignedUavs = function () {
            return this.assignments;
        }
    },
}
//Start it up
assignment.init();