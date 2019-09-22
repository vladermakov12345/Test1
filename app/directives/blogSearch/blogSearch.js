(function() {
    require("./blogSearch.less");

    var blogSearchController = function($scope, dataFactory, $state) {
        var vm = this;
        vm.searchBlog = searchBlog;

        function searchBlog() {
            $state.go('blogMain',{ s: vm.searchText});
        }
    };

    blogSearchController.$inject = ['$scope', 'dataFactory','$state'];

    var blogSearchFunc = function () {
        return {
            restrict: 'E',
            scope: {
                searchText: '=',
                filterBlogs: '='
            },
            controller: blogSearchController,
            controllerAs: 'blogSearch',
            bindToController: true,
            template: require("./blogSearch.html"),
        };
    };

    blogSearchFunc.$inject = [];
    angular.module('app').directive('blogSearch', blogSearchFunc);
})();

