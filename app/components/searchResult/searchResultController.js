module.exports = function (app) {
    var searchResultController = function ($scope, $rootScope, dataFactory, $stateParams, $state) {
        require("./searchResult.less");
        var vm = this;
        vm.init = init;
        vm.init();
        vm.cityBoxes = [];
        vm.cityBoxesToShow = [0, 1, 2, 3];
        vm.getCityBoxColor = getCityBoxColor;
        vm.isInCityBoxesToShow = isInCityBoxesToShow;
        vm.shiftCityBoxesRight = shiftCityBoxesRight;
        vm.shiftCityBoxesLeft = shiftCityBoxesLeft;
        vm.shiftLeft = shiftLeft;
        vm.shiftRight = shiftRight;
        vm.filterAttractions = filterAttractions;
        vm.handleKeyPress = handleKeyPress;
        vm.reloadState = reloadState;
        vm.viewHotel = viewHotel;
        vm.viewCity = viewCity;
        vm.viewAirport = viewAirport;

        function shiftRight(numarr, numTotalBoxes) {
            var nextNum = numarr[numarr.length - 1] + 1;
            if (nextNum > numTotalBoxes - 1)
                return;
            numarr.shift();
            numarr.push(nextNum);
        }
        function shiftLeft(numarr) {
            var prevNum = numarr[0] - 1;
            if (prevNum < 0)
                return;
            numarr.unshift(prevNum);
            numarr.pop();
        }

        function shiftCityBoxesRight() {
            vm.shiftRight(vm.cityBoxesToShow, vm.cityBoxes.length);
        }
        function shiftCityBoxesLeft() {
            vm.shiftLeft(vm.cityBoxesToShow);
        }

        function init() {
            vm.searchTextExists = false;

            if ($stateParams.searchText && $stateParams.searchText !== '')  {
                vm.searchText = $stateParams.searchText.replace(/_/g, ' ');
                vm.searchTextExists = true;
            }

            if (!vm.searchTextExists) {
                return;
            }

            vm.searchParams = {
                id: null, // zt7morb63
                f2: function () { return vm.searchText; }
            };

            //setup meta tags
            var desc = 'accessibleGO search results :: ' + vm.searchText;
            $rootScope.metaTagService.setup({
                title: desc,
                ogTitle: desc,
                twitterTitle: desc
            });

            var successFunc = function (data) {
                vm.results = data.data;
                if (vm.results) {
                    vm.directories = vm.results;
                    vm.attractions = filterAttractions('Attractions');
                    vm.itineraries = filterAttractions('Itineraries');
                    vm.caregivers = filterAttractions('Caregiver Agencies');
                    vm.transportation = filterAttractions('Transportation');
                    vm.tourCompanies = filterAttractions('Tour Companies');
                    vm.equipmentRental = filterAttractions('Equipment Rental');
                }
            };

            var errFunc = function (error) {
                console.log('error searching directory by search text: ' + vm.searchText);
            };

            dataFactory.searchDirectoryEntries(vm.searchText).then(successFunc, errFunc);

            var sFunc = function (data) {
                var result = data.data;
                if (result) {
                    vm.hotelResults = result.hotelResults;
                    vm.cityResults = result.cityResults;
                    vm.airResults = result.airResults;
                }
            };

            var eFunc = function (error) {
                console.log("error" + error);
            };

            dataFactory.getSimplifiedAutoSuggest(vm.searchParams).then(sFunc, eFunc);
        }


        function viewHotel(hotel) {
            var searchParams = {
                hid: hotel.p,
                checkin: "6-2-2018",
                checkout: "6-8-2018",
                rooms: "1",
                guests: "1",
                destination: hotel.c + ',' + hotel.s + ',' + hotel.o
            };
            $state.go('hotel', searchParams);
        }


        function viewCity(city) {
            var searchParams = {
                ppnid: city.p,
                type: "city",
                display: city.c + ',' + city.s + ',' + city.o,
                checkin: "6-2-2018",
                checkout: "6-8-2018",
                rooms: "1",
                guests: "1",
            };
            $state.go('hotels', searchParams);
        }

        function viewAirport(air) {
            var searchParams = {
                ppnid: air.p,
                type: "air",
                display: air.a + ',' + air.s + ',' + air.o,
                checkin: "6-2-2018",
                checkout: "6-8-2018",
                rooms: "1",
                guests: "1",
            };
            $state.go('hotels', searchParams);
        }

        /*var successFunc = function success(response) {
            for(var i=0;i<response.data.length;i++) {
                if (response.data[i].Id === '9C6F82B1-3CD0-44F8-8CA3-3B84CA83474B'.toLowerCase() ||  response.data[i].Id === 'C40D5CA6-4C68-4F56-88A9-EEE5DFD34719'.toLowerCase() ||  response.data[i].Id === 'D6ADDA44-00AB-4A20-B6DF-1DFC38F52B2C'.toLowerCase() ||  response.data[i].Id === '474E8F1F-EA10-4018-9C80-27B647ED8F49'.toLowerCase() ||  response.data[i].Id === '255B3004-E23A-4195-8D08-3772D21242AD'.toLowerCase()) {
                    vm.cityBoxes.push(response.data[i]);
                }
            }
        };
        var errFunc = function error(response) {
            console.log('no city data found');
        };*/

        function isInCityBoxesToShow(index) {
            return $.inArray(index, vm.cityBoxesToShow) !== -1;
        }

        function getCityBoxColor(index) {
            if (index % 4 === 0) return 'ec5ca4';
            if (index % 4 === 1) return 'ebd719';
            if (index % 4 === 2) return '54b1db';
            if (index % 4 === 3) return '80c23f';
            return 'ffffff';
        }
        //dataFactory.getAllCities().then(successFunc,errFunc);

        function filterAttractions(type) {
            return _.filter(vm.directories, { Type: type });
        }

        function handleKeyPress($event) {
            var keyCode = $event.which || $event.keyCode;
            if (keyCode === 13) {
                reloadState();
            }
        }

        function reloadState() {
            $state.go('searchResult', { searchText: vm.searchText }, { reload: true });
        }
    };

    searchResultController.$inject = ['$scope', '$rootScope', 'dataFactory', '$stateParams', '$state'];
    app.controller('searchResultController', searchResultController);
};
