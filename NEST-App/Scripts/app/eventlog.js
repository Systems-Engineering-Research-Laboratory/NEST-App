var eventlogapp = angular.module('EventLog', ['SignalR', 'ngRoute', 'ngResource']);

eventlogapp

.controller('EventLogCtrl', ['$scope', 'eventhub', function ($scope, eventhub) {
    $scope.events = [];
    
}])
.factory('eventhub', ['$rootScope', 'Hub', function ($rootScope, Hub) {
    var eventhub = {};
    return {

    }
}])