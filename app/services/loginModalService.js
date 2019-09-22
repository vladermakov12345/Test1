module.exports = function(mod){
    var loginModalService = function ($rootScope, $uibModal,AUTH_EVENTS, dataLayerService) {

        // var setLoginModalServiceState(v) {
        //     $rootScope. = v;
        // };


        //default handler: explicit dismissal
        var loginSuccessFunc = function(a,b,c) {
            //$rootScope.loginModalServiceActivated = false;
            //(remove when ga calls are baked in) was being called before local storage profile was available - dataLayerService.updateGALoginSuccess();
        };

        //handles: when dismissed by clicking outside modal
        var loginFailureFunc = function(a,b,c) {
        };

        var loginErrorFunc = function(a,b,c) {
        };

        return function(params) {

            //set default success function
            var successCBFunc = loginSuccessFunc;

            //set default params (this is an angular bootstrap modal)
            var modalParams = {    
                template: require("../components/account/login/loginModal.html"), //'/web/dist/login.html',   //'/Template/RenderLoginTemplate'
                    controller: 'loginModalController',
                    controllerAs: 'vm',
                    bindToController: true,
                backdrop:'static',
                keyboard: true,
                // inputs: {
                //     //TODO: create contact object and add fullname method on it
                //     title: 'Login'
                //     //recipient_fullname: contact.salutation+' '+contact.first+' '+contact.last,
                //     //recipient_email: contact.email
                // },
                size: 'md',
                resolve: {
                    text: function() {
                        return {};
                    }
                }
            };

            //? if success CB provided, wrap so that action has localStorageService profile data available to it

            //custom overrides
            if (params) {

                //custom success cb
                if (params.onSuccessFunc) {
                    successCBFunc = function(res) {
                        if (!res) return;
                        setTimeout(function () {
                            params.onSuccessFunc();
                        }, 500);

                        //(remove when ga calls are baked in) not confirmed but presumabley would wasbe called before local storage profile is available  dataLayerService.updateGALoginSuccess();
                    };
                }

                //custom text
                if (params.text) {
                    modalParams.resolve = {
                        text: function() {
                            return {
                                heading: params.text.heading,
                                subHeadingJoin: params.text.subHeadingJoin,
                                subHeadingLogin: params.text.subHeadingLogin
                            };
                        }
                    };
                }
            }

            var modalInstance = $uibModal.open(modalParams);

            //$rootScope.loginModalServiceActivated = true;

            //LEFT OFF HERE - decide if we want to handle the promise to be resolvedhere  in loginModalService() or in mainController
            //loginmodalservice pro - separation of concern
            //where do we want to persist user session
            return modalInstance
                 .result
                 .then(successCBFunc,loginFailureFunc)
                 .catch(loginErrorFunc);
        };

    };

    loginModalService.$inject = ['$rootScope','$uibModal','AUTH_EVENTS','dataLayerService'];
    mod.service('loginModalService', loginModalService);
};
