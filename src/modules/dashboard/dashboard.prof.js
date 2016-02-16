'use strict';

angular.module('app.core')

    .controller('ProfController', ['$scope', '$rootScope', '$state',
        function ($scope, $rootScope, $state) {

            $scope.userEmail = $rootScope.userObj.email;
            $scope.userUid = $rootScope.userObj.uid;
        }])
