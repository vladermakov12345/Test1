module.exports = function(app){

    var breadcrumbsController = function($scope,$state,environmentService) {
        var vm = this;
    };

    breadcrumbsController.$inject = ['$scope','$state','environmentService'];

    var breadcrumbsFunc = function (dataFactory,$state) {
        return {
        	restrict: 'E',
            controller: breadcrumbsController,
            controllerAs: 'b',
            bindToController: true,
		    template: require("./breadcrumbs.html"),
            scope: {
                crumbs: '=crumbs'
            }
        };
    };

    breadcrumbsFunc.$inject = ['dataFactory','$state'];
    app.directive('breadcrumbs', breadcrumbsFunc);
};    