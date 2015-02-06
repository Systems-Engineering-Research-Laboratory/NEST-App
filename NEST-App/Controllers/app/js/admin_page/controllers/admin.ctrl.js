angular.module('adminApp').controller('AdminCtrl', ['$scope', function ($scope) {
    $scope.init = function () {
        $scope.newUser = {};
        $scope.newVehicle = {};
        $scope.allUsers = [];
        $scope.allVehicles = [];
        $scope.currentAdmin = {};

        var User = function (user) {
            //insert user model here
            var User = {

            };
        };
        var Vehicle = function (vehicle) {
            //insert vehicle model here
            var Vehicle = {

            };
        };

        $scope.createUser = function () {
            $http({
                method: 'POST',
                url: '/api/users',
                data: $scope.newUser
            });
        };
        $scope.createVehicle = function () {
            $http({
                method: 'POST',
                url: '/api/users',
                data: $scope.newVehicle
            });
        };
    };
    $scope.init();
}])