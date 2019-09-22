(function() {
    require("./oneMomentPlease.less");

    var oneMomentPleaseController = function($scope,$state) {
        var vm = this;

        $scope.showText = true;
    };

    oneMomentPleaseController.$inject = ['$scope','$state'];

    var oneMomentPleaseFunc = function ($state) {
        return {
            restrict: 'E',
            controller: oneMomentPleaseController,
            scope: {
                isPageReady: '=isPageReady',
                text: '=oneMomentText',
                showText: '@showText'
            },
            template: require("./oneMomentPlease.html"),
        };
    };

    oneMomentPleaseFunc.$inject = ['$state'];
    angular.module('app').directive('oneMomentPlease', oneMomentPleaseFunc);
})();
