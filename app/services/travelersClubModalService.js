module.exports = function(mod){
    var travelersClubModalService = function ($rootScope, $uibModal,AUTH_EVENTS, $window, $location, localStorageService, dataLayerService) {

        //handles: explicit dismissal
        var clubSuccessFunc = function(a,b,c) {
        };

        //handles: when dismissed by clicking outside modal
        var clubFailureFunc = function(a,b,c) {
            console.log('clubFailureFunc called');
        };

        var clubErrorFunc = function(a,b,c) {
            console.log('clubErrorFunc called');
        };

        return function() {
            dataLayerService.push('new_account','join_modal');

            var modalInstance = $uibModal.open({    //angular bootstrap modal
                template: require("../components/account/join/travelersClub.html"), //'/web/dist/login.html',   //'/Template/RenderLoginTemplate'
                backdrop:'static',
                keyboard: true,
                size: 'lg'
            });

            return modalInstance
                 .result
                 .then(clubSuccessFunc,clubFailureFunc)
                 .catch(clubErrorFunc);
        };

    };

    travelersClubModalService.$inject = ['$rootScope','$uibModal','AUTH_EVENTS','$window', '$location', 'localStorageService', 'dataLayerService'];
    mod.service('travelersClubModalService', travelersClubModalService);
};
