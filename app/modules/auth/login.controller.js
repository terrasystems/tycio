"use strict";
angular.module('app.core')

.controller('LoginController', ['$scope', '$state', 'Auth', '$location', 'fbutil', '$log', '$rootScope',
            function($scope, $state, Auth, $location, fbutil, $log, $rootScope) {
    $scope.account = {
        email: null,
        password: null
    };
    $scope.confirm = null;
    $scope.createMode = false;

    $scope.login = function() {
        $scope.err = null;
        Auth.$authWithPassword({
            email: $scope.account.email,
            password: $scope.account.password
        }, {
            rememberMe: $scope.account.remember
        })
        .then(function(user) {
           $rootScope.userObj = user;
           $state.go('app.dashboard');
        }, function(err) {
           $scope.authMsg = errMessage(err);
           $log.error(err);
        });
    };

    $scope.createAccount = function() {
        $scope.authMsg = null;
        if (assertValidAccountProps()) {
            var email = $scope.account.email;
            var pass = $scope.account.password;
            // create user credentials in Firebase auth system
            Auth.$createUser({
                    email: email,
                    password: pass
                })
                .then(function() {
                    // authenticate so we have permission to write to Firebase
                    return Auth.$authWithPassword({
                        email: email,
                        password: pass
                    });
                })
                .then(function(user) {
                    // create a user profile in our data store
                    var ref = fbutil.ref('users', user.uid);
                    $rootScope.userObj = user;
                    return fbutil.handler(function(cb) {
                        ref.set({
                            email: email,
                            name: name || firstPartOfEmail(email)
                        }, cb);
                    });
                })
                .then(function( /* user */ ) {
                    // redirect to the account page
                    $state.go('app.dashboard');
                }, function(err) {
                    $scope.authMsg = errMessage(err);
                });
        }
    };

    // expose logout function to scope
    $scope.logout = function() {
        Auth.$unauth();
        $rootScope.userObj = undefined;
        $state.go('page.login');
    };

    function assertValidAccountProps() {
        if (!$scope.account.email) {
            $scope.authMsg = 'Please enter an email address';
            $log.error($scope.authMsg);
        } else if (!$scope.account.password || !$scope.account.account_password_confirm) {
            $scope.authMsg = 'Please enter a password';
            $log.error($scope.authMsg);
        } else if ($scope.account.password !== $scope.account.account_password_confirm) {
            $scope.authMsg = 'Passwords do not match';
            $log.error($scope.authMsg);
        }
        return !$scope.authMsg;
    }

    function errMessage(err) {
        return angular.isObject(err) && err.code ? err.code : err + '';
    }

    function firstPartOfEmail(email) {
        return ucfirst(email.substr(0, email.indexOf('@')) || '');
    }

    function ucfirst(str) {
        // inspired by: http://kevin.vanzonneveld.net
        str += '';
        var f = str.charAt(0).toUpperCase();
        return f + str.substr(1);
    }
}]);
