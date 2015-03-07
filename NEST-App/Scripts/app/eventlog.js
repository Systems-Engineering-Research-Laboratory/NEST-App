var eventlogapp = angular.module('EventLog', ['SignalR', 'ngRoute', 'ngResource']);

eventlogapp

.controller('EventLogCtrl', ['$scope', 'Hub', function ($scope, Hub) {
    $scope.init = function () {
        //set up ViewModel
        var EventLog = function (event) {
            if (!event) event = {};
            var EventLog = {
                event_id: event.event_id || 1,
                uav_id: event.uav_id || 1,
                message: event.message || "Hello World",
                criticality: event.criticality || "critical",
                uav_callsign: event.uav_callsign || "PINR001",
                operator_screen_name: event.operator_screen_name || "varatep"
            };
            return EventLog;
        };
        //set up events list
        $scope.events = [];

        // begin uav hub and connect
        $scope.uavHub = new Hub("VehicleHub", {
            listeners: {
                'uavWasAssigned': function (uav) {
                    if (typeof uav.Id != "undefined") {
                        var assignmentEvt = {
                            uav_id: uav.Id,
                            uav_callsign: uav.Callsign,
                            message: "Operator " + uav.User.username + " has been assigned.",
                            operator_screen_name: uav.User.username,
                            create_date: uav.create_date
                        };
                        $scope.events.push(assignmentEvt);
                        $scope.$apply();
                    }
                },
                'uavWasRejected': function (uav) {
                    if (typeof uav.Id != "undefined") {
                        var assignmentEvt = {
                            uav_id: uav.Id,
                            uav_callsign: uav.Callsign,
                            message: "Operator " + uav.User.username + " has rejected assignment.",
                            operator_screen_name: uav.User.username,
                            create_date: uav.create_date
                        };
                        $scope.events.push(assignmentEvt);
                        $scope.$apply();
                    }
                }
            },
            methods: ["uavWasAssigned", "uavWasRejected"],
            errorHandler: function (err) {
                console.log(err);
            }
        });
        $scope.fakeEmitAsmt = function () {
            var fakeUav = {
                Id: 1
                , Callsign: "BRAVO195"
                , create_date: "10/22/1993"
                , User: {
                    username: "varatep"
                }
            };
            $scope.uavHub.uavWasAssigned(fakeUav);
        };
        $scope.fakeEmitRjct = function () {
            var fakeUav = {
                Id: 1
                , Callsign: "BRAVO195"
                , create_date: "10/22/1993"
                , User: {
                    username: "varatep"
                }
            };
            $scope.uavHub.uavWasRejected(fakeUav);
        };
        // begin hub and connect
        $scope.hub = new Hub('eventLogHub', {
            listeners: {
                'newEvent': function (evt) {
                    console.log(evt);
                    if (typeof evt.uav_id != "undefined") {
                        console.log(evt);

                        $scope.events.push(evt);
                        $scope.$apply();
                    }
                },
                'hello': function (msg) {
                    console.log(msg);
                }
            },
            methods: ["emit", "hello"],
            errorHandler: function (err) {
                console.log(err);
            }
        });
        $scope.fakeEmit = function () {
            $scope.hub.emit(new EventLog());
        };
        $scope.getRowStyle = function (criticality) {
            if (criticality === "warning") {
                return {
                    backgroundColor: "#EEEB8D"
                };
            } else if (criticality === "critical") {
                return {
                    backgroundColor: "#CD0000"
                };
            }
        };
    };
    $scope.init();
}])