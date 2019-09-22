module.exports = function(mod){
    var showQualifiedOrganizationsModalService = function ($rootScope,$uibModal) {

        //handles: explicit dismissal
        var qualifiedOrgsSuccessFunc = function(a,b,c) {
        };

        //handles: when dismissed by clicking outside modal
        var qualifiedOrgsFailureFunc = function(a,b,c) {
            console.log('qualifiedOrgsFailureFunc called');
        };

        var qualifiedOrgsErrorFunc = function(a,b,c) {
            console.log('qualifiedOrgsErrorFunc called');
        };

        return function() {
            var modalInstance = $uibModal.open({    //angular bootstrap modal
                template: require("../../components/clubgo/qualifiedOrganizationsModal.html"),
                backdrop:'static',
                keyboard: true,
                inputs: {
                    title: 'Qualified Organizations'
                },
                size: 'md'
            });

            return modalInstance
                 .result
                 .then(qualifiedOrgsSuccessFunc,qualifiedOrgsFailureFunc)
                 .catch(qualifiedOrgsErrorFunc);
        };

    };

    showQualifiedOrganizationsModalService.$inject = ['$rootScope','$uibModal'];
    mod.service('showQualifiedOrganizationsModalService', showQualifiedOrganizationsModalService);
};
