module.exports = function(app) {
    var addPhotoModalController = function ($scope,authService,loginModalService,dataFactory,joinModalService,existingItems,guid) {
		var vm = this;

        vm.init = init;
        vm.removeFile = removeFile;
        vm.closeModal = closeModal;

        vm.init();

        function init() {

            vm.files = [];  //user selection from file system
            vm.filesPersisted = existingItems || [];  //perists among multiple file system searches    

            //handle changes made by user to the files selected for upload
            $scope.$watch('vm.files', function(newvalue,oldValue) {
                setTimeout(function () {
              
                    if (!newvalue || newvalue.length === 0) return;

                    for (var i=0;i<vm.files.length;i++) {
                        vm.files[i].imageId = guid.get();
                        vm.filesPersisted.push(vm.files[i]);
                    }
                    $scope.$apply();
                }, 50);    
            });
        }

        function removeFile(name) {
            $.each(vm.filesPersisted,function(idx,file) {
                if (file.name === name) {
                    vm.filesPersisted.splice(idx,1);
                    return false;
                }
            });
        }

        function closeModal() {
            $scope.$close(vm.filesPersisted);
        }
    };

    addPhotoModalController.$inject = ['$scope','authService','loginModalService','dataFactory','joinModalService','existingItems','guid'];
    app.controller('addPhotoModalController', addPhotoModalController);
};
