module.exports = function(app) {
    var mytripsController = function (authService) {

        var vm = this;

        vm.profile = {};
        vm.init = init;
        vm.trips = [];

        authService.getProfileDeferred().then(function (profile) {
		  vm.profile = profile;
		});

        vm.init();

        function init() {
            //load trip data
            //todo: create an api to load trips
            //vm.trips = 
        }
    };

    mytripsController.$inject = ['authService'];
    app.controller('mytripsController', mytripsController);
};
