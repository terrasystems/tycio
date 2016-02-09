'use strict';

angular.module('app.core')

.controller('CollectionsController', ['$scope', 'Auth', 'fbutil', '$state', '$rootScope', function ($scope, Auth, fbutil, $state, $rootScope) {

   if (!$rootScope.userObj) {
      $state.go('page.login');
      return;
   };

   function collections() {
      console.log('collections ..');
   }

}]);