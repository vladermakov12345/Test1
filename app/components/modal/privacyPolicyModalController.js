module.exports = function(app) {
  require("./modal.less");

  var privacyPolicyModalController = function($scope, $sce, dataFactory, $uibModal,$uibModalInstance, items) {
    var vm = this;

    vm.title = items.title;
    vm.closeOnTop = items.closeOnTop;
    vm.showHeader = items.showHeader!==undefined?items.showHeader:true;
    vm.showFooter = items.showFooter!==undefined?items.showFooter:true;
    vm.init = init;
    vm.cancel = cancel;
    vm.policy = {};
    vm.isReady = false;
    vm.isErr = false;

    vm.init();

    function init() {
      var successFunc = function (response) {
        vm.policy = response.data["getSharedPolicy.Hotel"].results.result.hotel_data.policy_data.policy_1;  //response.data.data;
        vm.isReady = true;
        vm.isErr = false;
      };
      var errFunc = function (response) {
        vm.isReady = true;
        vm.isErr = true;
      };

      dataFactory.getPrivacyPolicy().then(successFunc,errFunc); 
    }
    function cancel() {
      $uibModalInstance.close(true);
    }
  };

  privacyPolicyModalController.$inject = ['$scope','$sce','dataFactory','$uibModal','$uibModalInstance','items'];
  app.controller('privacyPolicyModalController', privacyPolicyModalController);
};