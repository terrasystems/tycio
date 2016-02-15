'use strict';

angular.module('app.core')

    .controller('ProfController', ['$scope', '$rootScope', '$state',
        function ($scope, $rootScope, $state) {

            if (!$rootScope.userObj) {
                $state.go('page.login');
                return;
            }

            $scope.userEmail = $rootScope.userObj.password.email;
            $scope.userUid = $rootScope.userObj.uid;
        }])