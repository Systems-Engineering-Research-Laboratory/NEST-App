var selecteduav_array = [];
var selecteduav_callsign_array = [];


var managerFunctions = {
    selected_uav: function () {
        var unassigned_table = document.getElementById("unassigned");
        var checked_uav = document.getElementById("checked_uav");

        if (unassigned_table != null) {
            for (var i = 1; i < unassigned_table.rows.length; i++) {
                for (var j = 0; j < unassigned_table.rows[i].cells.length; j++) {
                    unassigned_table.rows[i].onclick = function () {
                        this.bgColor = "#AABBCC";
                        var uavid = this.cells[0];
                        var callsign = this.cells[1];
                        var uavid_html = uavid.innerHTML;
                        var callsign_html = callsign.innerHTML;

                        selecteduav_array.push(uavid_html);
                        selecteduav_callsign_array.push(callsign_html);
                        
                        for (var l = 0; l < (selecteduav_array.length - 1) ; l++)
                        {
                            if (selecteduav_array[l] === uavid_html)
                            {
                                selecteduav_array.splice((selecteduav_array.length - 1), 1);
                                selecteduav_callsign_array.splice((selecteduav_callsign_array.length - 1), 1);
                                var index = selecteduav_array.indexOf(uavid_html);
                                var index_callsign = selecteduav_callsign_array.indexOf(callsign_html);
                                selecteduav_array.splice(index, 1);
                                selecteduav_callsign_array.splice(index_callsign, 1);
                                this.bgColor = "white";
                            }

                            else {
                                this.bgColor = "#AABBCC";
                            }
                        }
                    }
                }
            }
        }
    },

    assignTo: function () {
        var unassigned_table = document.getElementById("unassigned");
        var drop_down = document.getElementById("drop_down");
        var operator_table = document.getElementById("op");
        var drop_down_choice = drop_down.value;
        var selected_userid;
        var selected_name;
        
        for (var i = 1; i < operator_table.rows.length; i++)
        {
            for (var j = 0; j < operator_table.rows[i].cells.length; j++) 
            {
                var operator_id = operator_table.rows[i].cells[0].innerHTML;
                var operator_name = operator_table.rows[i].cells[1].innerHTML;

                if (drop_down_choice == operator_name)
                {
                    selected_userid = operator_id;
                    selected_name = operator_name;
                }
            }
        }
        
        if ((drop_down_choice != "choose_operator") && (selecteduav_array.length != 0)) {

            for (var i = 1; i < unassigned_table.rows.length; i++) {
                for (var j = 0; j < unassigned_table.rows[i].cells.length; j++) {
                    for (var k = 0; k < selecteduav_array.length; k++) {
                        if (selecteduav_array[k] == unassigned_table.rows[i].cells[0].innerHTML) {
                            unassigned_table.deleteRow(i);
                            console.log("Removed row # " + i + ": UAV ID " + selecteduav_array[k] + ", CALLSIGN: " + selecteduav_callsign_array[k]);

                            assigned_table = document.getElementById("assigned");
                            var row = assigned_table.insertRow(assigned_table.rows.length);
                            var cell0 = row.insertCell(0);
                            var cell1 = row.insertCell(1);
                            var cell2 = row.insertCell(2);
                            var cell3 = row.insertCell(3);

                            cell0.innerHTML = selecteduav_array[k];
                            cell1.innerHTML = selecteduav_callsign_array[k];
                            cell2.innerHTML = selected_userid;
                            cell3.innerHTML = selected_name;

                            for (var i = 0; i < selecteduav_array.length; i++) {
                                $.ajax({
                                    method: 'POST',
                                    url: '/api/uavs/assignexistinguav?uavid='+ selecteduav_array[k],
                                    data: User_user_id = selected_userid,
                                    success: function () {
                                        console.log("success");
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }

        else if (drop_down_choice === "choose_operator") {
            alert("Please choose an operator to assign UAVs.");
        }

        else if (selecteduav_array.length == 0) {
            alert("Please choose at least one or more UAVs.");
        }
    }
}