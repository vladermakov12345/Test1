module.exports = function(app) {
    var joinController = function ($state,joinModalService,localStorageService,$stateParams,redirectionService) {
		var vm = this;

		vm.init = init;
		vm.launchJoinModal = launchJoinModal;
		vm.isAuthenticated = localStorageService.getAuthenticationState();

		vm.init();
		
		function init() {
			//determine text
			if ($stateParams.r === 'discourse') {
				//remove any existing app redirection
				redirectionService.removeRedirect();
				//redirect to subdomain :: discourse
				localStorageService.setPreLoginState('discourse');
			}

			//launch modal
			vm.launchJoinModal();	
		}

		function launchJoinModal() {
			var params = {
				onSuccess: function() {
					//todo: redirectionservice should handle from here
				},
				text: {

				}
			};
			joinModalService(params);
		}        
    };

    joinController.$inject = ['$state','joinModalService','localStorageService','$stateParams','redirectionService'];
    app.controller('joinController', joinController);
};