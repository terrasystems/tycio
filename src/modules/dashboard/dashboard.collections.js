'use strict';

angular.module('app.core')

    .controller('CollectionsController', ['$scope', 'Auth', 'fbutil', '$state', '$rootScope', '$firebaseArray', 'FBURL', '$uibModal', 'SweetAlert', '$http',
        function ($scope, Auth, fbutil, $state, $rootScope, $firebaseArray, FBURL, $uibModal, SweetAlert, $http) {

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


            collections();


            $scope.streams = [];


            var ref = new Firebase(FBURL);
            $scope.streamsMain = $firebaseArray(ref.child('users').child($rootScope.userObj.uid).child('streams'));


            $scope.collections = getCollections();


            function getCollections() {
                var ref = new Firebase(FBURL);
                var arr = $firebaseArray(ref.child('users').child($rootScope.userObj.uid).child('collections'));

                arr.$loaded()
                    .then(function (data) {
                        getStreams(arr);
                    })
                    .catch(function (error) {
                        console.error("Error:", error);
                    });
                return arr;
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
                                    getStreams($scope.collections);
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


            function getStreams(collections) {
                var arr = [], IDs = [];
                console.log('collection(s) : ' + collections.length);

                if (collections.length > 0) {
                    var ref = new Firebase(FBURL);
                    var streams = $firebaseArray(ref.child('users').child($rootScope.userObj.uid).child('streams'));

                    streams.$loaded()
                        .then(function (data) {
                            collections.forEach(function (collection, index) {
                                arr[index] = [];
                                if (('IDs' in collection) && (_.isArray(collection.IDs))) {
                                    IDs = collection.IDs;
                                    IDs.forEach(function (id, index2) {
                                        var x = angular.copy(data.$getRecord(id));
                                        arr[index].push(x);
                                    });

                                }
                            });
                            $scope.streams = arr;

                            //$scope.streams[0][0].$interval(factory($scope.streams[0][0]));


                        })
                        .catch(function (error) {
                            console.error("Error:", error);
                        });
                }
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
                                getStreams($scope.collections);
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
                        getStreams($scope.collections);
                    })
                    .catch(function (error) {
                        console.error("Error:", error);
                    });
            };


            $scope.isAdd = true;


            function isNumeric(n) {
                return !isNaN(parseFloat(n)) && isFinite(n);
            }


            function collections() {
                console.log('collections ..');
                //$httpProvider.defaults.headers.get = { 'authorization' : '56999a15c962eb000100001977366c5014e4429c5118fe1864cefe5a' };
                //var req = {
                //    method: 'GET',
                //    url: 'http://thethingscloud.cloud.tyk.io/average/',
                //    headers: {
                //        'authorization': '56999a15c962eb000100001977366c5014e4429c5118fe1864cefe5a'
                //    }
                //}
                //$http(req).then(function successCallback(response) {
                //    // this callback will be called asynchronously
                //    // when the response is available
                //    console.log(response);
                //}, function errorCallback(response) {
                //    // called asynchronously if an error occurs
                //    // or server returns response with an error status.
                //    console.log(response);
                //});
                $scope.data = [
                    {
                        "id": "56bac4fd28a39e278c360dcc",
                        "timestamp": 1455080701,
                        "average": 6.262413793103447,
                        "todayfed": 7,
                        "todaygen": 11.93,
                        "deviceid": 50
                    },
                    {
                        "id": "56b9737d28a39e311c4d33fd",
                        "timestamp": 1454994301,
                        "average": 6.0520689655172415,
                        "todayfed": 7,
                        "todaygen": 8.89,
                        "deviceid": 50
                    },
                    {
                        "id": "56b821fe28a39e3c549931a0",
                        "timestamp": 1454907902,
                        "average": 6.360344827586206,
                        "todayfed": 7,
                        "todaygen": 5.88,
                        "deviceid": 50
                    },
                    {
                        "id": "56b6d07d28a39e4260e75221",
                        "timestamp": 1454821501,
                        "average": 6.669310344827586,
                        "todayfed": 7,
                        "todaygen": 2.85,
                        "deviceid": 50
                    },
                    {
                        "id": "56b57efe28a39e3feda56ceb",
                        "timestamp": 1454735102,
                        "average": 6.7765517241379305,
                        "todayfed": 7,
                        "todaygen": 5.75,
                        "deviceid": 50
                    },
                    {
                        "id": "56b42d7d28a39e3abcdf2256",
                        "timestamp": 1454648701,
                        "average": 6.885172413793103,
                        "todayfed": 7,
                        "todaygen": 2.75,
                        "deviceid": 50
                    },
                    {
                        "id": "56b2dbfd28a39e52249783b1",
                        "timestamp": 1454562301,
                        "average": 6.884827586206897,
                        "todayfed": 7,
                        "todaygen": 2.88,
                        "deviceid": 50
                    },
                    {
                        "id": "56b18a7d28a39e6e83c88d65",
                        "timestamp": 1454475901,
                        "average": 6.988620689655172,
                        "todayfed": 7,
                        "todaygen": 2.8,
                        "deviceid": 50
                    },
                    {
                        "id": "56b038fd28a39e11b3ece93b",
                        "timestamp": 1454389501,
                        "average": 6.477241379310345,
                        "todayfed": 7,
                        "todaygen": 17.64,
                        "deviceid": 50
                    },
                    {
                        "id": "56aee77e28a39e2b518bba03",
                        "timestamp": 1454303102,
                        "average": 6.074137931034483,
                        "todayfed": 7,
                        "todaygen": 14.63,
                        "deviceid": 50
                    },
                    {
                        "id": "56ad95fd28a39e3d145988cf",
                        "timestamp": 1454216701,
                        "average": 6.2841379310344845,
                        "todayfed": 7,
                        "todaygen": 11.61,
                        "deviceid": 50
                    },
                    {
                        "id": "56ac447d28a39e3045b1f365",
                        "timestamp": 1454130301,
                        "average": 6.486551724137931,
                        "todayfed": 7,
                        "todaygen": 8.85,
                        "deviceid": 50
                    },
                    {
                        "id": "56aaf2fd28a39e482d9e50d1",
                        "timestamp": 1454043901,
                        "average": 6.686896551724138,
                        "todayfed": 7,
                        "todaygen": 5.88,
                        "deviceid": 50
                    },
                    {
                        "id": "56a9a17d28a39e69b6a48e10",
                        "timestamp": 1453957501,
                        "average": 6.886206896551724,
                        "todayfed": 7,
                        "todaygen": 2.87,
                        "deviceid": 50
                    },
                    {
                        "id": "56a84ffe28a39e108abec26d",
                        "timestamp": 1453871102,
                        "average": 6.878620689655172,
                        "todayfed": 7,
                        "todaygen": 5.94,
                        "deviceid": 50
                    },
                    {
                        "id": "56a6fe7d28a39e36aba5b583",
                        "timestamp": 1453784701,
                        "average": 6.87551724137931,
                        "todayfed": 7,
                        "todaygen": 2.94,
                        "deviceid": 50
                    },
                    {
                        "id": "56a5acfd28a39e5d37db4a94",
                        "timestamp": 1453698301,
                        "average": 7.084137931034482,
                        "todayfed": 7,
                        "todaygen": 2.9,
                        "deviceid": 50
                    },
                    {
                        "id": "56a45b7d28a39e027ababc2f",
                        "timestamp": 1453611901,
                        "average": 7.188620689655171,
                        "todayfed": 7,
                        "todaygen": 2.95,
                        "deviceid": 50
                    },
                    {
                        "id": "56a309fe28a39e21b812533e",
                        "timestamp": 1453525502,
                        "average": 7.052413793103447,
                        "todayfed": 7,
                        "todaygen": 6.86,
                        "deviceid": 50
                    },
                    {
                        "id": "569c727d28a39e14f7b013fd",
                        "timestamp": 1453093501,
                        "average": 7.05,
                        "todayfed": 7,
                        "todaygen": 2.84,
                        "deviceid": 50
                    },
                    {
                        "id": "569b20fd28a39e363b7b6ece",
                        "timestamp": 1453007101,
                        "average": 7.361724137931035,
                        "todayfed": 7,
                        "todaygen": 2.89,
                        "deviceid": 50
                    },
                    {
                        "id": "5699cf7d28a39e4df7f72b94",
                        "timestamp": 1452920701,
                        "average": 7.262758620689655,
                        "todayfed": 7,
                        "todaygen": 11.81,
                        "deviceid": 50
                    },
                    {
                        "id": "56987dfd28a39e6d571a3de9",
                        "timestamp": 1452834301,
                        "average": 7.162758620689655,
                        "todayfed": 7,
                        "todaygen": 8.79,
                        "deviceid": 50
                    },
                    {
                        "id": "56972c7d28a39e0a86206a64",
                        "timestamp": 1452747901,
                        "average": 7.06103448275862,
                        "todayfed": 7,
                        "todaygen": 5.79,
                        "deviceid": 50
                    },
                    {
                        "id": "5695dafd28a39e34322febea",
                        "timestamp": 1452661501,
                        "average": 7.474137931034483,
                        "todayfed": 7,
                        "todaygen": 2.78,
                        "deviceid": 50
                    },
                    {
                        "id": "5694897d28a39e5e16661b24",
                        "timestamp": 1452575101,
                        "average": 7.7844827586206895,
                        "todayfed": 7,
                        "todaygen": 2.8,
                        "deviceid": 50
                    },
                    {
                        "id": "569337fd28a39e408c1ac792",
                        "timestamp": 1452488701,
                        "average": 7.6837931034482745,
                        "todayfed": 7,
                        "todaygen": 11.74,
                        "deviceid": 50
                    },
                    {
                        "id": "5691e67d28a39e51210cc820",
                        "timestamp": 1452402301,
                        "average": 7.583448275862067,
                        "todayfed": 7,
                        "todaygen": 8.79,
                        "deviceid": 50
                    },
                    {
                        "id": "569094fe28a39e746db16a31",
                        "timestamp": 1452315902,
                        "average": 7.4834482758620675,
                        "todayfed": 7,
                        "todaygen": 5.75,
                        "deviceid": 50
                    },
                    {
                        "id": "568f437e28a39e184dfeb918",
                        "timestamp": 1452229502,
                        "average": 7.486206896551723,
                        "todayfed": 7,
                        "todaygen": 2.76,
                        "deviceid": 50
                    },
                    {
                        "id": "568df1fd28a39e429eb77e7c",
                        "timestamp": 1452143101,
                        "average": 7.592068965517241,
                        "todayfed": 7,
                        "todaygen": 2.79,
                        "deviceid": 50
                    },
                    {
                        "id": "568ca07d28a39e6423ff701d",
                        "timestamp": 1452056701,
                        "average": 7.179655172413794,
                        "todayfed": 7,
                        "todaygen": 14.82,
                        "deviceid": 50
                    },
                    {
                        "id": "568b4efd28a39e10a9e75b37",
                        "timestamp": 1451970301,
                        "average": 6.869655172413793,
                        "todayfed": 7,
                        "todaygen": 11.81,
                        "deviceid": 50
                    },
                    {
                        "id": "5689fd7d28a39e35d6f9e920",
                        "timestamp": 1451883901,
                        "average": 7.173103448275861,
                        "todayfed": 7,
                        "todaygen": 8.86,
                        "deviceid": 50
                    },
                    {
                        "id": "5688abfd28a39e40c438133a",
                        "timestamp": 1451797501,
                        "average": 7.479310344827587,
                        "todayfed": 7,
                        "todaygen": 5.9,
                        "deviceid": 50
                    },
                    {
                        "id": "56875a7d28a39e6439ea2ef8",
                        "timestamp": 1451711101,
                        "average": 7.788620689655173,
                        "todayfed": 7,
                        "todaygen": 2.87,
                        "deviceid": 50
                    },
                    {
                        "id": "568608fd28a39e079b45a2be",
                        "timestamp": 1451624701,
                        "average": 7.894482758620691,
                        "todayfed": 7,
                        "todaygen": 5.81,
                        "deviceid": 50
                    },
                    {
                        "id": "5684b77d28a39e34e7a1ae1d",
                        "timestamp": 1451538301,
                        "average": 8.001034482758621,
                        "todayfed": 7,
                        "todaygen": 2.81,
                        "deviceid": 50
                    },
                    {
                        "id": "568365fe28a39e5d7f9bfbd5",
                        "timestamp": 1451451902,
                        "average": 7.996896551724139,
                        "todayfed": 7,
                        "todaygen": 2.94,
                        "deviceid": 50
                    },
                    {
                        "id": "5682147d28a39e0972084060",
                        "timestamp": 1451365501,
                        "average": 7.690689655172414,
                        "todayfed": 7,
                        "todaygen": 17.7,
                        "deviceid": 50
                    },
                    {
                        "id": "5680c2fd28a39e2ee7e1bdb1",
                        "timestamp": 1451279101,
                        "average": 7.382068965517242,
                        "todayfed": 7,
                        "todaygen": 14.72,
                        "deviceid": 50
                    },
                    {
                        "id": "567f717d28a39e4e238e7893",
                        "timestamp": 1451192701,
                        "average": 7.0762068965517235,
                        "todayfed": 7,
                        "todaygen": 11.69,
                        "deviceid": 50
                    },
                    {
                        "id": "567e1ffe28a39e798857072b",
                        "timestamp": 1451106301,
                        "average": 6.876206896551723,
                        "todayfed": 7,
                        "todaygen": 8.65,
                        "deviceid": 50
                    },
                    {
                        "id": "567cce7d28a39e20b31593e7",
                        "timestamp": 1451019901,
                        "average": 6.778620689655171,
                        "todayfed": 7,
                        "todaygen": 5.72,
                        "deviceid": 50
                    },
                    {
                        "id": "567b7cfd28a39e4129a66463",
                        "timestamp": 1450933501,
                        "average": 6.780689655172412,
                        "todayfed": 7,
                        "todaygen": 2.85,
                        "deviceid": 50
                    },
                    {
                        "id": "567a2b7d28a39e6d2dac9196",
                        "timestamp": 1450847101,
                        "average": 6.988965517241379,
                        "todayfed": 7,
                        "todaygen": 8.95,
                        "deviceid": 50
                    },
                    {
                        "id": "5678d9fd28a39e14a370005f",
                        "timestamp": 1450760701,
                        "average": 7.193793103448274,
                        "todayfed": 7,
                        "todaygen": 5.98,
                        "deviceid": 50
                    },
                    {
                        "id": "5677887d28a39e40352b643f",
                        "timestamp": 1450674301,
                        "average": 7.401034482758619,
                        "todayfed": 7,
                        "todaygen": 2.91,
                        "deviceid": 50
                    },
                    {
                        "id": "567636fd28a39e6bc0aa601d",
                        "timestamp": 1450587901,
                        "average": 7.505862068965515,
                        "todayfed": 7,
                        "todaygen": 2.77,
                        "deviceid": 50
                    },
                    {
                        "id": "5674e57d28a39e442b9d42ef",
                        "timestamp": 1450501501,
                        "average": 7.189655172413791,
                        "todayfed": 7,
                        "todaygen": 11.93,
                        "deviceid": 50
                    },
                    {
                        "id": "567393fd28a39e02c43df643",
                        "timestamp": 1450415101,
                        "average": 6.977241379310343,
                        "todayfed": 7,
                        "todaygen": 8.94,
                        "deviceid": 50
                    },
                    {
                        "id": "5672427d28a39e28c8dbc8ae",
                        "timestamp": 1450328701,
                        "average": 6.8744827586206885,
                        "todayfed": 7,
                        "todaygen": 5.89,
                        "deviceid": 50
                    },
                    {
                        "id": "5670f0fd28a39e47cf18c2f1",
                        "timestamp": 1450242301,
                        "average": 6.797241379310343,
                        "todayfed": 7,
                        "todaygen": 2.84,
                        "deviceid": 50
                    },
                    {
                        "id": "566f9f7d28a39e1cde3bd370",
                        "timestamp": 1450155901,
                        "average": 6.598620689655171,
                        "todayfed": 7,
                        "todaygen": 14.76,
                        "deviceid": 50
                    },
                    {
                        "id": "566e4dfd28a39e220e055864",
                        "timestamp": 1450069501,
                        "average": 6.50206896551724,
                        "todayfed": 7,
                        "todaygen": 11.8,
                        "deviceid": 50
                    },
                    {
                        "id": "566cfc7e28a39e3a6b43ffba",
                        "timestamp": 1449983102,
                        "average": 6.508275862068964,
                        "todayfed": 7,
                        "todaygen": 8.82,
                        "deviceid": 50
                    },
                    {
                        "id": "566baafd28a39e1b06db3482",
                        "timestamp": 1449896701,
                        "average": 6.615862068965516,
                        "todayfed": 7,
                        "todaygen": 5.88,
                        "deviceid": 50
                    },
                    {
                        "id": "566a597d28a39e32d56c12e7",
                        "timestamp": 1449810301,
                        "average": 6.827931034482757,
                        "todayfed": 7,
                        "todaygen": 2.85,
                        "deviceid": 50
                    },
                    {
                        "id": "566907fd28a39e366fe8d6b2",
                        "timestamp": 1449723901,
                        "average": 7.040344827586205,
                        "todayfed": 7,
                        "todaygen": 2.84,
                        "deviceid": 50
                    },
                    {
                        "id": "5667b67d28a39e02d96eda5d",
                        "timestamp": 1449637501,
                        "average": 7.286551724137929,
                        "todayfed": 7,
                        "todaygen": 5.86,
                        "deviceid": 50
                    },
                    {
                        "id": "566664fd28a39e75131c918f",
                        "timestamp": 1449551101,
                        "average": 7.498275862068963,
                        "todayfed": 7,
                        "todaygen": 2.86,
                        "deviceid": 50
                    },
                    {
                        "id": "5665137d28a39e20ee29a2e1",
                        "timestamp": 1449464701,
                        "average": 7.711379310344826,
                        "todayfed": 7,
                        "todaygen": 2.82,
                        "deviceid": 50
                    },
                    {
                        "id": "5663c1fd28a39e400a2e7b81",
                        "timestamp": 1449378301,
                        "average": 7.356071428571428,
                        "todayfed": 7,
                        "todaygen": 17.66,
                        "deviceid": 50
                    },
                    {
                        "id": "5662707d28a39e56bfbb7810",
                        "timestamp": 1449291901,
                        "average": 7.081111111111111,
                        "todayfed": 7,
                        "todaygen": 14.78,
                        "deviceid": 50
                    },
                    {
                        "id": "56611efd28a39e7086f8bac4",
                        "timestamp": 1449205501,
                        "average": 6.898076923076923,
                        "todayfed": 7,
                        "todaygen": 11.84,
                        "deviceid": 50
                    },
                    {
                        "id": "565fcd7d28a39e034b4f07bd",
                        "timestamp": 1449119101,
                        "average": 6.8187999999999995,
                        "todayfed": 7,
                        "todaygen": 8.88,
                        "deviceid": 50
                    },
                    {
                        "id": "565e7bfd28a39e3c88b24ec1",
                        "timestamp": 1449032701,
                        "average": 6.857083333333333,
                        "todayfed": 7,
                        "todaygen": 5.9,
                        "deviceid": 50
                    },
                    {
                        "id": "565d2a7d28a39e30cfad63d9",
                        "timestamp": 1448946301,
                        "average": 7.032608695652174,
                        "todayfed": 7,
                        "todaygen": 2.82,
                        "deviceid": 50
                    },
                    {
                        "id": "565bd8fd28a39e40b0cf67a7",
                        "timestamp": 1448859901,
                        "average": 6.951363636363637,
                        "todayfed": 7,
                        "todaygen": 8.82,
                        "deviceid": 50
                    },
                    {
                        "id": "565a877d28a39e5d6f537347",
                        "timestamp": 1448773501,
                        "average": 7.007619047619047,
                        "todayfed": 7,
                        "todaygen": 5.77,
                        "deviceid": 50
                    },
                    {
                        "id": "565935fe28a39e0cfcb628d8",
                        "timestamp": 1448687102,
                        "average": 7.2170000000000005,
                        "todayfed": 7,
                        "todaygen": 2.82,
                        "deviceid": 50
                    },
                    {
                        "id": "5657e47e28a39e2c93375015",
                        "timestamp": 1448600702,
                        "average": 7.446842105263158,
                        "todayfed": 7,
                        "todaygen": 2.85,
                        "deviceid": 50
                    },
                    {
                        "id": "565692fd28a39e65f5ed455b",
                        "timestamp": 1448514301,
                        "average": 7.699999999999999,
                        "todayfed": 7,
                        "todaygen": 2.89,
                        "deviceid": 50
                    },
                    {
                        "id": "5655417d28a39e016c5c5785",
                        "timestamp": 1448427901,
                        "average": 7.981764705882353,
                        "todayfed": 7,
                        "todaygen": 2.91,
                        "deviceid": 50
                    },
                    {
                        "id": "5653effd28a39e1d8a88bbdf",
                        "timestamp": 1448341501,
                        "average": 7.543749999999999,
                        "todayfed": 7,
                        "todaygen": 14.99,
                        "deviceid": 50
                    },
                    {
                        "id": "56529e7d28a39e359e7667db",
                        "timestamp": 1448255101,
                        "average": 7.252,
                        "todayfed": 7,
                        "todaygen": 11.92,
                        "deviceid": 50
                    },
                    {
                        "id": "56514cfd28a39e57bff7871b",
                        "timestamp": 1448168701,
                        "average": 7.132857142857143,
                        "todayfed": 7,
                        "todaygen": 8.92,
                        "deviceid": 50
                    },
                    {
                        "id": "564ffb7d28a39e77c385306a",
                        "timestamp": 1448082301,
                        "average": 7.234615384615385,
                        "todayfed": 7,
                        "todaygen": 5.81,
                        "deviceid": 50
                    },
                    {
                        "id": "564ea9fd28a39e28147f2b96",
                        "timestamp": 1447995901,
                        "average": 7.607499999999999,
                        "todayfed": 7,
                        "todaygen": 2.76,
                        "deviceid": 50
                    },
                    {
                        "id": "564d587d28a39e55aedd48e5",
                        "timestamp": 1447909501,
                        "average": 8.046363636363635,
                        "todayfed": 7,
                        "todaygen": 2.78,
                        "deviceid": 50
                    },
                    {
                        "id": "564c06fd28a39e03598175df",
                        "timestamp": 1447823101,
                        "average": 8.559999999999999,
                        "todayfed": 7,
                        "todaygen": 2.91,
                        "deviceid": 50
                    },
                    {
                        "id": "564b081028a39e7e7143a46b",
                        "timestamp": 1447757840,
                        "average": 9,
                        "todayfed": 7,
                        "todaygen": 0.6,
                        "deviceid": 50
                    },
                    {
                        "id": "564ac38e28a39e38f3059a58",
                        "timestamp": 1447740302,
                        "average": 21,
                        "todayfed": 7,
                        "todaygen": 9,
                        "deviceid": 50
                    },
                    {
                        "id": "5649720d28a39e65f58276a4",
                        "timestamp": 1447653901,
                        "average": 29,
                        "todayfed": 7,
                        "todaygen": 9,
                        "deviceid": 50
                    },
                    {
                        "id": "5648208d28a39e0bb3d4ea41",
                        "timestamp": 1447567501,
                        "average": 0,
                        "todayfed": 7,
                        "todaygen": 9,
                        "deviceid": 50
                    },
                    {
                        "id": "5646cf0d28a39e2af344afb8",
                        "timestamp": 1447481101,
                        "average": 7,
                        "todayfed": 7,
                        "todaygen": 9,
                        "deviceid": 50
                    },
                    {
                        "id": "56457d8d28a39e561e448c46",
                        "timestamp": 1447394701,
                        "average": 17,
                        "todayfed": 7,
                        "todaygen": 9,
                        "deviceid": 50
                    },
                    {
                        "id": "56442f1a28a39e5716caff3a",
                        "timestamp": 1447309082,
                        "average": 10,
                        "todayfed": 7,
                        "todaygen": 9,
                        "deviceid": 50
                    },
                    {
                        "id": "5631b40328a39e158e6b43ad",
                        "timestamp": 1446097923,
                        "average": 13,
                        "todayfed": 11,
                        "todaygen": 13,
                        "deviceid": 50
                    },
                    {
                        "id": "5630cee928a39e5faa351e69",
                        "timestamp": 1446039273,
                        "average": 11,
                        "todayfed": 7,
                        "todaygen": 9,
                        "deviceid": 50
                    },
                    {
                        "id": "562211d79369fc39348b4569",
                        "deviceid": 50,
                        "todaygen": 9,
                        "todayfed": 7,
                        "average": 11,
                        "timestamp": 1445072553
                    },
                    {
                        "id": "5621f05d40755902ae71a845",
                        "pv_voltage": 10
                    }
                ];

                $scope.lineData.datasets[0].data = [];
                $scope.lineData.labels = [];
                var i = 0;
                $scope.data.forEach(function (item, index) {
                    if (('average' in item) && (isNumeric(item.average))) {
                        console.log('i = ' + i + ' val=' + item.average);
                        $scope.lineData.datasets[0].data.push(item.average);
                        $scope.lineData.labels.push(i);
                        i = i + 1;
                    }
                    else {
                        console.log('warn: record is not field or not numeric! ' + item);
                    }
                });
            };

        }])


.factory('testFactory', function(){
        return {
            sayHello: function(text){
                return "Factory says \"Hello " + text + "\"";
            },
            sayGoodbye: function(text){
                return "Factory says \"Goodbye " + text + "\"";
            }
        }
    })


.controller('ModalInstanceCtrl2', function ($scope, $uibModalInstance, collectionForm) {
        $scope.collectionForm = collectionForm;
        $scope.ok = function () {
            $uibModalInstance.close($scope.collectionForm);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });