
(function() {
    var inputDetection = function ($rootScope) {
  		return function (scope, element, attrs) {
          element.bind("keydown keypress", function (event) {
              if(event.which === 9) { //13 is enter
                  scope.$apply(function (){
                      scope.$eval(attrs.inputDetection);
                  });

                  event.preventDefault();
              }
          });
      };
    };

    inputDetection.$inject = ['$rootScope'];
    angular.module('app').directive('inputDetection', inputDetection);
})();
