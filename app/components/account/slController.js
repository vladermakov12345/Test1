//headless controller for auth0 landing, tracking, and redirecting
module.exports = function(app) {
    var slController = function ($state, localStorageService) {

        var vm = this;
        vm.init = init;
        vm.origin_path = '';
        vm.origin_absurl = '';

        vm.init();

        function init() {
            //which is the correct stuff?
            vm.origin_path = $state.params.origin_path;
            vm.origin_absurl = $state.params.origin_absurl;

            //resume where user was at
            var preloginstate = localStorageService.getPreLoginState();

            //should never happen!
            if (preloginstate === null) {
                console.log('predefined login state not available - please logout, refresh app and try again.');
                return;
            }

            //$state.go(preloginstate.path, preloginstate.params);
        }

    };

    slController.$inject = ['$state','localStorageService'];
    app.controller('slController', slController);
};
