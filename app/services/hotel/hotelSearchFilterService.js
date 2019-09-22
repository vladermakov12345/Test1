module.exports = function(mod){
    var hotelSearchFilterService = function () {

        var vm = this;

        vm.filters = {};

        vm.init = init;
        vm.reset = reset;

        vm.init();

        function init() {
            vm.reset();
        };

        function reset() {
            // vm.filters.priceGroups = [
            //     { title: "<100", min: 0, max: 99.99, checked: false },
            //     { title: "100-250", min: 100.00, max: 249.99, checked: false },
            //     { title: "250-400", min: 250.00, max: 399.99, checked: false },
            //     { title: "400+", min: 400, max: 10000, checked: false }
            // ];
            // vm.filters.starGroups = [
            //     { numStars: 1, checked: false },
            //     { numStars: 2, checked: false },
            //     { numStars: 3, checked: false },
            //     { numStars: 4, checked: false },
            //     { numStars: 5, checked: false }
            // ];
            vm.filters.accessibleAmenityMap = {};
            vm.filters.isCugFilter = false;
            vm.filters.hotelChain = undefined;
            vm.filters.hasReviews = false;
        };

    };

    hotelSearchFilterService.$inject = [];
    mod.service('hotelSearchFilterService', hotelSearchFilterService);
};