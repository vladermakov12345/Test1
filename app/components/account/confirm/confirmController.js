//material ui autocomplete
module.exports = function(app) {
    var confirmController = function ($timeout, $q, $log, $scope, $state, askService,accountService) {

        var vm = this;

        vm.isConfirmed = false;
        vm.init = init;
        vm.submit = submit;
        vm.confirmEmailResent = false;
        vm.resend = resend;

        //user id
        vm.userId='';
        vm.setUserId = setUserId;
        vm.hasUserIdFromEmail = hasUserIdFromEmail;
        vm.hasValidUserId = false;

        //code
        vm.code='';
        vm.setCode = setCode;
        vm.hasCodeFromEmail = hasCodeFromEmail;
        vm.hasValidCode = false;

        //invalid state
        vm.isSomethingOff = isSomethingOff;

        //init
        init();

        function init(){
            setUserId();
            setCode();
        }
        function setUserId(){
            if (isGuid($state.params.u))
                vm.userId=$state.params.u;
        }
        function hasUserIdFromEmail(){
            return (vm.userId !== '');
        }

        function setCode(){
            if (!$state.params.c) return;
            if ($state.params.c === null) return;
            vm.code=$state.params.c;
        }
        function hasCodeFromEmail(){
            return (vm.code !== '');
        }

        function isGuid(p){
            if (!p) return false;
            if (p === null) return false;
            var r = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            var res = r.test(p);
            return (res);
        }

        function isSomethingOff(){
            if (!vm.hasCodeFromEmail() && vm.hasUserIdFromEmail())
                return true;
            if (vm.hasCodeFromEmail() && !vm.hasUserIdFromEmail())
                return true;
            if (vm.isComplete && (!vm.hasCodeFromEmail() || !vm.hasUserIdFromEmail()))
                return true;
            return false;
        }

        //TODO: offer a resend email link
        function resend(){
            accountService.sendConfirmationEmail(vm.userId)
                .success(function (data, status) {
                    vm.confirmEmailResent = true;
                })
                .error(function (response, status, headers, config) {
                    //TODO: handle this case
                    console.log(response.errors);
                    //todo: tell user there was a problem resending
                });
        }

        function submit() {
            //reset errors
            vm.errors = '';

            //TODO: encrypt pass?
            accountService.confirmAccount(vm.userId, vm.pass, vm.code)
                .success(function (data, status) {
                    vm.isConfirmed = true;
                    $rootScope.isAuthenticated = true;
                })
                .error(function (response, status, headers, config) {
                    vm.errors = response.errors;
                    vm.isConfirmed = false;
                });
        }

    };

    confirmController.$inject = ['$timeout', '$q', '$log', '$scope', '$state', 'askService','accountService'];
    app.controller('confirmController', confirmController); //angular.module('app')
};