'use strict';

angular.module('app.core')

.controller('CollectionsController', ['$scope', 'Auth', 'fbutil', '$state', '$rootScope', '$firebaseArray', 'FBURL',
        function ($scope, Auth, fbutil, $state, $rootScope, $firebaseArray, FBURL) {

   if (!$rootScope.userObj) {
      $state.go('page.login');
      return;
   };

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

   var ref = new Firebase(FBURL);
   $scope.collections = $firebaseArray(ref.child('users').child($rootScope.userObj.uid).child('collections'));

   function collections() {
      console.log('collections ..');
   };

}]);