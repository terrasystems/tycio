'use strict';

angular.module('app.core')

.controller('CollectionsController', ['$scope', 'Auth', 'fbutil', '$state', '$rootScope', '$firebaseArray', 'FBURL', '$uibModal',
        function ($scope, Auth, fbutil, $state, $rootScope, $firebaseArray, FBURL, $uibModal) {

   if (!$rootScope.userObj) {
      $state.go('page.login');
      return;
   };

   collections();

   //var ref = fbutil.ref('users', $rootScope.userObj.uid);
   //ref.child('collections').set(
   //    [
   //        {
   //            "Title": "Collection #1",
   //            "IDs": [1,2,3]
   //        },
   //        {
   //            "Title": "Collection #2",
   //            "IDs": [4,5,6]
   //        },
   //        {
   //            "Title": "Collection #3",
   //            "IDs": [7,8,9]
   //        }
   //    ]
   //);

   $scope.streams = [];
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
       console.log('I = '+index);
      if (index >= 0 && _.isArray($scope.collections) && index <= $scope.collections.length) {
         $scope.collections.$remove(index);
      }
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

   function collections() {
      console.log('collections ..');
   };


   function getStreams(collections) {
       var arr = [], IDs = [];
       console.log('collection(s) : '+collections.length);

       if (collections.length>0) {
           var ref = new Firebase(FBURL);
           var streams = $firebaseArray(ref.child('users').child($rootScope.userObj.uid).child('streams'));

           streams.$loaded()
               .then(function (data) {
                   collections.forEach(function(collection, index) {
                       arr[index] = [];
                       if  (('IDs' in collection) && (_.isArray(collection.IDs)) ) {
                           IDs = collection.IDs;
                           IDs.forEach(function (id, index2) {
                               var x = angular.copy(data.$getRecord(id));
                               arr[index].push(x);
                           });
                           arr[index] = _.compact(arr[index]);
                       }
                   });
                   $scope.streams =  arr;
               })
               .catch(function (error) {
                   console.error("Error:", error);
               });
       }
   };

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