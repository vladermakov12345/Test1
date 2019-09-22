(function() {
	require("./ideaSearchBox.less");

    var ideaSearchBoxController = function($scope,$state,environmentService) {
        
        var vm = this;
        vm.env = environmentService();
        vm.searchIdeas = searchIdeas;

        //search ideas
        function searchIdeas() {
            if (!vm.ideaSearchPhrase)
                return;
            $state.go('ideaSearch', {phrase: vm.ideaSearchPhrase.replace(/ /g,"_") });
        }
    };

    ideaSearchBoxController.$inject = ['$scope','$state','environmentService'];

    var ideaSearchBoxFunc = function (dataFactory,$state) {
        return {
        	restrict: 'E',
            controller: ideaSearchBoxController,
            controllerAs: 'ideaSearchBoxController',
            bindToController: true,
		    template: require("./ideaSearchBox.html"),
		    link: function(scope, element, attrs) {
                // scope.citybox.cityid = attrs.cityid;
                // scope.citybox.cityname = attrs.cityname;
		    }
        };
    };

    ideaSearchBoxFunc.$inject = ['dataFactory','$state'];
    angular.module('app').directive('ideaSearchBox', ideaSearchBoxFunc);
})();

    