module.exports = function (app) {
    var flightSearchController = function ($state, $stateParams, $scope, $rootScope, flightSearchService, $timeout, dataFactory, environmentService, $window, $filter, utilities, localStorageService) {
        require("./flightSearch.less");
        var vm = this;

        vm.env = environmentService();
        vm.init = init;
        vm.initSearchBoxUI = initSearchBoxUI;

        //defaults
        vm.flightWay = 'RoundTrip';  //default

        //search
        vm.submitSearch = submitSearch;
        vm.enableSearch = enableSearch;
        vm.disableSearch = disableSearch;

        //flags
        vm.isWaiting = false;
        vm.isButtonDisable = false;
        vm.searchInProgress = false;
        vm.sortOption = 'lth';

        //results
        vm.showErrors = false;
        vm.results = [];
        vm.displayMobileFilter = false;
        vm.displaySeachBar = true;
        vm.displayCancelButton = false;
        vm.lowestPrice = 10000;
        vm.nonStopPrice = 10000;
        vm.getMarketingPrices = getMarketingPrices;
        vm.sortOption = 'lth';

        //navigation
        vm.next = next;

        //filter
        vm.priceGroups = [];
        vm.takeoff = [];
        vm.landing = [];
        vm.stops = [];
        vm.filterCritearea = {};
        vm.resultsFilterFunc = resultsFilterFunc;
        vm.setFilteredResults = setFilteredResults;
        vm.filterParams = {};
        vm.selectedAirlineTypes = {};

        // filter for badge
        vm.removeBadge = removeBadge;
        vm.addBadge = addBadge;

        vm.utilities = utilities;

        //-- WATCHES --//
        $scope.flightSearchService = flightSearchService;
        var stopFlightSearchErrors = $scope.$watch('flightSearchService.errs', function (newvalue) {
            vm.errs = [];
            vm.errs = newvalue;
            // setTimeout(function() {
            //     if(vm.errs.length>0)
            //     {
            //        vm.isButtonDisable=false;
            //     }
            // },10);
        }, true);

        vm.init();

        function init() {

            //submit search if we have sufficient criteria
            vm.disableSearch();

            //identify/validate incoming search parameters
            flightSearchService.setParamsFromState($stateParams);

            //initialize search box UI
            vm.initSearchBoxUI();

            //setup meta tags
            var title = 'Book a flight';
            var desc = 'View accessibility ratings and reviews for U.S. airlines.  Flown in America?  Contribute an airline accessibility review!';
            $rootScope.metaTagService.setup({
                metaTitle: title,
                ogTitle: title,
                twitterTitle: title,
                metaDescription: desc,
                ogDescription: desc,
                twitterDescription: desc,
                breadcrumbJson: [{
                  type: 'ListItem',
                  position: 2,
                  name: 'Search Flights',
                  item: 'https://accessibleGO.com/flights'
                }]
            });

            //valid params?
            if (!flightSearchService.isValid()) {
                //ensure search is enabled
                vm.enableSearch();

                //allow errors to be shown
                vm.showErrors = false;

                return;
            }

            //search            
            var flightSearchSuccessCB = function (response) {

                //ensure search is enabled
                vm.enableSearch();

                //allow errors to be shown
                vm.showErrors = true;

                //ppn error
                if (response.data.status ==='fail') {
                    return;
                }

                //show results
                vm.results = response.data.data.results;

                //left side filters
                vm.applyFilters();

                //shrink search form
                vm.displaySeachBar = false;

                //determine marketable prices
                vm.getMarketingPrices();
            };
            var flightSearchErrorCB = function (response) {

                //ensure search is enabled
                vm.enableSearch();

                //allow errors to be showwn
                vm.showErrors = true;
            };
            flightSearchService.searchFlights(flightSearchSuccessCB, flightSearchErrorCB);
        }

        vm.applyFilters = function () {
            vm.filterFlightList = vm.results.result.itinerary_data;

            vm.filterFlightData = vm.filterFlightList;

            //init filter: airlines Name
            var airlineName = _.uniq(_.map(vm.filterFlightList, 'slice_data[0].airline.name'));
            vm.filterCritearea.airlineNames = _.map(airlineName, function (type) {
                var length = _.reject(vm.filterFlightList, function (item) {
                    return (item.slice_data[0].airline.name !== type);
                }).length;
                return { name: type, count: length };
            });

            //init filter: stops
            vm.stops = [
                { title: "Non Stop", value: 0, checked: false },
                { title: "One Stop", value: 1, checked: false },

            ];

            vm.filterCritearea.stops = _.map(vm.stops, function (stop) {
                var length = _.filter(vm.filterFlightList, function (item) {
                    return (item.slice_data[0].info.connection_count == stop.value);
                }).length;
                return { list: stop, count: length };
            });


            //init filter: pricegroups
            vm.priceGroups = [
                { title: "$250 - $350", min: 250, max: 349, checked: false },
                { title: "$350 - $450", min: 350, max: 449, checked: false },
                { title: "$450 - $550", min: 450, max: 549, checked: false },
                { title: "$550 - $650", min: 550, max: 649, checked: false },
                { title: "$650 - $750", min: 650, max: 749, checked: false }
            ];

            vm.filterCritearea.price = _.map(vm.priceGroups, function (priceRange) {
                var length = _.filter(vm.filterFlightList, function (item) {
                    return (item.price_details.baseline_base_fare >= priceRange.min && item.price_details.baseline_base_fare <= priceRange.max);
                }).length;
                return { list: priceRange, count: length };
            });

            //init filter: takeoff/lnanding
            vm.takeoff = [
                { title: "Midnight to 9am", minTime: "00:00", maxTime: "08:59", checked: false },
                { title: "9am to Noon", minTime: "09:00", maxTime: "11:59", checked: false },
                { title: "Noon to 3pm", minTime: "12:00", maxTime: "14:59", checked: false },
                { title: "3pm to 6pm", minTime: "15:00", maxTime: "17:59", checked: false },
                { title: "6pm to Midnight", minTime: "18:00", maxTime: "23:59", checked: false }
            ];

            vm.filterCritearea.takeoff = _.map(vm.takeoff, function (takeoffTime) {
                var length = _.filter(vm.filterFlightList, function (item) {
                    return (item.slice_data[0].departure.datetime.time_24h >= takeoffTime.minTime && item.slice_data[0].departure.datetime.time_24h <= takeoffTime.maxTime);
                }).length;
                return { list: takeoffTime, count: length };
            });

            //  init filter: landing
            vm.landing = [
                { title: "Midnight to 9am", minTime: "00:00", maxTime: "08:59", checked: false },
                { title: "9am to Noon", minTime: "09:00", maxTime: "11:59", checked: false },
                { title: "Noon to 3pm", minTime: "12:00", maxTime: "14:59", checked: false },
                { title: "3pm to 6pm", minTime: "15:00", maxTime: "17:59", checked: false },
                { title: "6pm to Midnight", minTime: "18:00", maxTime: "23:59", checked: false }
            ];

            vm.filterCritearea.landing = _.map(vm.landing, function (landingTime) {
                var length = _.filter(vm.filterFlightList, function (item) {
                    return (item.slice_data[0].arrival.datetime.time_24h >= landingTime.minTime && item.slice_data[0].arrival.datetime.time_24h <= landingTime.maxTime);
                }).length;
                return { list: landingTime, count: length };
            });
        };


        function setFilteredResults() {
            vm.filterFlightData = $filter('filter')(
                vm.filterFlightList,
                vm.resultsFilterFunc
            );
            vm.addBadge();
        }


        function resultsFilterFunc(item, idx, arr) {

            //apply filter for price 
            var isPriceRangeMatch = false;
            var isPriceMatchSelected = false;
            var isPriceMatch = false;
            var price = item.price_details.baseline_base_fare;
            if (price) {
                for (var p = 0; p < vm.priceGroups.length; p++) {
                    var priceRange = vm.priceGroups[p];
                    if (priceRange.checked) {
                        isPriceMatchSelected = true;
                        if (price >= priceRange.min && price <= priceRange.max) {
                            isPriceMatch = true;
                            break;
                        }
                    }
                }
            }
            if (!isPriceMatchSelected || isPriceMatch) {
                isPriceRangeMatch = true;
            }
            if (!isPriceRangeMatch) {
                return false;
            }

               //apply filter for stops
               var isStopSelectMatch = false;
               var isStopSelected = false;
               var isStopMatch = false;
               var getStop = item.slice_data[0].info.connection_count;
               for (var s = 0; s < vm.stops.length; s++) {
                   var stops = vm.stops[s];
                   if (stops.checked) {
                       isStopSelected = true;
                       if (getStop == stops.value) {
                           isStopMatch = true;
                           break;
                       }
                   }
               }
   
               if (!isStopSelected || isStopMatch) {
                   isStopSelectMatch = true;
               }
               if (!isStopSelectMatch) {
                   return false;
               }

            // filter for airlines 
            vm.filterParams.airLinesType = [];

            _.each(vm.selectedAirlineTypes, function (value, key) {
                if (value) {
                    vm.filterParams.airLinesType.push(key);
                }
            });

            var arrlineTypes = vm.filterParams.airLinesType;

            var isAirlineTypeSelectMatch = false;
            var isAirlineTypeSelected = false;
            var isAirlineTypeMatch = false;
            var airlineType = item.slice_data[0].airline.name;
            if (airlineType) {
                for (var b = 0; b < arrlineTypes.length; b++) {
                    isAirlineTypeSelected = true;
                    if (airlineType === arrlineTypes[b]) {
                        isAirlineTypeMatch = true;
                        break;
                    }
                }
            }
            if (!isAirlineTypeSelected || isAirlineTypeMatch) {
                isAirlineTypeSelectMatch = true;
            }
            if (!isAirlineTypeSelectMatch) {
                return false;
            }

            //apply filter for departure time
            var isTakeOffRangeMatch = false;
            var isTakeOffSelected = false;
            var isTakeOffMatch = false;
            var takeOffTime = item.slice_data[0].departure.datetime.time_24h;
            if (takeOffTime) {
                for (var t = 0; t < vm.takeoff.length; t++) {
                    var takeoffRange = vm.takeoff[t];
                    if (takeoffRange.checked) {
                        isTakeOffSelected = true;
                        if (takeOffTime >= takeoffRange.minTime && takeOffTime <= takeoffRange.maxTime) {
                            isTakeOffMatch = true;
                            break;
                        }
                    }
                }
            }
            if (!isTakeOffSelected || isTakeOffMatch) {
                isTakeOffRangeMatch = true;
            }
            if (!isTakeOffRangeMatch) {
                return false;
            }

            //apply filter for arrival time
            var isArrivalRangeMatch = false;
            var isArrivalSelected = false;
            var isArrivalMatch = false;
            var arrivalTime = item.slice_data[0].arrival.datetime.time_24h;
            if (arrivalTime) {
                for (var a = 0; a < vm.landing.length; a++) {
                    var arrivalRange = vm.landing[a];
                    if (arrivalRange.checked) {
                        isArrivalSelected = true;
                        if (arrivalTime >= arrivalRange.minTime && arrivalTime <= arrivalRange.maxTime) {
                            isArrivalMatch = true;
                            break;
                        }
                    }
                }
            }
            if (!isArrivalSelected || isArrivalMatch) {
                isArrivalRangeMatch = true;
            }
            if (!isArrivalRangeMatch) {
                return false;
            }

            return true;
        }

        function removeBadge(obj, badgeName) {

            if (badgeName == 'airlines') {
                _.each(vm.selectedAirlineTypes, function (value, key) {
                    if (key == obj.title && value == true) {
                        vm.selectedAirlineTypes[key] = false;
                    }
                });
            }

            if (badgeName == 'price') {
                for (var badgePrice = 0; badgePrice < vm.priceGroups.length; badgePrice++) {
                    if (vm.priceGroups[badgePrice].title == obj.title) {
                        obj.checked = false;
                    }
                }
            }
            if (badgeName == 'stops') {
                for (var badgeStops = 0; badgeStops < vm.stops.length; badgeStops++) {
                    if (vm.stops[badgeStops].title == obj.title) {
                        obj.checked = false;
                    }
                }
            }
            if (badgeName == 'takeOff') {
                for (var badgeTakeoff = 0; badgeTakeoff < vm.takeoff.length; badgeTakeoff++) {
                    if (vm.takeoff[badgeTakeoff].title == obj.title) {
                        obj.checked = false;
                    }
                }
            }
            if (badgeName == 'landing') {
                for (var badgeLanding = 0; badgeLanding < vm.landing.length; badgeLanding++) {
                    if (vm.landing[badgeLanding].title == obj.title) {
                        obj.checked = false;
                    }
                }
            }

            vm.setFilteredResults();
        }

        function addBadge() {
            vm.filterPriceBadge = [];
            vm.filterTakeOffBadge = [];
            vm.filterLandingBadge = [];
            vm.filterStopsBadge = [];
            vm.filterAirlinesBadge = [];

            _.each(vm.selectedAirlineTypes, function (value, key) {
                if (value) {
                    vm.filterAirlinesBadge.push({ title: key, checked: value });
                }
            });

            for (var p = 0; p < vm.priceGroups.length; p++) {
                var priceRange = vm.priceGroups[p];
                if (priceRange.checked) {
                    vm.filterPriceBadge.push(priceRange);
                }
            }

            for (var t = 0; t < vm.takeoff.length; t++) {
                var takeOffRange = vm.takeoff[t];
                if (takeOffRange.checked) {
                    vm.filterTakeOffBadge.push(takeOffRange);
                }
            }

            for (var l = 0; l < vm.landing.length; l++) {
                var landingRange = vm.landing[l];
                if (landingRange.checked) {
                    vm.filterLandingBadge.push(landingRange);
                }
            }

            for (var s = 0; s < vm.stops.length; s++) {
                var stopsRange = vm.stops[s];
                if (stopsRange.checked) {
                    vm.filterStopsBadge.push(stopsRange);
                }
            }


        }


        function initSearchBoxUI() {

            //init way
            if (flightSearchService.params.way) {
                vm.flightWay = flightSearchService.params.way;
            }

            //init departure UI
            if (flightSearchService.params.departure_ppnid) {
                var departureCity = {
                    ppnid: flightSearchService.params.departure_ppnid,
                    type: flightSearchService.params.departure_type,
                    display: flightSearchService.params.departure_display
                };
                vm.flights_departure_location = departureCity;
            }

            //init destination UI
            if (flightSearchService.params.arrival_ppnid) {
                var destinationCity = {
                    ppnid: flightSearchService.params.arrival_ppnid,
                    type: flightSearchService.params.arrival_type,
                    display: flightSearchService.params.arrival_display
                };
                vm.flights_arrival_location = destinationCity;
            }

            //init departure date UI
            if (flightSearchService.params.departureDate) {
                vm.flights_departure_date = flightSearchService.params.departureDate;
            }

            //init return date UI
            if (flightSearchService.params.returnDate) {
                vm.flights_return_date = flightSearchService.params.returnDate;
            }

            //init guest UI
            //if (flightSearchService.params.adults) {
            vm.flights_adults = flightSearchService.params.adults;
            //}

            //init guest UI
            //if (flightSearchService.params.children) {
            vm.flights_children = flightSearchService.params.children;
            //}

            //init cabin class
            vm.flights_cabin = flightSearchService.params.cabin
        }



        function submitSearch() {

            //allow errors to be shown
            vm.showErrors = true;

            //set params from searchbox
            flightSearchService.setParams(
                vm.flightWay,
                vm.flights_departure_location,
                vm.flights_arrival_location,
                vm.flights_departure_date,
                vm.flights_return_date,
                vm.flights_adults,
                vm.flights_children,
                vm.flights_cabin
            );


            //quit if not valid
            if (!flightSearchService.isValid()) {
                return;
                // setTimeout(function() {
                //     if(vm.errs.length>0)
                //     {
                //        vm.isButtonDisable=false;
                //    }
                //    return;
                // },10);
            }

            //validate and reload page with search params
            vm.disableSearch();
            var failCB = function () {
                vm.enableSearch();
            };
            flightSearchService.validateAndGo(failCB);
        }

        function next(option) {
            console.log(option);

            if (vm.results.result.search_type === "OneWay" || vm.results.result.search_type === "Multi") {

                var reserveParams = {
                    ppn_bundle: option.ppn_contract_bundle,
                    sid: vm.results.result.sid
                };

                //show reserve page in new window
                $window.open(vm.env.SPA_URL + '/flights/reserve?ppn_bundle=' + reserveParams.ppn_bundle + '&sid=' + reserveParams.sid, '_blank');
                //$state.go('flight_reserve',reserveParams);
            }

            if (vm.results.result.search_type === "RoundTrip") {
                $state.go('flightSelectReturn', {
                    ppn_bundle: option.ppn_return_bundle,
                    sid: vm.results.result.sid
                });
                return;
            }
        }

        //-- PAGE STATE --//
        function disableSearch() {
            vm.isButtonDisable = true;
            vm.searchInProgress = true;
        }
        function enableSearch() {
            vm.isWaiting = false;
            vm.isButtonDisable = false;
            vm.searchInProgress = false;
        }

        //called locally after search params are loaded and validated in init()
        //function searchFlights() {

        //reset search
        //vm.errs = [];
        // vm.showErrors = true;
        // vm.isWaiting = true;
        // vm.isButtonDisable = true;
        // vm.searchInProgress = true;


        //TODO: cache and serve
        // vm.loadResultsFromCache = ($stateParams.c && $stateParams.c === 'y');
        // if (vm.loadResultsFromCache && sessionService.existsLastHotelSearch()) {
        // vm.searchresults = sessionService.getLastHotelSearch().Results;
        // console.log('applying lastHotelSearch');
        // vm.setSearchResultsHeading();
        // return;
        // }
        //}

        //-- SEARCH BAR MOVEMENT --//
        vm.moveToArrivalLocation = function () {
            $timeout(function () {
                angular.element('#flights_arrival_location').find("input.ui-select-focusser").focus();
            });
        };

        vm.moveToDepartingDate = function () {
            $timeout(function () {
                angular.element('#departing').find('button').trigger('click');
            });
        };

        vm.moveToReturningDate = function () {
            $timeout(function () {
                angular.element('#returning').find('button').trigger('click');
            });
        };

        vm.moveToSelectAdults = function () {
            $timeout(function () {
                angular.element('#flight_number_of_adults').find('button').trigger('click');
            });
        };

        vm.moveToSelectChild = function () {
            $timeout(function () {
                angular.element('#flight_number_of_children').find('button').trigger('click');
            });
        };

        vm.moveToCabinClass = function () {
            $timeout(function () {
                angular.element('#flight_cabin_class').find('button').trigger('click');
            });
        };

        vm.moveToSubmit = function () {
            $timeout(function () {
                angular.element('#flight_search_submit').focus();
            });
        };

        //clear the watch
        $scope.$on('$destroy', function () {
            stopFlightSearchErrors();
        });


        //-- UI HELPERS --//
        function getMarketingPrices() {
            $.each(vm.results.result.itinerary_data, function (idx, val) {

                //lowest price
                if (val.price_details.display_total_fare<vm.lowestPrice) {
                    vm.lowestPrice = val.price_details.display_total_fare;
                }

                //nonstop price
                if (val.price_details.display_total_fare<vm.nonStopPrice && val.slice_data[0].info.connection_count===0) {
                    vm.nonStopPrice = val.price_details.display_total_fare;
                }

            });
        }

    };

    flightSearchController.$inject = ['$state','$stateParams', '$scope', '$rootScope', 'flightSearchService', '$timeout', 'dataFactory', 'environmentService', '$window', '$filter', 'utilities', 'localStorageService'];
    app.controller('flightSearchController', flightSearchController);
};
