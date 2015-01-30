var eventlogapp = angular.module('EventLog', ['SignalR']);

eventlogapp

.controller('EventLogCtrl', ['$scope', 'eventhub', function ($scope, eventhub) {
    $scope.events = [];
    
}])
.factory('eventhub', ['$rootScope', 'Hub', function ($rootScope, Hub) {

}])