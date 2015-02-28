$(document).ready(function () {
    var mapOptions = {
        zoom: 17,
        center: new google.maps.LatLng(34.2417, -118.529),
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDoubleClickZoom: true,
        draggable: false
    }
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var uavSymbolBlack = {
        path: 'M 355.5,212.5 513,312.25 486.156,345.5 404.75,315.5 355.5,329.5 308.25,315.5 224.75,345.5 197.75,313 z',
        fillColor: 'black',
        fillOpacity: 0.8,
        scale: 0.2,
        zIndex: 1,
        anchor: new google.maps.Point(355, 295)
    };

    var table = document.getElementById("UAV_table");
    if (table != null) {
        for (var i = 1; i < table.rows.length; i++) {
            for (var j = 0; j < table.rows[i].cells.length; j++) {
                table.rows[i].onclick = function () {
                    var callsign = this.cells[0];
                    var numDelivery = this.cells[1];
                    var mile = this.cells[2];
                    var battery = this.cells[3];
                    var ETA = this.cells[4];
                    var STA = this.cells[5];
                    var route = this.cells[6];
                    var availability = this.cells[7];
                    var confiugration = this.cells[8];
                    var current_lat = this.cells[9];
                    var current_long = this.cells[10];
                    var current_alt = this.cells[11];
                    var dest_lat = this.cells[12];
                    var dest_long = this.cells[13];
                    var total_delivery = this.cells[14];
                    var payload = this.cells[15];
                    var uavid = this.cells[16];
                    var cost = this.cells[17];
                    var uav_lat_long = new google.maps.LatLng(this.cells[9].innerHTML, this.cells[10].innerHTML);

                    document.getElementById("detail_title").innerHTML = 'UAV #' + uavid.innerHTML + '(' + callsign.innerHTML + ') Detail';
                    document.getElementById("numdeliveries").innerHTML = 'Current Delivery: ' + numDelivery.innerHTML;
                    document.getElementById("total_deliveries").innerHTML = 'Total Delivery: ' + total_delivery.innerHTML;
                    document.getElementById("mileage").innerHTML = 'Total Miles: ' + mile.innerHTML + ' miles';
                    document.getElementById("battery").innerHTML = 'Battery: ' + battery.innerHTML;
                    document.getElementById("ETA").innerHTML = 'ETA: ' + ETA.innerHTML;
                    document.getElementById("STA").innerHTML = 'STA: ' + STA.innerHTML;
                    document.getElementById("route").innerHTML = 'Route: ' + route.innerHTML;
                    document.getElementById("avail").innerHTML = 'Availability: ' + availability.innerHTML;
                    document.getElementById("conf").innerHTML = 'Configuration: ' + confiugration.innerHTML;
                    document.getElementById("UAV_time_td").innerHTML = 'Delivered #' + numDelivery.innerHTML;
                    document.getElementById("curr_lat").innerHTML = '　　LAT:　　 ' + current_lat.innerHTML;
                    document.getElementById("curr_long").innerHTML = '　　LONG:　' + current_long.innerHTML;
                    document.getElementById("curr_alt").innerHTML = '　　ALT:　　 ' + current_alt.innerHTML;
                    document.getElementById("dest_lat").innerHTML = '　　LAT:　　 ' + dest_lat.innerHTML;
                    document.getElementById("dest_long").innerHTML = '　　LONG:　' + dest_long.innerHTML;
                    document.getElementById("payload").innerHTML = '　　' + payload.innerHTML;
                    document.getElementById("cost").innerHTML = 'Total Cost of Package: $' + cost.innerHTML;

                    var UAVmarker = new google.maps.Marker({
                        position: uav_lat_long,
                        map: map,
                        icon: uavSymbolBlack,
                        labelContent: this.cells[0].innerHTML + '<div style="text-align: center;"><b>Alt: </b>' + this.cells[11].innerHTML + '<br/><b>Bat: </b>' + this.cells[3].innerHTML + '</div>',
                        labelAnchor: new google.maps.Point(95, 20),
                        labelClass: "labels",
                        labelStyle: { opacity: 0.75 },
                    });

                    map.setCenter(uav_lat_long);


                };
            }
        }
    }
});