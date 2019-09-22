module.exports = function(app) {
  require("./modal.less");

  var cancelBookingModalController = function($scope, $sce, dataFactory, $uibModal,$uibModalInstance, items, globalConstants) {
    var vm = this;

    //from items
    vm.title = items.title;
    vm.text = items.text;
    vm.closeOnTop = items.closeOnTop;
    vm.showHeader = items.showHeader!==undefined?items.showHeader:true;
    vm.cancelBookingSuccessFunc = items.cancelBookingSuccessFunc;
    
    vm.showFooter = false;
    vm.cancel = cancel;
    vm.ppnBundle = undefined;
    vm.hasValidPPNBundle = undefined;
    vm.yesCancelBooking = yesCancelBooking;
    vm.isCancelBookingConfirmed = false;
    vm.init = init;
    vm.globalConstants = globalConstants;
    
    vm.init();

    function init() {
      vm.ppnBundle = items.ppnBundle;
      if (!vm.ppnBundle || vm.ppnBundle === '') {
        vm.showHeader = false;
        vm.hasValidPPNBundle = false;
        vm.showFooter = true;   //so that user can click Done to exit modal
        return;
      }
      vm.hasValidPPNBundle = true;
    }

    function cancel() {
      $uibModalInstance.close(true);
    }
    function yesCancelBooking() {
      vm.isCancelBookingConfirmed = true;

      //cancel booking
      var succesFunc = function(response) {

        //todo: test this!
        if (response.data.data.getHotelCancelRequest.results.status !== 'Success') {
            vm.hasValidPPNBundle = false;
        }

        vm.title = "Booking Cancelled";
        vm.showHeader = true;
        vm.showFooter = true;
        vm.cancelBookingSuccessFunc();
      };

      var errFunc = function(response) {
//todo:
      };
      var params = {
          ppn_bundle: encodeURI(vm.ppnBundle)
      };
      dataFactory.cancelBooking(params).then(succesFunc,errFunc);
    }

  };

  cancelBookingModalController.$inject = ['$scope','$sce','dataFactory','$uibModal','$uibModalInstance','items','globalConstants'];
  app.controller('cancelBookingModalController', cancelBookingModalController);
};