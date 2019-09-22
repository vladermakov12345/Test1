module.exports = function(mod){
    var currentlyLoggedInModalService = function ($rootScope,$uibModal) {

        //handles: explicit dismissal
        var successFunc = function(a,b,c) {
        };

        //handles: when dismissed by clicking outside modal
        var failureFunc = function(a,b,c) {
            console.log('currentlyLoggedIn failureFunc called');
        };

        var errorFunc = function(a,b,c) {
            console.log('currentlyLoggedIn errorFunc called');
        };

        return function() {
            var modalInstance = $uibModal.open({    //angular bootstrap modal
                template: require("../components/account/currentlyLoggedIn.html"),
                controller: 'currentlyLoggedInController',
                backdrop:'static',
                keyboard: true,
                inputs: {
                    title: 'You are currently logged in to accessibleGO.com'
                },
                size: 'md'
            });

            return modalInstance
                 .result
                 .then(successFunc,failureFunc)
                 .catch(errorFunc);
        };

    };

    currentlyLoggedInModalService.$inject = ['$rootScope','$uibModal'];
    mod.service('currentlyLoggedInModalService', currentlyLoggedInModalService);
};
