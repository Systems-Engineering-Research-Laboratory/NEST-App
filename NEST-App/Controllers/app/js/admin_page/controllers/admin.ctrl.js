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
        $scope.numberToAssign = 0;
        $scope.operatorToAdd =
        {
            operatorType: "Operator Type"
        };
        $scope.changeOperatorType = function(type) {
            //$("#operatorTypeDropdown").attr("value", type);
            $scope.operatorToAdd.operatorType = type;
        };
        $scope.emergencySituations = [
            " Strong crosswinds detected, change path",
            " Detected damage to rotary blades",
            " Weak GPS link, change path",
            " Payload in danger of detachment",
        ]
        $scope.blockUI = function () {
            $.blockUI({
                message: '<i class="fa fa-spinner fa-pulse"></i>',
                css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: '#000',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    opacity: .5,
                    color: '#fff'
                }
            });
        }
        $scope.blockUI();
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
            $scope.blockUI();
            $http({
                method: 'POST',
                url: '/api/users',
                data: $scope.newUser,
                success: function (data) {
                    $scope.allUsers.push(data);
                    $.unblockUI();
                }
            });

        };
        $scope.createVehicle = function () {
            $scope.blockUI();
            $http({
                method: 'POST',
                url: '/api/users',
                data: $scope.newVehicle,
                success: function (data) {
                    $scope.allVehicles.push(data);
                    $.unblockUI();
                }
            });
        };
        $scope.generateUAVs = function () {
            $scope.blockUI();
            $http.get('/api/uavs/generateuavs/' + $("#desiredUAVCount").val())
            .success(function (data, status, headers, config) {
                $scope.uavs = data;
                $.unblockUI();
            })
            .error(function (data, status, headers, config) {
                $.unblockUI();
                alert(data);
            });
        };
        $scope.getGeneratedUAVs = function () {
            $scope.blockUI();
            $http.get('/api/uavs')
            .success(function (data, status, headers, config) {
                $scope.uavs = data;
                console.log(data);
                $.unblockUI();
            })
            .error(function (data, status, headers, config) {
                console.log(data);
                $.unblockUI();
                alert(data);
            });
        };
        $scope.addOperator = function () {
            $scope.blockUI();
            var user = {
                username: $("#operatorName").val(),
                password: "test",
                phone_number: "555-555-5555",
                UserRole: {
                    access_level: $scope.operatorToAdd.operatorType,
                    role_type: $scope.operatorToAdd.operatorType
                }
            };
            console.log(user);
            $http.post('/api/users', JSON.stringify(user))
            .success(function (data, status, headers, config) {
                //$scope.allUsers.push(data);
                $scope.allUsers.push(data);
                $.unblockUI();
            })
            .error(function (data, status, headers, config) {
                $.unblockUI();
                alert(data);
            });
        };

        $scope.createMission = function () {
            $http.post('/api/uavs/createuavmission/' + $("#desiredMissionCount").val())
            .success(function (data, status, headers, config) {
                console.log('created a new mission...')
            })
            .error(function (data, status, headers, config) {
                alert(data + " " + status);
            });
        }
        $scope.scheduleMissions = function () {
            $http.put('/api/uavs/schedulemissions')
            .success(function (data, status, headers, config) {
                console.log('assigned missions...')
            })
            .error(function (data, status, headers, config) {
                alert(data + " " + status);
            })
        }

        $scope.createMaintenance = function () {
            $http.put('/api/uavs/createmaintenance/' + $("#desiredMaintenanceCount").val())
            .success(function (data, status, headers, config) {
                console.log('created maintenances...')
          })
            .error(function (data, status, headers, config) {
                alert(data + " " + status);
          });
        }
        $scope.batteryDrop = function () {
            $scope.blockUI();
            var number = Math.floor((Math.random() * ($scope.uavs.length)) + 0);
            var pickedUav = $scope.uavs[number];

            var batteryDrop = {
                uavID: pickedUav.Id,
                amount: $('#desiredBatteryDrop').val()
            }

            var adminHub = $.connection.adminHub;
            adminHub.connection.start().done(function () {
                adminHub.server.emit(batteryDrop);
                console.log("sent")
            });

            localStorage.setItem("uavBatteryID", pickedUav.Id);
            localStorage.setItem("uavBatteryAmount", $('#desiredBatteryDrop').val());


            $.unblockUI();
        }

        $scope.createEmergencyEvent = function () {
            $scope.blockUI();
            var number = Math.floor((Math.random() * ($scope.uavs.length)) + 0);
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
                $.unblockUI();
            });
            console.log(eEvent);
        };

        $scope.getOperators = function () {
            $scope.blockUI();
            $http.get('/api/users')
                .success(function (data, status, headers, config) {
                    $scope.allUsers = data;
                    $.unblockUI();
                })
                .error(function (data, status, headers, config) {
                    $.unblockUI();
                    alert(data);
                });
        };
        $scope.deleteUAV = function (uav_id) {
            $scope.blockUI();
            $http.put('/api/uavs/disableuav/' + uav_id)
            .success(function (data, status, headers, config) {
                $scope.uavs = $scope.uavs.filter(function (obj) {
                    return obj.Id != uav_id;
                });
                $.unblockUI();
            })
            .error(function (data, status, headers, config) {
                $.unblockUI();
                alert(data);
                console.log(data);
            });
        };
        $scope.assignUser = function (uav_id, user_id) {
            $scope.blockUI();
            $http.post('/api/uavs/assignuser/' + uav_id + '/' + user_id)
            .success(function (data, status, headers, config) {
                for (var i = 0; i < $scope.allUsers.length; i++) {
                    if ($scope.allUsers[i].user_id == user_id) {
                        $scope.allUsers[i].UAVs.push(data);
                    }
                }
                for (var i = 0; i < $scope.unassignedUavs.length; i++) {
                    if ($scope.unassignedUavs[i].Id == uav_id) {
                        $scope.unassignedUavs.splice(i, 1);
                    }
                }
                //var uav = $scope.unassignedUavs.filter(function (obj) {
                //    return obj.Id == uav_id;
                //});
                //user.UAVs.push(uav);
                //$scope.unassignedUavs.splice($scope.unassignedUavs.indexOf(uav), 1);
                $scope.$apply();
                $.unblockUI();
            })
            .error(function (data, status, headers, config) {
                $.unblockUI();
            });
        };
        $scope.assignMultipleUAVs = function () {
            $http.post('/api/users/assignmultiple/' + $scope.selectedUser.user_id + '/' + $scope.numberToAssign)
            .success(function (data,status,headers,config) {
                for (var i = 0; i < $scope.allUsers.length; i++) {
                    if ($scope.allUsers[i].user_id == $scope.selectedUser.user_id) {
                        $scope.allUsers[i].UAVs = data.UAVs;
                        
                    }
                }
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
            $.unblockUI();
        })
        .error(function (data, status, headers, config) {
            $.unblockUI();
        });
        $scope.getGeneratedUAVs();

    };



    $scope.init();
}])