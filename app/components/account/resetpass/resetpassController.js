module.exports = function(app) {
    var resetpassController = function ($state,resetPassModalService) {
		var vm = this;

		vm.init = init;
		vm.launchResetPassModal = launchResetPassModal;

		vm.init();
		
		function init() {
			vm.launchResetPassModal();	
		}

		function launchResetPassModal() {
			var params = {
				onSuccess: function() {
					$state.go('home');
				}
			};
			resetPassModalService(params);
		}        
    };

    resetpassController.$inject = ['$state','resetPassModalService'];
    app.controller('resetpassController', resetpassController);
};