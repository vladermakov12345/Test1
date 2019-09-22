module.exports = function(app) {
  require("./modal.less");

  var modalController = function($scope, $sce, dataFactory, $uibModal,$uibModalInstance, items) {
    var vm = this;

    vm.title = items.title;
    vm.text = items.text;
    vm.closeOnTop = items.closeOnTop;
    vm.showHeader = items.showHeader!==undefined?items.showHeader:true;
    vm.showFooter = items.showFooter!==undefined?items.showFooter:true;
    vm.cancel = cancel;
    vm.getAsHtml = getAsHtml;

    function cancel() {
      $uibModalInstance.close(true);
    }
    function getAsHtml() {
      return $sce.trustAsHtml(vm.text);
    }

  };

  modalController.$inject = ['$scope','$sce','dataFactory','$uibModal','$uibModalInstance','items'];
  app.controller('modalController', modalController);
};