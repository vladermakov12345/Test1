//handle all the routes and the route configuration.

(function() {
    var eatClickIfFunc = function ($parse, $rootScope) {
        return {
            // this ensure eatClickIf be compiled before ngClick
            priority: 100,
            restrict: 'A',
            compile: function ($element, attr) {
                var fn = $parse(attr.eatClickIf);
                return {
                    pre: function link(scope, element) {
                        var eventName = 'click';
                        element.on(eventName, function (event) {
                            var callback = function () {
                                if (fn(scope, {$event: event})) {
                                    // prevents ng-click to be executed
                                    event.stopImmediatePropagation();
                                    // prevents href
                                    event.preventDefault();
                                    return false;
                                }
                            };
                            if ($rootScope.$$phase) {
                                scope.$evalAsync(callback);
                            } else {
                                scope.$apply(callback);
                            }
                        });
                    },
                    post: function () {
                    }
                };
            }
        };
    };

    eatClickIfFunc.$inject = ['$parse', '$rootScope'];
    angular.module('app').directive('eatClickIf', eatClickIfFunc);
})();
