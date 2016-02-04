"use strict";
angular.module('app.core')

.controller('LoginController', ['$scope', '$state', 'Auth', '$location', 'fbutil', '$log', function($scope, $state, Auth, $location, fbutil, $log) {
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
                rememberMe: true
            })
            .then(function(user) {
                $state.go('app.dashboard');
            }, function(err) {
                $scope.authMsg = errMessage(err);
                $log.error(err);
            });
    };

    $scope.createAccount = function() {
        $scope.authMsg = null;
        if (assertValidAccountProps()) {
            var email = $scope.email;
            var pass = $scope.pass;
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
        // if (unbind) {
        //     unbind();
        // }
        //profile.$destroy();
        Auth.$unauth();
        $state.go('page.login');
    };

    function assertValidAccountProps() {
        if (!$scope.email) {
            $scope.err = 'Please enter an email address';
        } else if (!$scope.pass || !$scope.confirm) {
            $scope.err = 'Please enter a password';
        } else if ($scope.createMode && $scope.pass !== $scope.confirm) {
            $scope.err = 'Passwords do not match';
        }
        return !$scope.err;
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
