//Wrapper object that wraps up communications to the server. A pretty leaky abstraction though.
//Something require callbacks leaking the fact that values cannot be returned immediately. Oh well!
function Reporter() {
    this.hub = $.connection.vehicleHub;

    this.pendingResult = false;

    this.updateMission = function (mission, opts) {
        var jqXHR = this.putToServer(
            '/api/missions/' + mission.id,
            {
                Phase: mission.Phase,
                FlightPattern: mission.FlightPattern,
                Payload: mission.Payload,
                Priority: mission.Priority,
                FinancialCost: mission.FinancialCost,
                TimeAssigned: mission.TimeAssigned,
                TimeComplete: mission.TimeCompleted,
                ScheduledCompletionTime: mission.ScheduledCompletionTime,
                EstimatedCompletionTime: mission.EstimatedCompletionTime,
                id: mission.id,
                ScheduleId: mission.ScheduleId,
                create_date: mission.create_date,
                modified_date: mission.modified_date,
                Latitude: mission.Latitude,
                Longitude: mission.Longitude,
            },
            {});

    }

    this.updateFlightState = function (fs, opts) {
        this.hub.server.pushFlightStateUpdate({
            Id: fs.Id,
            Timestamp: fs.Timestamp,
            VelocityX: fs.VelocityX,
            VelocityY: fs.VelocityY,
            VelocityZ: fs.VelocityZ,
            Yaw: fs.Yaw,
            Roll: fs.Roll,
            Pitch: fs.Pitch,
            YawRate: fs.YawRate,
            RollRate: fs.RollRate,
            PitchRate: fs.PitchRate,
            BatteryLevel: fs.BatteryLevel,
            UAVId: fs.UAVId,
            create_date: fs.create_date,
            modified_date: fs.modified_date,
            Latitude: fs.Latitude,
            Longitude: fs.Longitude,
            Altitude: fs.Altitude
        });
    }

    this.putToServer = function (url, data, opts, success) {

        return $.ajax({
            url: url,
            data: JSON.stringify(data),
            dataType: 'json',
            success: success,
            type: 'PUT',
            contentType: "application/json",
        });
    }

    this.ackCommand = function (cmd, type, reason, accepted) {
        this.hub.server.ackCommand({
            CommandId: cmd.Id,
            CommandType: type,
            Reason: reason,
            Accepted: accepted
        }, cmd.connId);
    }

    this.retrieveWaypointsByMissionId = function (id, caller, success) {
        this.pendingResult = true;
        var url = '/api/missions/waypoints/' + id;
        var req = $.ajax({
            url: url,
            success: function (data, textStatus, jqXHR) { success(data, textStatus, jqXHR); }
        });
        var $this = this;
        req.always(function (data, textStatus, jqXHR) {
            $this.pendingResult = false;
        });
        return req;
    }

    this.insertWaypoint = function (id, newWp) {
        this.pendingResult = false;
        var url = '/api/waypoints/insert/' + id;
        return $.ajax({
            type: "POST",
            url: url,
            data: newWp,
        });
    }

    this.updateWaypoint = function (wp) {
        var url = '/api/waypoints/' + wp.Id;
        return $.ajax({
            type: 'PUT',
            url: url,
            data: wp
        });
    }

    this.getMissionById = function (id) {
        return $.ajax({
            url: 'api/missions/' + id,
            type: 'GET'
        });
    }

    this.getMissions = function () {
        return $.ajax({
            url: 'api/missions',
            type: 'GET',
        })
    }


    this.addNewRouteToMission = function (id, pts) {
        var promise = $.ajax(
            {
                url: '/api/missions/' + id + '/newroute',
                type: 'POST',
                headers: {
                    "Content-Type": 'application/json',
                },
                data: JSON.stringify(pts),
            });
        var $this = this;
        promise.fail(function (jqXHR, textStatus, errorThrown) {
            console.error("addNewRouteToMission failed!");
        });
        return promise;
    }
}
