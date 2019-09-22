module.exports = function(app) {
    var passchangedController = function ($rootScope, $stateParams) {
		var vm = this;
        vm.message = $stateParams.message;

        //meta tags
        $rootScope.metaTagService.setup({
            googleBotIndex: 'noindex'
        });
    };

    passchangedController.$inject = ['$rootScope','$stateParams'];
    app.controller('passchangedController', passchangedController);
};
