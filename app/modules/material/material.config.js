
(function() {
    'use strict';
    // Used only for the BottomSheetExample
    angular
        .module('app.material')
        .config(materialConfig)
        ;
    materialConfig.$inject = ['$mdIconProvider'];
    function materialConfig($mdIconProvider){
      $mdIconProvider
        .icon('share-arrow', 'img/icons/share-arrow.svg', 24)
        .icon('upload', 'img/icons/upload.svg', 24)
        .icon('copy', 'img/icons/copy.svg', 24)
        .icon('print', 'img/icons/print.svg', 24)
        .icon('hangout', 'img/icons/hangout.svg', 24)
        .icon('mail', 'img/icons/mail.svg', 24)
        .icon('message', 'img/icons/message.svg', 24)
        .icon('copy2', 'img/icons/copy2.svg', 24)
        .icon('facebook', 'img/icons/facebook.svg', 24)
        .icon('twitter', 'img/icons/twitter.svg', 24);
    }
})();
