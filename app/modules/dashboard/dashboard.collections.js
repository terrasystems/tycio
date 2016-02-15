'use strict';

angular.module('app.core')

    .controller('CollectionsController', ['$scope', 'Auth', 'fbutil', '$state', '$rootScope', '$firebaseArray', 'FBURL', '$uibModal', 'SweetAlert', '$http', '$q', '$interval',
        function ($scope, Auth, fbutil, $state, $rootScope, $firebaseArray, FBURL, $uibModal, SweetAlert, $http, $q, $interval) {

            if (!$rootScope.userObj) {
                $state.go('page.login');
                return;
            }

            $scope.lineData = {
                labels: [],
                datasets: [
                    {
                        label: 'My First dataset',
                        fillColor: 'rgba(114,102,186,0.2)',
                        strokeColor: 'rgba(114,102,186,1)',
                        pointColor: 'rgba(114,102,186,1)',
                        pointStrokeColor: '#fff',
                        pointHighlightFill: '#fff',
                        pointHighlightStroke: 'rgba(114,102,186,1)',
                        data: []
                    }
                ]
            };

            $scope.lineOptions = {
                scaleShowGridLines: true,
                scaleGridLineColor: 'rgba(0,0,0,.05)',
                scaleGridLineWidth: 1,
                bezierCurve: true,
                bezierCurveTension: 0.4,
                pointDot: true,
                pointDotRadius: 4,
                pointDotStrokeWidth: 1,
                pointHitDetectionRadius: 20,
                datasetStroke: true,
                datasetStrokeWidth: 2,
                datasetFill: true
            };

            function isNumeric(n) {
                return !isNaN(parseFloat(n)) && isFinite(n);
            }

            $scope.streams = [];


            var ref = new Firebase(FBURL);
            $scope.streamsMain = $firebaseArray(ref.child('users').child($rootScope.userObj.uid).child('streams'));


            $scope.collections = getCollections();


            function getCollections() {
                var ref = new Firebase(FBURL);
                var arr = $firebaseArray(ref.child('users').child($rootScope.userObj.uid).child('collections'));

                arr.$loaded()
                    .then(function (data) {
                        getStreams(arr).then(function (result) {
                            $scope.streams = result;
                        });
                    })
                    .catch(function (error) {
                        console.error("Error:", error);
                    });
                return arr;
            };


            function getStreams(collections) {
                var deferred = $q.defer();
                var arr = [], IDs = [];
                if (collections.length > 0) {
                    collections.forEach(function (collection, index) {
                        arr[index] = [];
                        if (('IDs' in collection) && (_.isArray(collection.IDs))) {
                            IDs = collection.IDs;
                            IDs.forEach(function (id, index2) {
                                var x = angular.copy($scope.streamsMain.$getRecord(id));
                                x.lineOptions = $scope.lineOptions;
                                if (isNumeric(x.time)) {
                                    x.interval = $interval(function () {
                                        console.log('$interval ' + x.title);
                                        refreshPointsStream(index, index2);
                                    }, x.time * 1000);
                                }
                                getPointsStream(x).then(function (result) {
                                    x.lineData = result;
                                    arr[index].push(x);
                                });
                            });
                        }
                    });
                    deferred.resolve(arr);
                } else {
                    deferred.reject(false);
                }
                ;
                return deferred.promise;
            };


            function getPointsStream(objStream) {
                var deferred = $q.defer();
                var item = {};
                objStream.lineData = angular.copy($scope.lineData);

                var req = {
                    method: 'GET',
                    url: 'api/' + objStream.host,
                    //url: 'http://thethingscloud.cloud.tyk.io/' + objStream.host,
                    headers: {
                        'authorization': objStream.apikey
                    }
                };
                $http(req).then(function successCallback(response) {
                    if (_.isArray(response.data)) {
                        var f = objStream.field, i = 0;
                        objStream.lineData = {};
                        objStream.lineData.datasets = [];
                        objStream.lineData.datasets[0] = {
                            label: '',
                            fillColor: 'rgba(114,102,186,0.2)',
                            strokeColor: 'rgba(114,102,186,1)',
                            pointColor: 'rgba(114,102,186,1)',
                            pointStrokeColor: '#fff',
                            pointHighlightFill: '#fff',
                            pointHighlightStroke: 'rgba(114,102,186,1)',
                            data: []
                        };
                        objStream.lineData.labels = [];

                        response.data.forEach(function (item, index) {
                            if ((f in item) && (isNumeric(item[f]))) {
                                objStream.lineData.datasets[0].data.push(item[f]);
                                objStream.lineData.labels.push(i);
                                i = i + 1;
                            }
                            else {
                                console.log('Warn: record is not field or not numeric! ' + item);
                            }
                        });
                        deferred.resolve(objStream.lineData);
                    }
                    else
                        deferred.reject(false);
                }, function errorCallback(response) {
                    console.log(response);
                    deferred.reject(response);
                });
                return deferred.promise;
            };


            function refreshPointsStream(idxCollection, idxStream) {
                var data = [], labels = [];
                if ((idxCollection < $scope.streams.length) && (idxStream < $scope.streams[idxCollection].length)) {
                    var itemS = $scope.streams[idxCollection][idxStream];
                    $http({
                        method: 'GET',
                        url: 'api/' + itemS.host,
                        headers: {'authorization': itemS.apikey}
                    }).then(
                        function successCallback(response) {
                            var f = itemS.field, i = 0;
                            if (_.isArray(response.data)) {
                                response.data.forEach(function (item, index) {
                                    if ((f in item) && (isNumeric(item[f]))) {
                                        data.push(item[f]);
                                        labels.push(i);
                                        i = i + 1;
                                    }
                                    else {
                                        console.log('Warn: record is not field or not numeric! ' + item);
                                    }
                                });
                            };
                        }, function errorCallback(response) {
                            console.log(response);
                        });
                    $scope.streams[idxCollection][idxStream].lineData.datasets[0].data = data;
                    $scope.streams[idxCollection][idxStream].lineData.labels = labels;
                }
            };


            $scope.deleteCollection = function (index) {
                SweetAlert.swal({
                    title: 'Are you sure?',
                    text: 'Your will not be able to recover this collection!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes, delete it!',
                    closeOnConfirm: true
                }, function (isConfirm) {
                    if (isConfirm) {
                        console.log('I = ' + index);
                        if (index >= 0 && _.isArray($scope.collections) && index <= $scope.collections.length) {
                            $scope.collections.$remove(index)
                                .then(function (data) {
                                    getStreams($scope.collections).then(function (result) {
                                        $scope.streams = result;
                                    });
                                })
                                .catch(function (error) {
                                    console.error("Error:", error);
                                });
                            SweetAlert.swal('Delete - Ok!');
                        }
                    }
                });
            };


            $scope.editCollections = function (index) {
                if (index == -1) {
                    var oldCollectionForm = {title: "", IDs: []};
                }
                else {
                    var oldCollectionForm = angular.copy($scope.collections[index]);
                }
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'editCollection.html',
                    controller: 'ModalInstanceCtrl2',
                    resolve: {
                        collectionForm: function () {
                            return oldCollectionForm;
                        }
                    }
                });

                modalInstance.result.then(function (collectionForm) {
                    if (index == -1) {
                        $scope.collections.$add(collectionForm);
                    }
                    else {
                        $scope.collections[index] = collectionForm;
                        $scope.collections.$save(index);
                    }
                }, function () {
                    //$scope.streams[index] = oldStreamForm;
                });
            };


            $scope.deleteStream = function (indexRoot, index) {
                SweetAlert.swal({
                    title: 'Are you sure?',
                    text: 'Your will not be able to recover this stream!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes, delete it!',
                    closeOnConfirm: true
                }, function (isConfirm) {
                    if (isConfirm) {
                        $scope.streams[indexRoot].splice(index, 1);
                        $scope.collections[indexRoot].IDs.splice(index, 1);
                        $scope.collections.$save(indexRoot)
                            .then(function (data) {
                                getStreams($scope.collections).then(function (result) {
                                    $scope.streams = result;
                                });
                            })
                            .catch(function (error) {
                                console.error("Error:", error);
                            });
                    }
                });
            };


            $scope.addStream = function (indexRoot, obj) {
                if (!(('IDs' in $scope.collections[indexRoot]) && (_.isArray($scope.streams[indexRoot])))) {
                    $scope.streams[indexRoot] = [];
                    $scope.collections[indexRoot].IDs = [];
                }
                $scope.streams[indexRoot].push(obj.$id);
                $scope.collections[indexRoot].IDs.push(obj.$id);
                $scope.collections.$save(indexRoot)
                    .then(function (data) {
                        getStreams($scope.collections).then(function (result) {
                            $scope.streams = result;
                        });
                    })
                    .catch(function (error) {
                        console.error("Error:", error);
                    });
            };


            $scope.$on('$destroy', function () {
                    if ($scope.streams.length > 0) {
                        var arr = $scope.streams;
                        arr.forEach(function (stream, index) {
                            stream.forEach(function (item, index) {
                                $interval.cancel(item.interval);
                                item.interval = undefined;
                            });
                        });

                    }
                }
            );


            $scope.isAdd = true;

        }])


    .controller('ModalInstanceCtrl2', function ($scope, $uibModalInstance, collectionForm) {
        $scope.collectionForm = collectionForm;
        $scope.ok = function () {
            $uibModalInstance.close($scope.collectionForm);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });