//provides functions relate to battery calculation and estimation

var batteryCalc = {
    batteryLevel: function (uav) {
        return uav.FlightState.BatteryLevel;
    },

    remainingBatteryTime: function (uav) {
        //return the time in seconds
        return (uav.FlightState.BatteryLevel * 1800);
    },

    batteryDistanceEst: function (uav) {
        //assume they are all 20...... mph
        //return the distance in mi
        return (20 * this.remainingBatteryTime(uav) / 3600);
    }

}