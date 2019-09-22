module.exports = function(app) {
    var byCityController = function ($rootScope,$scope,$state,dataFactory,$filter,$location, $window,environmentService) {
        var vm = this;

        vm.env = environmentService();
        vm.breadcrumbs = [];

        vm.init = init;        

        vm.init();

        function init() {

            //set breadcrumbs
            vm.breadcrumbs = [{ isActive: true, title: 'Plan by City' }];
        }

    };

    byCityController.$inject = ['$rootScope','$scope','$state','dataFactory','$filter','$location', '$window','environmentService'];
    app.controller('byCityController', byCityController);
};
