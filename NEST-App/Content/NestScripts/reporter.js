//Wrapper object that wraps up communications to the server. A pretty leaky abstraction though.
//Something require callbacks leaking the fact that values cannot be returned immediately. Oh well!
function Reporter() {
    this.hub = $.connection.vehicleHub;
    this.eventHub = $.connection.eventLogHub;

    this.pendingResult = false;
    this.reportCrashEvent = function (uavId, callsign) {
        var curTime = new Date();
        var event = {
            event_id: 0,
            uav_id: uavId,
            message: "UAV has crashed",
            criticality: "critical",
            uav_callsign: callsign,
            operator_screen_name: "",
            UAVId: uavId,
            create_date: curTime.toUTCString(),
            modified_date: curTime.toUTCString()
        }

       return  $.ajax({
                    url: "/api/uavs/postuavevent",
                    data: event,
                    success: function () {
                        this.eventHub.server.emit(event);
                    },
                    type: 'POST',
                    contentType: "application/json",
                });
    }

    this.reportReroute = function (uavId, callsign) {
        var curTime = new Date();
        this.eventHub.server.emit({
            message: " Rerouted successfully around a restricted area",
            uav_id: uavId,
            UAVId: uavId,
            uav_callsign: callsign,
            operator_screen_name: "",
            criticality: "normal",
            create_date: curTime.toUTCString(),
            modified_date: curTime.toUTCString(),
        });
    }

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
        var curTime = new Date();
        if (fs.BatteryLevel < 0)
        {
            fs.BatteryLevel = 0;
        }
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
            create_date: curTime.toUTCString(),
            modified_date: curTime.toUTCString(),
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
        var data = JSON.stringify(pts);
        var promise = $.ajax(
            {
                url: '/api/missions/' + id + '/newroute',
                type: 'POST',
                headers: {
                    "Content-Type": 'application/json',
                },
                data: data,
            });
        var $this = this;
        promise.fail(function (jqXHR, textStatus, errorThrown) {
            console.error("addNewRouteToMission failed!");
        });
        return promise;
    }

    this.appendRouteToMission = function (id, pts) {
        for (var i = 0; i < pts.length; i++) {
            pts[i].MissionId = id;
        }
        var jsonPts = JSON.stringify(pts);
        var promise = $.ajax(
            {
                url: '/api/missions/' + id + '/appendWaypoints',
                type: 'POST',
                contentType: 'application/json',
                data: jsonPts,
            });
        var $this = this;
        promise.fail(function (jqXHR, textSTatus, errorThrown) {
            console.error(errorThrown);
        });
        return promise;
    }

    this.broadcastNewMission = function(uavid, schedid, missionid) {
        //this.hub.server.vehicleHasNewMission(uavid, schedid, missionid);
        return $.ajax({
            method: 'PUT',
            url: '/api/schedule/' + schedid + '/setCurrentMission/' + missionid,
        });
    }

    this.failedReroute = function (callsign, uavId) {
        var curTime = new Date();
        this.eventHub.server.emit({
            message: "UAV " + callsign + " failed to reroute around a restricted area. Holding position",
            uav_id: uavId,
            UAVId: uavId,
            uav_callsign: callsign,
            operator_screen_name: "",
            criticality: "critical",
            create_date: curTime.toUTCString(),
            modified_date: curTime.toUTCString(),
        });
    }

    this.reportBackAtBase = function (uav) {
        this.hub.server.reportBackAtBase(uav.Id);
    }
}
