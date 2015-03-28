
$(document).ready(function () {

    var assign_table = document.getElementById('assigned');
    var unassign_table = document.getElementById('unassigned');
    var operator_table = document.getElementById('op');
    var emitHub = $.connection.eventLogHub;

    for (var i = assign_table.rows.length; i > 1; i--) {
        var assign_id = assign_table.rows[i - 1].cells[1].innerText;
        if (assign_table.rows[i - 1].cells[2].innerHTML == "") {
            console.log(i + " unassigned");
            document.getElementById('assigned').deleteRow(i - 1);
        }
    }

    for (var i = unassign_table.rows.length; i > 1; i--) {
        var assign_id = unassign_table.rows[i - 1].cells[1].innerText;
        if (unassign_table.rows[i - 1].cells[2].innerHTML != "") {
            console.log(i + " assigned");
            document.getElementById('unassigned').deleteRow(i - 1);
        }
    }

    for (var i = operator_table.rows.length; i > 1; i--) {
        var assign_id = operator_table.rows[i - 1].cells[1].innerText;
        if (operator_table.rows[i - 1].cells[2].innerHTML != "") {
            console.log(i + " operator");
            document.getElementById('operator')
        }
    }


    emitHub.client.newEvent = function (evt) {

        console.log(evt);

        var checkMessage = evt.message.split(" ");
        if (checkMessage[0] != "Acknowledged:") {

            console.log(evt);

            evt_id = evt.uav_id;
            evt_operator = evt.operator_screen_name;
            evt_date = evt.create_date;
            evt_msg = evt.message;
            evt_level = evt.criticality;


            if (current_id == uavs[evt.uav_id].Id) {

                document.getElementById('eventlog_td1').innerHTML = evt.uav_id;
                document.getElementById('eventlog_td2').innerHTML = evt.operator_screen_name;
                document.getElementById('eventlog_td3').innerHTML = evt.create_date;
                document.getElementById('eventlog_td4').innerHTML = evt.message;
                document.getElementById('eventlog_td5').innerHTML = evt.criticality;
            }

            else if (current_id != uavs[evt.uav_id].Id) {
                document.getElementById('eventlog_td1').innerHTML = "NO";
                document.getElementById('eventlog_td2').innerHTML = "EVENT";
                document.getElementById('eventlog_td3').innerHTML = "FOR";
                document.getElementById('eventlog_td4').innerHTML = "UAV";
                document.getElementById('eventlog_td5').innerHTML = evt.uav_callsign;
            }

            $.connection.hub.start().done(function () {
                console.log("connection started for evt log");
            });
        }
    };
})
 