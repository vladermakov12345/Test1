module.exports = function(mod){
    var addPhotosModalService = function ($rootScope,$uibModal) {

        return function(existingFiles) {

            var modalInstance = $uibModal.open({    //angular bootstrap modal
                template: require("../components/account/photos/addPhotoModal.html"),
                controller: 'addPhotoModalController',
                controllerAs: 'vm',
                backdrop:'static',
                keyboard: true,
                inputs: {
                    title: 'Add Photos'
                },
                size: 'lg',
                resolve: {
                    existingItems: function () {
                        return existingFiles || [];
                    }
                }
            });

            return modalInstance.result;
        };

    };

    addPhotosModalService.$inject = ['$rootScope','$uibModal'];
    mod.service('addPhotosModalService', addPhotosModalService);
};