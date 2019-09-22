module.exports = function(app){
	//require("./ideaSearchBox.less");

    var travelIdeaSearchBarController = function($scope,$state,environmentService) {
        
        var vm = this;
        vm.env = environmentService();
        vm.searchIdeas = searchIdeas;

        function searchIdeas() {
            if (!vm.searchphrase) { return; }
            $state.go('ideaSearch', {phrase: vm.searchphrase.replace(/ /g,"_") });
        }
    };

    travelIdeaSearchBarController.$inject = ['$scope','$state','environmentService'];

    travelIdeaSearchBarFunc = function (dataFactory,$state) {
        return {
        	restrict: 'E',
            controller: travelIdeaSearchBarController,
            controllerAs: 'travelIdeaSearchBar',
            bindToController: true,
		    template: require("./travelIdeaSearchBar.html"),
		    link: function(scope, element, attrs) {
                // scope.citybox.cityid = attrs.cityid;
                // scope.citybox.cityname = attrs.cityname;
		    }
        };
    };

    travelIdeaSearchBarFunc.$inject = ['dataFactory','$state'];
    app.directive('travelIdeaSearchBar', travelIdeaSearchBarFunc);
};    