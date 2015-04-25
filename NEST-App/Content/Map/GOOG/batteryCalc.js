//provides functions relate to battery calculation and estimation

var batteryCalc = {
    circle: null,

    batteryLevel: function (uav) {
        return uav.BatteryLevel;
    },

    remainingBatteryTime: function (uav) {
        //return the time in seconds
        return (uav.BatteryLevel * 1800);
    },

    batteryDistanceEst: function (uav) {
        //assume they are all 20...... mph
        //return the distance in meter
        return (1609 * 20 * this.remainingBatteryTime(uav) / 3600);
    },

    updateBatteryCalc: function (uav) {
        this.circle.setRadius(this.batteryDistanceEst(uav));
        this.circle.setCenter(new google.maps.LatLng(uav.Latitude, uav.Longitude));
    },

    displayEstCircle: function (uav) {
        this.circle = new google.maps.Circle({
            map: map,
            center: new google.maps.LatLng(uav.Latitude, uav.Longitude),
            radius: this.batteryDistanceEst(uav),
            fillColor: '#44FF33',
            strokeWeight: 0,
            fillOpacity: 0.4,
            clickable: false,
            zindex: -99999
        });
        if (!this.circle.getVisible()) {
            this.circle.setVisible(true);
        }
    }

}