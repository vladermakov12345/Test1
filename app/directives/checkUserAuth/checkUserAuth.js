(function() {

  //  var checkUserAuthController = function() {

  //       var vm = this;

  //       vm.init = init;

  // };

  // checkUserAuthController.$inject = [];

  var checkUserAuthFunc = function ($root, $location, localStorageService) { //$root, $loc, userSrv
     return {
      link: function (scope, elem, attrs, ctrl) {
        //register a callback in the $rootScope, for the $routeChangeStart event
        $root.$on('$stateChangeStart', function(e, curr, prev){
          // if (!prev.access.anonymous && !localStorageService.getAuthenticationState()) {
          //   e.preventDefault();
          //   $state.go('login');
          // }
        });
      }
    };
  };

  checkUserAuthFunc.$inject = ['$rootScope', '$location', 'localStorageService'];
  angular.module('app').directive('checkUserAuth', checkUserAuthFunc);
})();