/*
    Entry Points
        1. our marketing email (ex clubGO) clubgo
            .../m?p=home&a=join&e=abc@123.com
            .../m?p=hotels&q=ppnid%3D700010695%26type%3Dhotel%26display%3DPhiladelphia%20Marriott%20Downtown%26checkin%3D8-7-2018%26checkout%3D8-8-2018&rooms%3D1&guests%3D1
            .../m?p=home&a=login&e=abc@123.com
        2. partner marketing email (scootaround) [https://clubgo.accessiblego.com/scootaround?pid=883C2FA7& e=abc@123.com]
            .../m?p=home&a=join&pid=D424DC7B&e=abc@123.com (from clubGO landing page)

    PARAMS
        p = page (default=home)
        q = querystring (default='')
        a = action (default='')
        e = user email (default='')
        pid = partner id  (default=undefined)

*/
module.exports = function(app) {
    var mController = function ($stateParams,$rootScope,$state,joinModalService,loginModalService,alreadyRegisteredModalService,redirectionService, dataFactory, localStorageService, currentlyLoggedInModalService) {

        var vm = this;

        vm.actionToTake = '';
        vm.page = '';
        vm.querystring = '';
        vm.emailAddress = '';
        vm.partnerId = '';

        vm.init = init;
        vm.act = act;
        vm.userIsLoggedIn = userIsLoggedIn;
        vm.processFromPartner = processFromPartner;
        vm.getModalTextParams = getModalTextParams;

        vm.init();

        function init() {

            vm.actionToTake = $stateParams.a;
            vm.page = $stateParams.p;
            vm.querystring = $stateParams.q;
            vm.emailAddress = $stateParams.e;
            vm.partnerId = $stateParams.pid;

            //1. go to request p?q
            var params = {};
            if (vm.querystring && vm.querystring!=='') {
                var spl = vm.querystring.split('&');
                $.each(spl,function(key,val) {
                    var s = val.split('=');
                    params[s[0]]=s[1];
                });
            }
            $state.go(vm.page,params);

            //2. if not from a partner then simply handle requested action
            if (vm.emailAddress==='' || vm.partnerId==='') {
                vm.act();
                return;
            }

            //3. set session to reflect from partner
            $rootScope.fromPartner = {
                email: vm.emailAddress,
                partnerId: vm.partnerId
            };

            //3. handle from a partner
            vm.processFromPartner();
        }

        function processFromPartner() {

            var successFunc = function (result) {

                //handle if errors
                if (result.data.errors) {
                    console.log(result.data.errors);
                    vm.act();
                    return;
                }

                //handle if already registered
                if (result.data.data === true) {
                    vm.actionToTake = 'alreadyRegistered';
                    vm.act();
                    return;
                }

                //handle if not already registered
                vm.act();
            };

            var errFunc = function (errObj) {
                console.log(errObj);
            };
            
            dataFactory.isUserExist(vm.emailAddress).then(successFunc,errFunc);
        }

        function act() {
            switch (vm.actionToTake) {
                case 'join':
                    if (vm.userIsLoggedIn()) return;
                    var params = getModalTextParams();
                    joinModalService(params);
                    return;
                
                case 'login':
                    if (vm.userIsLoggedIn()) return;
                    redirectionService.setRedirect({ to: 'accountPageUi', params: { t: 'club' }});
                    var params = getModalTextParams();
                    loginModalService(params);
                    return;

                case 'alreadyRegistered':
                    if (vm.userIsLoggedIn()) return;
                    alreadyRegisteredModalService();
                    return;

                default: 
                    return;
            }
        }

        //handle if logged in and action to take is to login
        function userIsLoggedIn() {
            if (localStorageService.getAuthenticationState()) {
                currentlyLoggedInModalService();
                return true;
            }
            return false;
        }

        function getModalTextParams() {
            var cb = function() {
            };
            var params = {
              onSuccessFunc: cb,
              text: {
                heading: 'Free Membership',
                subHeadingJoin: 'Create an account to access clubGO',
                subHeadingLogin: 'Login to access clubGO'
              }
            };
            return params;
        }
    };

    mController.$inject = ['$stateParams','$rootScope','$state','joinModalService','loginModalService','alreadyRegisteredModalService','redirectionService','dataFactory','localStorageService','currentlyLoggedInModalService'];
    app.controller('mController', mController);
};
