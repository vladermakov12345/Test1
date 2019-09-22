(function() {
    var cityService = function ($http,globalConstants) {

        var vm = this;

        vm.getCities = getCities;

       function GetCities() {
            //NOT SURE IF WE NEED THIS :)
        }

    };

    cityService.$inject = ['$http','globalConstants'];
    angular.module('app').service('cityService', cityService);
})();