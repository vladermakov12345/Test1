module.exports = function(app) {
    var ssoCBController = function ($stateParams,$window,$location,localStorageService,angularAuth0,loginModalService,guid,environmentService) {

        var vm = this;
        vm.env = environmentService();
        
        vm.destination = $stateParams.destination;

        vm.init = init;

        vm.init();

        function init() {
            debugger;
            vm.message = 'test';
            return;

        	//ensure we have a post forum auth location
        	if (!vm.destination || vm.destination==='') {
        		vm.destination = $location.absUrl();
        	}

            //check if we are already signed in
            //checkSession

        	//initiate forum auth
//todo: adjust based on environment
			var url = 'https://community.accessiblego.com/session/sso?return_path='+vm.destination;
        	$window.open(url, '_self');
            //authorize?client_id=IgHu6fqiEEEbbOtY5wMqkHp0LrgnF6Ex&response_type=token&redirect_uri=https://community.accessiblego.com/session/sso
        }
        
    };

    ssoCBController.$inject = ['$stateParams','$window','$location','localStorageService','angularAuth0','loginModalService','guid','environmentService'];
    app.controller('ssoCBController', ssoCBController);
};
