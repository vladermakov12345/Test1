module.exports = function(mod){
    var sessionService = function () {

        var vm = this;

        vm.isLoggedIn = false;
        vm.lastHotelSearch = {};

        vm.create = function (sessionId, userId) {
            vm.id = sessionId;
            vm.userId = userId;
            vm.firstName = firstName;
            vm.isLoggedIn = true;
        };
        vm.destroy = function () {
            vm.id = null;
            vm.userId = null;
            vm.firstName = null;
            vm.isLoggedIn = false;
        };

        //-- last hotel search
        vm.setLastHotelSearch = function(hotelSearchCriteria, hotelSearchResults) {
            vm.lastHotelSearch.Criteria = hotelSearchCriteria;
            vm.lastHotelSearch.Results = hotelSearchResults;
        };
        vm.getLastHotelSearch = function() {
            return vm.lastHotelSearch;
        };
        vm.resetLastHotelSearch = function() {
            vm.lastHotelSearch = {
                Criteria: undefined,
                Results: undefined
            };
        };
        vm.existsLastHotelSearch = function() {
            return vm.lastHotelSearch.Criteria && vm.lastHotelSearch.Results;
        };

    };

    sessionService.$inject = [];
    mod.service('sessionService', sessionService);
};