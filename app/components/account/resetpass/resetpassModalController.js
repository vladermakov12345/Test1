module.exports = function(app) {
    var resetpassModalController = function ($scope,authService,loginModalService,dataFactory,joinModalService) {
		var vm = this;

        vm.email = '';
        vm.submit = submit;
        vm.errors = [];
        vm.isSubmitted = false;
        vm.embedded = $scope.embedded || false;
        vm.IsEmbedded = IsEmbedded;
        vm.successMessage = '';
        vm.sendResetPasswordEmail = sendResetPasswordEmail;
        vm.showEmailNotExist = false;

        //-- navigation
        vm.closeModal = closeModal;
        vm.goToLogin = goToLogin;
        vm.goToSignUp = goToSignUp;


        function submit(){

            //reset
            vm.errors = [];
            vm.showEmailNotExist = false;

            //email specified?
            if (vm.email==='') {
                vm.errors.push('Please specify the email address');
            }

            //any errors?
            if (vm.errors.length>0)
                return;

            //check email address and send reset password email
            var thenFunc = function(result) {
                
                //email does not exist
                if (result.data.data === false) {
                    vm.showEmailNotExist = true;
                    return;
                }

                vm.sendResetPasswordEmail();
            };
            dataFactory.isUserExist(vm.email).then(thenFunc,thenFunc);
            
        }

        function sendResetPasswordEmail() {
            var changePasswordCallback = function(err, successMessage) {
                if (err) {
                    vm.errors.push(err);
                    return;
                }

                vm.isSubmitted = true;
                vm.successMessage = successMessage;        
            };

            authService.changePassword(vm.email, changePasswordCallback);
        }

        function IsEmbedded() {
          return vm.embedded; 
        }

        //-- NAVIGATION --//
        function closeModal() {
          if ($scope.$close) {
              $scope.$close();
          }
        }
        function goToLogin() {
            loginModalService();
            vm.closeModal();
        }
        function goToSignUp() {
            joinModalService();
            vm.closeModal();
        }
    };

    resetpassModalController.$inject = ['$scope','authService','loginModalService','dataFactory','joinModalService'];
    app.controller('resetpassModalController', resetpassModalController);
};
