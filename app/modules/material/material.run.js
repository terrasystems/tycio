(function() {
    'use strict';
    // Used only for the BottomSheetExample
    angular
        .module('app.material')
        .run(materialRun)
        ;
    materialRun.$inject = ['$http', '$templateCache'];
    function materialRun($http, $templateCache){
      var urls = [
        'img/icons/share-arrow.svg',
        'img/icons/upload.svg',
        'img/icons/copy.svg',
        'img/icons/print.svg',
        'img/icons/hangout.svg',
        'img/icons/mail.svg',
        'img/icons/message.svg',
        'img/icons/copy2.svg',
        'img/icons/facebook.svg',
        'img/icons/twitter.svg'
      ];

      angular.forEach(urls, function(url) {
        $http.get(url, {cache: $templateCache});
      });

    }

})();
