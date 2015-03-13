
$(document).ready(function () {

    var assign_table = document.getElementById('assigned');
    var unassign_table = document.getElementById('unassigned');
    var curr_emergen = document.getElementById('curr_emergen');

    for (var i = assign_table.rows.length; i > 0; i--) {
        var assign_id = assign_table.rows[i - 1].cells[1].innerText;
        if (assign_table.rows[i - 1].cells[2].innerHTML == "") {
            console.log(i + " unassigned");
            document.getElementById('assigned').deleteRow(i - 1);
        }
    }

    for (var i = unassign_table.rows.length; i > 0; i--) {
        var assign_id = unassign_table.rows[i - 1].cells[1].innerText;
        if (unassign_table.rows[i - 1].cells[2].innerHTML != "") {
            console.log(i + " assigned");
            document.getElementById('unassigned').deleteRow(i - 1);
        }
    }

})
