angular.module('adminApp').controller('AdminCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.init = function () {
        $scope.newUser = {};
        $scope.newVehicle = {};
        $scope.allUsers = [];
        $scope.allVehicles = [];
        $scope.currentAdmin = {};
        $scope.uavs = [];
        $scope.allUsers = [];
        $scope.desiredUAVCount = '';
        $scope.selectedUser = null;
        $scope.unassignedUavs = [];
        $scope.emergencyEvents = [];
        $scope.emergencySituations = [
            " Strong crosswinds detected",
            " Detected damage to rotary blades",
            " Weak GPS link",
            " Payload in danger of detachment",
        ]
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
            $http.get('/api/uavs/generateuavs/' + $("#desiredUAVCount").val())
            .success(function (data, status, headers, config) {
                $scope.uavs = data;
            })
            .error(function (data, status, headers, config) {
                alert(data);
            });
        };
        $scope.getGeneratedUAVs = function () {
            $http.get('/api/uavs')
            .success(function (data, status, headers, config) {
                $scope.uavs = data;
                console.log(data);
            })
            .error(function (data, status, headers, config) {
                console.log(data);
                alert(data);
            });
        };
        $scope.addOperator = function () {
            var user = {
                username: $("#operatorName").val(),
                password: "test",
                phone_number: "555-555-5555"
            };
            console.log(user);
            $http.post('/api/users', JSON.stringify(user))
            .success(function (data, status, headers, config) {
                //$scope.allUsers.push(data);
                $scope.getOperators();
            })
            .error(function (data, status, headers, config) {
                alert(data);
            });
        };

        $scope.createEmergencyEvent = function () {
            var number = Math.floor((Math.random() * ($scope.uavs.length - 1)) + 0);
            var number2 = Math.floor((Math.random() * ($scope.emergencySituations.length)) + 0);
            var pickedUav = $scope.uavs[number];
            var eEvent = {
                uav_id: pickedUav.Id,
                message: $scope.emergencySituations[number2],
                criticality: "critical",
                uav_callsign: pickedUav.Callsign,
                operator_screen_name: "Test Operator",
                UAVId: pickedUav.Id
            }
            $http.post('/api/uavs/postuavevent', eEvent)
            .success(function (data, status, headers, config) {
                $scope.emergencyEvents.push(data);
                var emitHub = $.connection.eventLogHub;
                emitHub.connection.start().done(function () {
                    emitHub.server.emit(eEvent);
                });
            });
            console.log(eEvent);
        };

        $scope.getOperators = function () {
            $http.get('/api/users')
                .success(function (data, status, headers, config) {
                    $scope.allUsers = data;
                })
                .error(function (data, status, headers, config) {
                    alert(data);
                });
        };
        $scope.deleteUAV = function (uav_id) {
            $http.put('/api/uavs/disableuav/' + uav_id)
            .success(function (data, status, headers, config) {
                $scope.uavs = $scope.uavs.filter(function (obj) {
                    return obj.Id != uav_id;
                });
            })
            .error(function (data, status, headers, config) {
                alert(data);
                console.log(data);
            });
        };
        $scope.assignUser = function (uav_id, user_id) {
            $http.post('/api/uavs/assignuser/' + uav_id + '/' + user_id)
            .success(function (data, status, headers, config) {

            })
            .error(function (data, status, headers, config) {

            });
        };
        $scope.userSelected = function (user) {
            $scope.selectedUser = user;
        };

        $http.get('/api/users')
        .success(function (data, status, headers, config) {
            $scope.allUsers = data;
        })
        .error(function (data, status, headers, config) {
            alert("An error has occurred. Check console");
            console.log(data);
        });
        $http.get('/api/uavs/getunassigned')
        .success(function (data, status, headers, config) {
            $scope.unassignedUavs = data;
        })
        .error(function (data, status, headers, config) {

        });
        $scope.getGeneratedUAVs();

    };



    $scope.init();
}])