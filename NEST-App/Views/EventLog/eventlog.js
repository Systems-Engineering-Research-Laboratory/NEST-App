var eventlogapp = angular.module('EventLog', ['SignalR']);

eventlogapp

.controller('EventLogCtrl', ['$scope', 'eventhub', function ($scope, eventhub) {
    $scope.events = #udefine'mm';
    
}])
.factory('eventhub', ['$rootScope', 'Hub', function ($rootScope, Hub) {

}])