(function() {
     require("./photos.less");
   

    var photosController = function($scope,$state) {
        var vm = this;

        (function () {
            // setup your carousels as you normally would using JS
            // or via data attributes according to the documentation
            // https://getbootstrap.com/javascript/#carousel
            $('#carousel123').carousel({ interval: false });
           
        }());

        setTimeout(function() {
            (function () {
                $('.carousel-showmanymoveone .item').each(function () {

                    var itemToClone = $(this);

                    for (var i = 1; i < 7; i++) {
                        itemToClone = itemToClone.next();

                        // wrap around if at end of item collection
                        if (!itemToClone.length) {
                            itemToClone = $(this).siblings(':first');
                        }

                        // grab item, clone, add marker class, add to collection
                        itemToClone.children(':first-child').clone()
                            .addClass("cloneditem-" + (i))
                            .appendTo($(this));
                    }
                });
            }());
        }, 5000);
    };

    photosController.$inject = ['$scope','$state'];

    var photosFunc = function (dataFactory,$state) {
        return {
        	restrict: 'E',
            controller: photosController,
            controllerAs: 'photos',
            bindToController: true,
		    template: require("./photos.html"),
		    link: function(scope, element, attrs) {
                scope.images = scope.airline_detail.photos;
		    }
        };
    };

    photosFunc.$inject = ['dataFactory','$state'];
    angular.module('app').directive('photos', photosFunc);
})();

    