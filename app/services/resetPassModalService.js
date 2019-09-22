module.exports = function(mod){
    var resetPassModalService = function ($rootScope,$uibModal) {

        //handles: explicit dismissal
        var resetPasswordSuccessFunc = function(a,b,c) {
        };

        //handles: when dismissed by clicking outside modal
        var resetPasswordFailureFunc = function(a,b,c) {
            console.log('resetPasswordFailureFunc called');
        };

        var resetPasswordErrorFunc = function(a,b,c) {
            console.log('resetPasswordErrorFunc called');
        };

        return function() {
            var modalInstance = $uibModal.open({    //angular bootstrap modal
                template: require("../components/account/resetpass/resetpassModal.html"),
                backdrop:'static',
                keyboard: true,
                inputs: {
                    title: 'Reset Password'
                },
                size: 'md'
            });

            return modalInstance
                 .result
                 .then(resetPasswordSuccessFunc,resetPasswordFailureFunc)
                 .catch(resetPasswordErrorFunc);
        };

    };

    resetPassModalService.$inject = ['$rootScope','$uibModal'];
    mod.service('resetPassModalService', resetPassModalService);
};
