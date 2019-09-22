module.exports = function(mod){
    var accountService = function ($http,$rootScope,globalConstants) {

        var vm = this;

        vm.sendConfirmationEmail = sendConfirmationEmail;
        vm.confirmAccount = confirmAccount;
        vm.forgotpassword = forgotPassword;


        function sendConfirmationEmail(userId) {
            var data = JSON.stringify({
                userId: userId
            });

            var req = {
                method: 'POST',
                url: globalConstants.urlSendConfirmationEmail,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };

            return $http(req);
        }
        function confirmAccount(userId, pass, code) {

            var model = {
                userId: userId,
                pass: pass,
                code: code
            };

            var data = JSON.stringify({
                model: model
            });

            var req = {
                method: 'POST',
                url: globalConstants.urlAcctConfirm,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };

            return $http(req);
        }
        function forgotPassword(email) {
            var data = JSON.stringify({
                email: email
            });

            var req = {
                method: 'POST',
                url: globalConstants.urlForgotPass,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };

            return $http(req);
        }

    };

    accountService.$inject = ['$http','$rootScope','globalConstants'];
    mod.service('accountService', accountService);
};