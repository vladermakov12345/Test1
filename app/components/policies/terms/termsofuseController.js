module.exports = function(app) {
  var termsofuseController = function($rootScope,$scope, $sce) {
    var vm = this;

    // vm.text = require("./terms.html");
    // vm.getAsHtml = getAsHtml;
    // function getAsHtml() {
    //   return $sce.trustAsHtml(vm.text);
    // }

    //setup meta tags
    var title = 'Booking Terms of Use';
    var desc = 'Booking Terms of Use';
    $rootScope.metaTagService.setup({
        metaTitle: title,
        ogTitle: title,
        twitterTitle: title,
        twitterImageAlt: title,
        ogDescription: desc,
        twitterDescription: desc,
    });
  };

  termsofuseController.$inject = ['$rootScope','$scope','$sce'];
  app.controller('termsofuseController', termsofuseController);
};