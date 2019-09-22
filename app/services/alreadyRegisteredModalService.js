module.exports = function(mod){
    var alreadyRegisteredModalService = function ($rootScope,$uibModal) {

        //handles: explicit dismissal
        var successFunc = function(a,b,c) {
        };

        //handles: when dismissed by clicking outside modal
        var failureFunc = function(a,b,c) {
            console.log('alreadyRegistered failureFunc called');
        };

        var errorFunc = function(a,b,c) {
            console.log('alreadyRegistered errorFunc called');
        };

        return function() {
            var modalInstance = $uibModal.open({    //angular bootstrap modal
                template: require("../components/account/alreadyRegistered.html"),
                controller: 'alreadyRegisteredController',
                backdrop:'static',
                keyboard: true,
                inputs: {
                    title: 'Reset Password'
                },
                size: 'md'
            });

            return modalInstance
                 .result
                 .then(successFunc,failureFunc)
                 .catch(errorFunc);
        };

    };

    alreadyRegisteredModalService.$inject = ['$rootScope','$uibModal'];
    mod.service('alreadyRegisteredModalService', alreadyRegisteredModalService);
};
