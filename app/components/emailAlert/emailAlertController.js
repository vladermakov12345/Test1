module.exports = function(app) {

    var emailAlertController = function ($rootScope, $scope, localStorageService) {

        var vm = this;
        vm.init = init;
        vm.init();


        function init() {

            $scope.$watch( function() {

                var userAuth = localStorageService.getAuthenticationState();

                if(userAuth) {
                    var userProfile = localStorageService.getUserProfile();
                    var emailVer = userProfile.email_verified;

                    if (emailVer) {
                        angular.element('#email-alert').hide();
                    } else {
                        angular.element('#email-alert').show();
                    }
                } else {
                    angular.element('#email-alert').hide();
                }


            });


            function resendEmail() {

            }

        }

    };

    emailAlertController.$inject = ['$rootScope', '$scope', 'localStorageService'];
    app.controller('emailAlertController', emailAlertController);
};
