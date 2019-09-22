module.exports = function(app){
    var flightSliceDetailsController = function($scope,$state,utilities) {
        
        var vm = this;
        vm.utilities = utilities;

        //var vm = this;
        //vm.searchIdeas = searchIdeas;

        //search ideas
        // function searchIdeas() {
        //     if (!vm.ideaSearchPhrase)
        //         return;
        //     $state.go('ideaSearch', {phrase: vm.ideaSearchPhrase.replace(/ /g,"_") });
        // }
    };

    flightSliceDetailsController.$inject = ['$scope','$state','utilities'];

    var flightSliceDetailsFunc = function (dataFactory,$state) {
        return {
            restrict: 'E',
            controller: flightSliceDetailsController,
            bindToController: true,
            controllerAs: 'vm',
            template: require("./flightSliceDetails.html"),
            scope: {
                //name: '@'    //Used to pass a string value into the directive
                //name: '='    //2 way binding
                //action: '&'  //Allows an external function to be passed into the directive and invoked
                leg: '@data',
                searchType: '@searchType'
            },
            link: function(scope, element, attrs) {
                scope.leg = JSON.parse(attrs.ngData);
                scope.searchType = attrs.searchType;
                console.log(attrs['ng-data']);
                // scope.citybox.cityname = attrs.cityname;
            }
        };
    };

    flightSliceDetailsFunc.$inject = ['dataFactory','$state'];
    app.directive('flightSliceDetails', flightSliceDetailsFunc);
};

    