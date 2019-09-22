(function() {
     var fbpixelController = function($scope) {
        var vm = this;
    //     $scope.maxRatings = [];

    //     for (var i = 1; i <= $scope.maxRating; i++) {
    //         $scope.maxRatings.push({});
    //     }

    //     $scope._rating = $scope.rating;
        
    //     $scope.isolatedClick = function (param) {
    //         if ($scope.readOnly == 'true') return;

    //         $scope.rating = $scope._rating = param;
    //         $scope.hoverValue = 0;
    //         $scope.click({
    //             param: param
    //         });
    //     };

    //     $scope.isolatedMouseHover = function (param) {
    //         if ($scope.readOnly == 'true') return;

    //         $scope._rating = 0;
    //         $scope.hoverValue = param;
    //         $scope.mouseHover({
    //             param: param
    //         });
    //     };

    //     $scope.isolatedMouseLeave = function (param) {
    //         if ($scope.readOnly == 'true') return;

    //         $scope._rating = $scope.rating;
    //         $scope.hoverValue = 0;
    //         $scope.mouseLeave({
    //             param: param
    //         });
    //     };
     };
     fbpixelController.$inject = ['$scope'];

    var fbpixelFunc = function () {
        
        function compile(elem, attrs, transclude) {

            //elem.empty();
            //elem.append('yabbers');
            return function ($scope) {
                transclude($scope, function (contents) {
                    elem.empty();

                    var a = "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '312392209172643'); fbq('track', 'PageView');";
                    elem.append(a); //clone[0].innerText);

                    var b = "<noscript><img height='1' width='1' style='display:none' src='https:\/\/www.facebook.com/tr?id=312392209172643&ev=PageView&noscript=1'\/><\/noscript>";
                    //elem.push(b);
                    elem.append(b);
                });
            };
        }

        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                script:'@script',
                noscript:'@noscript'
            },
            compile: compile,
            controller: fbpixelController,
            controllerAs: 'vm',
            bindToController: true,
            //template: require("./fbpixel.html"),
            template: require("./fbpixel.html"),   //<noscript>{{noscript}}</noscript></root>',    // '<title ng-transclude></title>',
            link: function(scope, element, attrs) {
            }
        };

    };

    fbpixelFunc.$inject = [];
    angular.module('app').directive('fbpixel', fbpixelFunc);
})();



/*

!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '312392209172643'); // Insert your pixel ID here.
fbq('track', 'PageView');

<img height='1' width='1' style='display:none' src='https://www.facebook.com/tr?id=312392209172643&ev=PageView&noscript=1'/>


return {
            scope: {
                rating: '=',
                maxRating: '@',
                readOnly: '@',
                click: "&",
                mouseHover: "&",
                mouseLeave: "&"
            },
            restrict: 'E',
            template: require("./starRating.html"),
            compile: function (element, attrs) {
                if (!attrs.maxRating || (Number(attrs.maxRating) <= 0)) {
                    attrs.maxRating = '5';
                }
            },
            controller: fxpixelController,
            controllerAs: 'vm',
        };
*/