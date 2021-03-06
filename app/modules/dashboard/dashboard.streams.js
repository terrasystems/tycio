'use strict';

angular.module('app.core')

    .controller('StreamsController', ['$scope', '$rootScope', '$state', 'fbutil', '$uibModal', '$log', '$firebaseArray', 'FBURL', '$firebaseObject', 'SweetAlert',
        function ($scope, $rootScope, $state, fbutil, $uibModal, $log, $firebaseArray, FBURL, $firebaseObject, SweetAlert) {

            $scope.getCollections = function(i) {
                console.log('getCollections..['+i+']');
            };

            //ref.set({
            //    name: "xHello World!",
            //    email: "Firebase@org.ua",
            //    streams: [
            //        {
            //            title: "Cumulative",
            //            apiurl: "http://thethingscloud.cloud.tyk.io/cumulative/",
            //            apikey: "56999a15c962eb000100001942731a664f144c9b6c793fd16033f95a",
            //            field: "gennow",
            //            description: "gennow",
            //            time: "timestamp"
            //        },
            //        {
            //            title: "Loopback",
            //            apiurl: "http://thethingscloud.cloud.tyk.io/loopback/",
            //            apikey: "56999a15c962eb000100001942731a664f144c9b6c793fd16033f95a",
            //            field: "gennow",
            //            description: "gennow",
            //            time: "timestamp"
            //        }
            //    ]
            //});

            var ref = new Firebase(FBURL);
            //$firebaseObject(ref.child('users').child($rootScope.userObj.uid).child('streams')).$bindTo($scope, "streams");
            $scope.streams = $firebaseArray(ref.child('users').child($rootScope.userObj.uid).child('streams'));

            $scope.deleteStream = function (index) {
                SweetAlert.swal({
                    title: 'Are you sure?',
                    text: 'Your will not be able to recover this stream!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes, delete it!',
                    closeOnConfirm: true
                },  function(isConfirm){
                    if (isConfirm) {
                        if (index >= 0 && _.isArray($scope.streams) && index <= $scope.streams.length) {
                            $scope.streams.$remove(index);
                        }
                    }
                });
            };

            $scope.editStream = function (index) {
                if (index == -1) {
                    var oldStreamForm = {title: "", apiurl: "", apikey: "", field: "", description: "", time: ""};
                }
                else {
                    var oldStreamForm = angular.copy($scope.streams[index]);
                }
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'editStream.html',
                    controller: 'ModalInstanceCtrl',
                    resolve: {
                        streamForm: function () {
                            return oldStreamForm;
                        }
                    }
                });

                modalInstance.result.then(function (streamForm) {
                    if (index == -1) {
                        $scope.streams.$add(streamForm);
                    }
                    else {
                        $scope.streams[index] = streamForm;
                        $scope.streams.$save(index);
                    }
                }, function () {
                    //$scope.streams[index] = oldStreamForm;
                });
            };

        }])


    .controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, streamForm) {

        $scope.streamForm = streamForm;

        $scope.ok = function () {
            $uibModalInstance.close($scope.streamForm);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
