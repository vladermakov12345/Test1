/*
    This directive currently only serves the specific interest of uploading permits
*/
(function(){

 require("./fileUpload.less");

    var fileUploadController = function ($scope, $state, dataFactory,localStorageService) {
        var vm = this;

        $scope.uploadFile = uploadFile;
        this.files = [];
        $scope.uploadPermitSuccess = false;
        $scope.isButtonDisable=false;

        $scope.removeFile = removeFile;

        function uploadFile() {

            //clear user viewed errors
            $scope.fileUploadErrs = [];

            //user logged in?
            if (!localStorageService.getAuthenticationState())
            {
                //notify user
                var errInfo = {
                    message: 'Please log in to use this feature.',
                    exception: undefined
                };
                $scope.fileUploadErrs.push(errInfo);
                return;
            }

            $scope.isButtonDisable = true;
            $scope.fileUploadErrs = [];

            var successFunc = function (response) {
                if (response.data.status === 'fail') {
                    $scope.fileUploadErrs = response.data.errors;
                    $scope.uploadPermitSuccess = false;
                    $scope.isButtonDisable = false;
                    return;
                }
               
                $scope.uploadPermitSuccess = true;
            };

            var errFunc = function (errObj) {
                $scope.isButtonDisable = false;

                //notify user
                var errInfo = {
                    message: 'Error 40995 occurred while attempting to upload your file.',
                    exception: errObj
                };
                $scope.fileUploadErrs.push(errInfo);

                //auditing
                console.log(errInfo);
                throw errInfo;
            };
            
            console.log(this.files);
            var formdata = new FormData();
            formdata.append('uploadFiles', JSON.stringify(this.files));

            dataFactory.UploadUserPermit(formdata).then(successFunc, errFunc);
        }

        function removeFile(item) {
            var index = this.files.indexOf(item);
            this.files.splice(index, 1);
            document.getElementById("uploaderFile").files.length = this.files.length;
            console.log(this.files);
        }

       
    };

    fileUploadController.$inject = ['$scope', '$state', 'dataFactory','localStorageService'];

    var fileUploadFunc = function (dataFactory, $state) {
        return {
            restrict: 'E',
            controller: fileUploadController,
            // scope: {
            //     errs : '='
            // },
            controllerAs: 'fileUpload',
            bindToController: true,
            template: require("./fileUpload.html"),
            link: function (scope, element, attrs) {
                // scope.errs=scope.fileUpload.errs;
            }
        };
    };

    fileUploadFunc.$inject=['dataFactory', '$state'];
    angular.module('app').directive('fileUpload',fileUploadFunc);

})();