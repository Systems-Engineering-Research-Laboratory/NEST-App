var eventlogapp = angular.module('EventLog', ['SignalR', 'ngRoute', 'ngResource']);

eventlogapp

.controller('EventLogCtrl', ['$scope', 'Hub', function ($scope, Hub) {
    $scope.events = [];
    var hub = new Hub('event', {
        listeners: {
            'emitevent': function (evt) {
                if (typeof evt.uav_id != "undefined") {
                    $scope.events.push(evt);
                }
            }
        },
        errorHandler: function (err) {
            console.log(err);
        }
    });
    
}])
//.factory('eventhub', ['$rootScope', 'Hub', function ($rootScope, Hub) {
//    var hub = new Hub('event', {
//        listeners: {
//            'emitevent': function (evt) {
//            }
//        },
//        errorHandler: function (err) {
//            console.log(err);
//        }
//    });
//    return {
//        newEvent: function (evt) {

//        }
//    }
//}])