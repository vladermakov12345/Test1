module.exports = function(app) {
    var setemailaddressController = function ($rootScope, $state, dataFactory, localStorageService) {
		var vm = this;
        vm.pageIsRelevant = false;
        vm.emailSet = false;
        vm.emailAddress = '';
        vm.errs = [];

        vm.init = init;
        vm.setIsPageRelevant = setIsPageRelevant;
        vm.submitEmailAddress = submitEmailAddress;
        vm.cont = cont;

        vm.init();

        function init() {

            vm.setIsPageRelevant();

            //meta tags
            $rootScope.metaTagService.setup({
                googleBotIndex: 'noindex'
            });
        }

        function setIsPageRelevant() {
            vm.pageIsRelevant = $rootScope.promptForEmail();
        }

        function submitEmailAddress() {
            vm.errs = [];
            
            var successCB = function(response) {
                if (response.data.status === 'success') {

                    //reset for current session
                    var profile = localStorageService.getUserProfile();
                    profile["https://accessiblego/app_metadata"].email_override = vm.emailAddress;
                    localStorageService.setUserProfile(profile);

                    //reflect
                    vm.emailSet = true;

                    return;
                }

                //handle fail case
                vm.errs.push("Unable to update email at this time");
            };
            var errorCB = function(errObj) {
                console.log(errObj);
            };

            var params = {
                email: vm.emailAddress
            };

            dataFactory.setUserEmail(params).then(successCB,errorCB);
        }

        function cont() {
            $state.go('home');
        }
    };

    setemailaddressController.$inject = ['$rootScope','$state','dataFactory', 'localStorageService'];
    app.controller('setemailaddressController', setemailaddressController);
};
