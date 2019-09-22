module.exports = function(app) {
    var forumAuthController = function ($stateParams,$window,$location) {

        var vm = this;
        
        vm.destination = $stateParams.destination;

        vm.init = init;

        vm.init();

        function init() {

        	//ensure we have a post forum auth location
        	if (!vm.destination || vm.destination==='') {
        		vm.destination = $location.absUrl();
        	}

        	//initiate forum auth
//todo: adjust based on environment
			var url = 'https://community.accessiblego.com/session/sso?return_path='+vm.destination;
        	$window.open(url, '_self');
        }
    };

    forumAuthController.$inject = ['$stateParams','$window','$location'];
    app.controller('forumAuthController', forumAuthController);
};
