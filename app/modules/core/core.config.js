(function() {
    'use strict';

    angular
        .module('app.core')
        // version of this seed app is compatible with angularFire 1.0.0
        // see tags for other versions: https://github.com/firebase/angularFire-seed/tags
        .constant('version', '1.0.0')
        // where to redirect users if they need to authenticate (see security.js)
        .constant('loginRedirectPath', '/page/login')
        // your Firebase data URL goes here, no trailing slash
        .constant('FBURL', 'https://everythingio.firebaseio.com')  //intense-heat-2780.firebaseio.com
        .config(coreConfig);

    coreConfig.$inject = ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$animateProvider'];
    function coreConfig($controllerProvider, $compileProvider, $filterProvider, $provide, $animateProvider){

      var core = angular.module('app.core');
      // registering components after bootstrap
      core.controller = $controllerProvider.register;
      core.directive  = $compileProvider.directive;
      core.filter     = $filterProvider.register;
      core.factory    = $provide.factory;
      core.service    = $provide.service;
      core.constant   = $provide.constant;
      core.value      = $provide.value;

      // Disables animation on items with class .ng-no-animation
      $animateProvider.classNameFilter(/^((?!(ng-no-animation)).)*$/);

    }

})();