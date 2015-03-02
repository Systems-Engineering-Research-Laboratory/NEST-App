
assignment = {
    init: function () {
        var $this = this;
        $(document).ready(function () {
            var userJson = $('#current_user').html();
            $this.user = JSON.parse(userJson);

            var assgnJson = $('#assignment_array').html();
            $this.assignments = JSON.parse(assgnJson);

            $this.ready = true;

            console.log($this);
        });

        this.isUavAssignedToUser = function (uavId) {
            return this.assignments.indexOf(uavId) != -1;
        }
    }


}
assignment.init();