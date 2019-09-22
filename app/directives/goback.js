
(function() {
    var goBackFunc = function () {
        return {
            template: '<a style="font-size: 11px;margin-bottom:40px;vertical-align:middle;" ui-sref="{{dest}}"><i class="fa fa-arrow-circle-left" aria-hidden="true"></i> back to {{dest}}</a><br><br>',
            restrict: 'E',
            scope: { dest: '@' }
        };
    };

    goBackFunc.$inject = [];
    angular.module('app').directive('goback', goBackFunc);
})();
