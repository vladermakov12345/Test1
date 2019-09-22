module.exports = function(app) {
    var embeddedController = function ($stateParams, localStorageService,travelersClubModalService, loginModalService) {
        var vm = this;
        vm.init = init;
        vm.redirect = 'start';
        vm.isAuthenticated = localStorageService.getAuthenticationState();
vm.openTravelersClubModalService = openTravelersClubModalService;

        vm.init();

        function init() {

        	//TODO: redirect
            if ($stateParams.r) {
                vm.redirect = $stateParams.r;
            }

            //handle forum signin (separeate to its own concern?)
            if (vm.redirect === 'discourse') {
                localStorageService.setPreLoginState('discourse');
            }

            loginModalService();

            //TODO: handle case where http://localhost:3000/signin?r=accountPageUi
            //b/c it still goes to forum
            
            //vm.isAuthenticated = localStorageService.getAuthenticationState();

            //$window.location.href = $stateParams.r;
        }

        function openTravelersClubModalService() {
            travelersClubModalService();
        }
    };

    embeddedController.$inject = ['$stateParams', 'localStorageService','travelersClubModalService', 'loginModalService'];
    app.controller('embeddedController', embeddedController);
};
