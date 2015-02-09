angular.module('adminApp').controller('AdminCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.init = function () {
        $scope.newUser = {};
        $scope.newVehicle = {};
        $scope.allUsers = [];
        $scope.allVehicles = [];
        $scope.currentAdmin = {};
        $scope.uavs = [];
        $scope.desiredUAVCount = '';
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
                data: $scope.newUser,
                success: function (data) {
                    $scope.allUsers.push(data);
                }
            });
        };
        $scope.createVehicle = function () {
            $http({
                method: 'POST',
                url: '/api/users',
                data: $scope.newVehicle,
                success: function (data) {
                    $scope.allVehicles.push(data);
                }
            });
        };
        $scope.generateUAVs = function () {
            //$http({
            //    method: 'POST',
            //    url: '/api/uavs/generateuavs/' + count,
            //    success: function (data) {
            //        $scope.uavs = (data);
            //    },
            //    error: function (err) {
            //        alert(err);
            //    }
            //});
            $http.post('/api/uavs/generateuavs', { number: $("#desiredUAVCount").val() })
            .success(function (data, status, headers, config) {

            })
            .error(function (data, status, headers, config) {

            });
        };
        $scope.getGeneratedUAVs = function () {
            $http.get('/api/uavs/getgenerateduavs')
            .success(function (data, status, headers, config) {
                $scope.uavs = data;
                //console.log(data);
            })
            .error(function (data, status, headers, config) {
                alert(data);
            });
        };
    };
    $scope.init();
}])