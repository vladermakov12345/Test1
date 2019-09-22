module.exports = function(app) {
    var signoutController = function ($rootScope,$window,$stateParams,authService,AUTH_EVENTS,environmentService) {
		var vm = this;
		vm.env = environmentService();

		vm.message = '';
        vm.init = init;
        vm.getContext = getContext;

        vm.init();

        function init() {

			//authService.logout();
			$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);

			var context = $stateParams.c;

			//display
			switch (context) {
				case 'u':
					vm.message = 'You are now signed out.';
					break;
				case 'i':
					vm.message = 'For security and privacy reasons, you have been automatically signed out due to a period of inactivity.';
					break;
				default:
					vm.message = 'You are signed out.';
					break;
			}

			//sessionstack
			angular.element(document).ready(function() {
				if (vm.env.name === 'production') {
					$window.SessionStack.stop();	//stop recording
					$window.SessionStack.identify(false);	//clear cookie of identified user
				}
			});
		}

        function getContext() {
        	return utilities.getParameterByName('c');
        }
    };

    signoutController.$inject = ['$rootScope','$window','$stateParams','authService','AUTH_EVENTS','environmentService'];
    app.controller('signoutController', signoutController);
};