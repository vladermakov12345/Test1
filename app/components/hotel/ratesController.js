module.exports = function(app) {
    var ratesController = function ($state,$uibModalInstance, items) {
		var vm = this;

		vm.rateInfo = items.rate;
		vm.checkin = items.checkin;
		vm.checkout = items.checkout;
		vm.photos = [];

		vm.init = init;

		vm.init();

		function init() {
			$.each(vm.rateInfo.photo_data,function(idx,val) {
				vm.photos.push({ "Id": idx, url: val, "alt": "", description: ''});
			});
		}

		vm.requestContract = function(selectedRate) {

	        var bundle = selectedRate.ppn_bundle;

	        //sanity check
	        if (bundle === '') {
	          console.log('ppn bundle not found');
	          return;
	        }

	        var contractRequestParams = {
	          ppn_bundle: bundle
	        };

	        vm.cancel();
	        $state.go('reserve', contractRequestParams);
	     };
		
		// $ctrl.selected = {
		// item: $ctrl.items[0]
		// };

		// vm.ok = function () {
		// 	$uibModalInstance.close(true);
		// };

		vm.cancel = function () {
			$uibModalInstance.close(true);
		};


		vm.getWeekDays = getWeekDays;
		function getWeekDays() {
			return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
		}
		vm.getDayHeading = getDayHeading;
		function getDayHeading(idx) {
			return vm.addDays(vm.checkin,idx);
		}

		vm.addDays = addDays;
		function addDays(date, days) {
		  var result = new Date(date);
		  result.setDate(result.getDate() + days);
		  return result;
		}

		vm.subtractDays = subtractDays;
		function subtractDays(date, days) {
			var results = new Date(date);
			result.setDate(result.getDate() - days);
			return result;
		}

		vm.getBlankDaysPrior = getBlankDaysPrior;
		function getBlankDaysPrior() {
			if (!vm.checkin) return;
			return new Array(vm.checkin.getDay());
		}

		vm.hasBlankDaysAfter = hasBlankDaysAfter;
		function hasBlankDaysAfter() {
			if (!vm.checkout) return false;
			if (vm.checkout.getDay()===7) return false;
			return true;
		}

		vm.getBlankDaysAfter = getBlankDaysAfter;
		function getBlankDaysAfter() {
			if (!vm.checkout) return;
			return new Array(7-vm.checkout.getDay());
		}

		vm.resolvePolicyParagraph = resolvePolicyParagraph;
		function resolvePolicyParagraph(text) {
			text = text
				.replace("#START_OCCUPANCY#","")
				.replace("#END_OCCUPANCY#","<su>[1]</sup>")
				.replace("#START_PHOTO#","")
				.replace("#END_PHOTO#","");
			return text;
		}
    };

    ratesController.$inject = ['$state','$uibModalInstance', 'items'];
    app.controller('ratesController', ratesController);
};