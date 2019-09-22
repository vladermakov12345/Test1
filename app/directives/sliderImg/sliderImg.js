
(function() {
    require("./sliderImg.less");
  

   var sliderImgController = function($scope,$state) {
       var vm = this;

      
       (function () {
           // setup your carousels as you normally would using JS
           // or via data attributes according to the documentation
           // https://getbootstrap.com/javascript/#carousel


          
    // $('#carousel124').carousel({ interval: false });
  
           $(".carousel1").click(function(){
               $(".carousel-indicators li").removeClass("active");
            $(this).addClass("active");
        });

    
       }());

//    setTimeout(function() {
//        (function () {
//            $('.carousel-showmanymoveone .item').each(function () {
//             debugger
//                var itemToClone = $(this);

//                for (var i = 1; i < 3; i++) {
//                    itemToClone = itemToClone.next();

//                    // wrap around if at end of item collection
//                    if (!itemToClone.length) {
//                        itemToClone = $(this).siblings(':first');
//                    }

//                    // grab item, clone, add marker class, add to collection
//                    itemToClone.children(':first-child').clone()
//                        .addClass("cloneditem-" + (i))
//                        .appendTo($(this));
//                }
//            });
//        }());
//    }, 5000);

     
   };

   sliderImgController.$inject = ['$scope','$state'];

   var sliderImgFunc = function (dataFactory,$state) {
       return {
           restrict: 'E',
           controller: sliderImgController,
           controllerAs: 'sliderImg',
           bindToController: false,
           template: require("./sliderImg.html"),
           scope:{
            images:"="   
           },
           link: function(scope, element, attrs) {
               //scope.images = scope.review.sliderImg;
           }
       };
   };
   setTimeout(function() {}, 1000);
   
   sliderImgFunc.$inject = ['dataFactory','$state'];
   angular.module('app').directive('sliderImg', sliderImgFunc);
})();

   