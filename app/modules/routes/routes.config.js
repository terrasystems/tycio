/**=========================================================
 * Module: config.js
 * App routes and resources configuration
 =========================================================*/


(function() {
    'use strict';

    angular
        .module('app.routes')
        .config(routesConfig);

    routesConfig.$inject = ['$stateProvider', '$locationProvider', '$urlRouterProvider', 'RouteHelpersProvider'];
    function routesConfig($stateProvider, $locationProvider, $urlRouterProvider, helper){

        // Set the following to true to enable the HTML5 Mode
        // You may have to set <base> tag in index and a routing configuration in your server
        $locationProvider.html5Mode(false);

        // defaults to dashboard
        $urlRouterProvider.otherwise('/app/dashboard');

        //
        // Application Routes
        // -----------------------------------
        $stateProvider
          .state('app', {
              url: '/app',
              abstract: true,
              templateUrl: helper.basepath('app.html'),
              resolve: helper.resolveFor('fastclick', 'modernizr', 'icons', 'screenfull', 'animo', 'sparklines', 'slimscroll', 'classyloader', 'toaster', 'whirl')
          })
          .state('app.dashboard', {
              url: '/dashboard',
              title: 'Dashboard',
              templateUrl: helper.basepath('dashboard.html'),
              resolve: helper.resolveFor('flot-chart','flot-chart-plugins', 'weather-icons')
          })
           .state('app.search', {
              url: '/search',
              title: 'Search',
              templateUrl: helper.basepath('search.html')
              //  ,resolve: helper.resolveFor('moment', 'localytics.directives', 'ui.bootstrap-slider')
            })
          .state('app.chart-flot', {
              url: '/chart-flot',
              title: 'Chart Flot',
              templateUrl: helper.basepath('chart-flot.html'),
              resolve: helper.resolveFor('flot-chart','flot-chart-plugins')
          })
          .state('app.chart-js', {
              url: '/chart-js',
              title: 'Chart JS',
              templateUrl: helper.basepath('chart-js.html'),
              resolve: helper.resolveFor('chartjs')
          })
          .state('app.chart-rickshaw', {
              url: '/chart-rickshaw',
              title: 'Chart Rickshaw',
              templateUrl: helper.basepath('chart-rickshaw.html'),
              resolve: helper.resolveFor('angular-rickshaw')
          })
          .state('app.chart-morris', {
              url: '/chart-morris',
              title: 'Chart Morris',
              templateUrl: helper.basepath('chart-morris.html'),
              resolve: helper.resolveFor('morris')
          })
          .state('app.chart-chartist', {
              url: '/chart-chartist',
              title: 'Chart Chartist',
              templateUrl: helper.basepath('chart-chartist.html'),
              resolve: helper.resolveFor('angular-chartist')
          })
          //
          // Single Page Routes
          // -----------------------------------
          .state('page', {
              url: '/page',
              templateUrl: 'pages/page.html',
              resolve: helper.resolveFor('modernizr', 'icons'),
              controller: ['$rootScope', function($rootScope) {
                  $rootScope.app.layout.isBoxed = false;
              }]
          })
          .state('page.login', {
              url: '/login',
              title: 'Login',
              templateUrl: 'pages/login.html'
          })
          .state('page.register', {
              url: '/register',
              title: 'Register',
              templateUrl: 'pages/register.html'
          })
          .state('page.recover', {
              url: '/recover',
              title: 'Recover',
              templateUrl: 'pages/recover.html'
          })
          .state('page.lock', {
              url: '/lock',
              title: 'Lock',
              templateUrl: 'pages/lock.html'
          })
          .state('page.404', {
              url: '/404',
              title: 'Not Found',
              templateUrl: 'pages/404.html'
          })

          ////////////////////////////////

          .state('app.prof', {
              url: '/prof',
              title: 'Profile',
              templateUrl: helper.basepath('prof.html')
              //  , resolve: helper.resolveFor('flatdoc')
            })
            .state('app.streams', {
                url: '/streams',
                title: 'Streams',
                templateUrl: helper.basepath('streams.html'),
                resolve: helper.resolveFor('oitozero.ngSweetAlert')
                //  , resolve: helper.resolveFor('flatdoc')
            })
            .state('app.collections', {
                url: '/collections',
                title: 'Collections',
                templateUrl: helper.basepath('collections.html'),
                resolve: helper.resolveFor('oitozero.ngSweetAlert')
                //  , resolve: helper.resolveFor('flatdoc')
            })
          ;

    } // routesConfig

})();
