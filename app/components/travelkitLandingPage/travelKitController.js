module.exports = function (app) {
  var travelKitController = function ($rootScope, $scope, $state, $timeout, $filter, dataFactory, $stateParams, sessionService, utilities, $http, $window, $sce) {

    var vm = this;
    vm.init = init;

    require("./travelKit.less");   

	vm.init();

    function init() {   	
    }

  };

 travelKitController.$inject = ['$rootScope', '$scope', '$state', '$timeout', '$filter', 'dataFactory', '$stateParams', 'sessionService', 'utilities','$http','$window','$sce'];
  app.controller('travelKitController', travelKitController);
};
