(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('Auth', ['$firebaseAuth', 'fbutil', function($firebaseAuth, fbutil) {
            return $firebaseAuth(fbutil.ref());
        }])
        .run(appRun);

    appRun.$inject = ['$rootScope', '$state', '$stateParams', '$window', '$templateCache', 'Colors', 'Auth', 'loginRedirectPath', 'FBURL', '$timeout', '$location'];

    function appRun($rootScope, $state, $stateParams, $window, $templateCache, Colors, Auth, loginRedirectPath, FBURL, $timeout, $location) {

        // Set reference to access them from any scope
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.$storage = $window.localStorage;

        // Uncomment this to disable template cache
        // $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        //
        // });

        // Allows to use branding color with interpolation
        // {{ colorByName('primary') }}
        $rootScope.colorByName = Colors.byName;

        // cancel click event easily
        $rootScope.cancel = function($event) {
            $event.stopPropagation();
        };

        // Hooks Example
        // -----------------------------------

        // Hook not found
        $rootScope.$on('$stateNotFound',
            function(event, unfoundState /*, fromState, fromParams*/ ) {
                console.log(unfoundState.to); // "lazy.state"
                console.log(unfoundState.toParams); // {a:1, b:2}
                console.log(unfoundState.options); // {inherit:false} + default options
            });
        // Hook error
        $rootScope.$on('$stateChangeError',
            function(event, toState, toParams, fromState, fromParams, error) {
                console.log(error);
            });
        // Hook success
        $rootScope.$on('$stateChangeSuccess',
            function( /*event, toState, toParams, fromState, fromParams*/ ) {
                // display new view from top
                $window.scrollTo(0, 0);
                // Save the route title
                $rootScope.currTitle = $state.current.title;
                // if ((toState.name.indexOf('app.dashboard')>=0 || toState.name.indexOf('app.collections')>=0 || toState.name.indexOf('app.prof')>=0 || toState.name.indexOf('app.streams')>=0) && !Auth.$getAuth()) {
                //   $location.path('/page/login');
                // }
            });

        // Load a title dynamically
        $rootScope.currTitle = $state.current.title;
        $rootScope.pageTitle = function() {
            var title = $rootScope.app.name + ' - ' + ($rootScope.currTitle || $rootScope.app.description);
            document.title = title;
            return title;
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////
        var securedRoutes = ['/dashboard', '/streams', '/collections', '/prof'];
        // watch for login status changes and redirect if appropriate
        Auth.$onAuth(check);

        // some of our routes may reject resolve promises with the special {authRequired: true} error
        // this redirects to the login page whenever that is encountered
        $rootScope.$on('$routeChangeError', function(e, next, prev, err) {
            if (err === 'AUTH_REQUIRED') {
                $location.path(loginRedirectPath);
            }
        });

        function check(user) {
            if (!user && authRequired($location.path())) {
                console.log('check failed', user, $location.path()); //debug
                $location.path(loginRedirectPath);
            }
        }

        function authRequired(path) {
            console.log('authRequired?', path, securedRoutes.indexOf(path)); //debug
            return securedRoutes.indexOf(path) !== -1;
        }

        // track status of authentication
        Auth.$onAuth(function(user) {
            $rootScope.loggedIn = !!user;
        });


        // double check that the app has been configured before running it and blowing up space and time
        if( FBURL.match('//INSTANCE.firebaseio.com') ) {
          angular.element(document.body).html('<h1>Please configure app/config.js before running!</h1>');
          $timeout(function() {
            angular.element(document.body).removeClass('hide');
          }, 250);
        }
    }

})();
