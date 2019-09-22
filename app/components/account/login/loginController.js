module.exports = function(app) {
    var loginController = function ($rootScope,$state,$stateParams,loginModalService,localStorageService,redirectionService) {
		var vm = this;

		vm.init = init;
		vm.launchLoginModal = launchLoginModal;
		vm.setupMetaTags = setupMetaTags;
		vm.isAuthenticated = localStorageService.getAuthenticationState();

		vm.init();
		
		function init() {
			vm.launchLoginModal();
			vm.setupMetaTags();
		}

		function launchLoginModal() {
			var params = {
				onSuccess: function() {
					//todo: redirectionservice should handle from here
				}
			};

			if ($stateParams.r === 'discourse') {
				//remove any existing app redirection
				redirectionService.removeRedirect();
				//redirect to subdomain :: discourse
				localStorageService.setPreLoginState('discourse');

				params.text = {
					heading: 'Come on in!',
                    subHeadingJoin: 'Create an account to join the travel forum',
                    subHeadingLogin: 'Log in to join the travel forum'
				};
			}

			loginModalService(params);
		}

		function setupMetaTags() {
            var title = 'Accessible Travel Made Smart - login';
            $rootScope.metaTagService.setup({
            	metaTitle: title,
	            googleBotIndex: 'noindex'
	        });
		}
    };

    loginController.$inject = ['$rootScope','$state','$stateParams','loginModalService','localStorageService','redirectionService'];
    app.controller('loginController', loginController);
};