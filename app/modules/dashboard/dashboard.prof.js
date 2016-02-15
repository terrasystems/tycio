'use strict';

angular.module('app.core')

    .controller('ProfController', ['$scope', '$rootScope', '$state',
        function ($scope, $rootScope, $state) {

            $scope.userEmail = $rootScope.userObj.password.email;
            $scope.userUid = $rootScope.userObj.uid;
        }])
