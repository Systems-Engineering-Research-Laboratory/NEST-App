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
                criticality: event.criticality || "warning",
                uav_callsign: event.uav_callsign || "PINR001"
            };
            return EventLog;
        };
        //set up events list
        $scope.events = [];

        // begin hub and connect
        $scope.hub = new Hub('eventLogHub', {
            listeners: {
                'newEvent': function (evt) {
                    console.log(evt);
                    if (typeof evt.uav_id != "undefined") {
                        $scope.events.push(evt);
                        $scope.$apply();
                    }
                },
                'hello': function (msg) {
                    console.log(msg);
                }
            },
            methods: ['emit', 'hello'],
            errorHandler: function (err) {
                console.log(err);
            }
        });
        $scope.fakeEmit = function () {
            $scope.hub.emit(new EventLog());
        };
    };
    $scope.init();
}])