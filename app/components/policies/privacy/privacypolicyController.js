module.exports = function(app) {
  var privacypolicyController = function($rootScope ,$scope, $sce) {
    var vm = this;

    //vm.text = require("./privacy.html");

    // vm.getAsHtml = getAsHtml;
    // function getAsHtml() {
    //   return $sce.trustAsHtml(vm.text);
    // }

    //setup meta tags
    var title = 'Privacy Policy';
    var desc = 'Privacy Policy';
    $rootScope.metaTagService.setup({
        metaTitle: title,
        ogTitle: title,
        twitterTitle: title,
        twitterImageAlt: title,
        ogDescription: desc,
        twitterDescription: desc,
    });

  };

  privacypolicyController.$inject = ['$rootScope','$scope','$sce'];
  app.controller('privacypolicyController', privacypolicyController);
};