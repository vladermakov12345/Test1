(function() {

    var photosCarouselController = function($scope,$state,$window) {
        var vm = this;

        //require("file-loader?name=greater_than.jpg!../../../resources/img/common/greater_than.jpg");
        //require("file-loader?name=less_than.jpg!../../../resources/img/common/less_than.jpg");

        //- images
        vm.currentPhotoIndex = 0;
        vm.currentImage = {};
        vm.firstPhotoIndex = 0;
        vm.shiftGalleryRight = shiftGalleryRight;
        vm.shiftGalleryLeft = shiftGalleryLeft;
        vm.setCurrentImage = setCurrentImage;
        vm.canShiftRight = canShiftRight;
        vm.canShiftLeft = canShiftLeft;
        vm.setCurrentIndex = setCurrentIndex;

        //set the first hotel image   
        //vm.setCurrentImage();

        //-- images
        function canShiftRight() {
            if (!vm.collection) return false;
            return vm.currentPhotoIndex<vm.collection.length-1;
            //return vm.hoteldetails.photo_data.length!==vm.firstPhotoIndex+4;
        }
        function shiftGalleryRight() {
            if (!vm.canShiftRight()) return;
            vm.currentPhotoIndex++;
            vm.setCurrentImage();

            if (vm.currentPhotoIndex<vm.collection.length-3) {
            vm.firstPhotoIndex++;
            }
            //vm.setCurrentImage(vm.firstPhotoIndex+3);
        }
        function canShiftLeft() {
            if (!vm.collection) return false;
            return vm.currentPhotoIndex>0;
            //return vm.firstPhotoIndex>0;
        }
        function shiftGalleryLeft() {
            if (!vm.canShiftLeft()) return;
            vm.currentPhotoIndex--;
            vm.setCurrentImage();
            if (vm.firstPhotoIndex>0) vm.firstPhotoIndex--;
            //vm.setCurrentImage(vm.firstPhotoIndex);
        }
        function setCurrentIndex(idx) {
            vm.currentPhotoIndex=idx;
            vm.setCurrentImage();
        }
        function setCurrentImage() {
            if (!vm.collection) return false;
            vm.currentImage=vm.collection[vm.currentPhotoIndex];  //hoteldetails.photo_data[vm.currentPhotoIndex];
            //if (idx===vm.firstPhotoIndex) vm.shiftGalleryLeft();
        }

        //handle 404s
        $scope.imgError = imgError;
        function imgError(src) {
            $.each(vm.collection, function(idx, val) {
                if (val===src.replace('https:','')) {
                    vm.collection.splice(idx, 1);
                    if (idx===0) vm.setCurrentImage();
                    return true;
                }
            });
            $scope.$apply();
        }

        //attempts at exif
        vm.postOrientationCheckCB = postOrientationCheckCB;
        function postOrientationCheckCB(isSuccess) {
          console.info('image load complete success = ' + isSuccess);
        }

    };

    photosCarouselController.$inject = ['$scope','$state','$window'];

    var photosCarouselFunc = function (dataFactory,$state) {
        return {
        	restrict: 'E',
            controller: photosCarouselController,
            controllerAs: 'vm',
            // bindToController: {
            //     ngCollection: '=ngCollection'
            // },
		    template: require("./photosCarousel.html"),
            //scope: false,
            scope: {
                ngCollection: '=ngCollection',
                nav: '=nav',
                showDescription: '@showDescription'
            },
		    link: function(scope, element, attrs) {
                //scope.ngCollection = JSON.parse(attrs.ngCollection);
                scope.vm.collection = scope.ngCollection;
                scope.vm.nav = attrs.nav;
                scope.vm.showDescription = scope.showDescription;
                //if (!scope.nav) scope.nav = 'bottom';
                scope.vm.setCurrentImage();
		    }
        };
    };

    photosCarouselFunc.$inject = ['dataFactory','$state'];
    angular.module('app').directive('photosCarousel', photosCarouselFunc);
})();

/*
    //name: '@'    //Used to pass a string value into the directive
    //name: '='    //2 way binding
    //action: '&'  //Allows an external function to be passed into the directive and invoked
    includeHotels: '@includeHotels',
    label: '@label',
    selectedValue: '=ngModel',
    placeholder: '@placeholder'
*/