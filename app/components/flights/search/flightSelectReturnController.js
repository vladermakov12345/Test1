module.exports = function (app) {
    var flightSelectReturnController = function ($state, $stateParams, $scope, $rootScope, flightSelectReturnService, $timeout, dataFactory, environmentService, $window, $filter, utilities, flightSearchService) {
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

        //UI flags
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

        vm.utilities = utilities;

        //-- WATCHES --//
        $scope.flightSelectReturnService = flightSelectReturnService;
        var stopFlightSearchErrors = $scope.$watch('flightSelectReturnService.errs', function (newvalue) {
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
            flightSelectReturnService.setParamsFromState($stateParams);

            //valid params?
            if (!flightSelectReturnService.isValid()) {

                //ensure search is enabled
                vm.enableSearch();

                //allow errors to be shown
                vm.showErrors = false;
            
                return;
            }

        	//search
            var flightReturnSearchSuccessCB = function(response) {

            	//ensure search is enabled
                vm.enableSearch();

                //allow errors to be shown
                vm.showErrors = true;

            	//do nothing if fails
                // if (response.data.status==='fail') {  //!response.data.data || 
                // 	console.log(response);
                //     return;
                // }

                //show results
            	vm.results = response.data.data.results;

                //initialize search box UI
                vm.initSearchBoxUI();

                //left side filters
                vm.applyFilters();

                //shrink search form
                vm.displaySeachBar = false;

                //determine marketable prices
                vm.getMarketingPrices();
            };
            var flightReturnSearchErrorCB = function(response) {

                //ensure search is enabled
            	vm.enableSearch();

            	//allow errors to be showwn
                vm.showErrors = true;
            };
            flightSelectReturnService.searchReturnFlights(flightReturnSearchSuccessCB, flightReturnSearchErrorCB);
        }

        //-- FILTERS --//
        vm.applyFilters = function() {
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
                    { title: "Not Stop", value: 0, checked: false },
                    { title: "One Stop", value: 1, checked: false },

                ];

                vm.filterCritearea.stops = _.map(vm.stops, function (stop) {
                    var length = _.filter(vm.filterFlightList, function (item) {
                        return (item.slice_data[0].info.stop_count == stop.value);
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

//copied from flightsearchcontroller
vm.resultsFilterFunc = resultsFilterFunc;
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

            //apply filter for stops
            var isStopSelectMatch = false;
            var isStopSelected = false;
            var isStopMatch = false;
            var getStop = item.slice_data[0].info.stop_count;
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


            return true;
        }

//copied from flight search controller
        vm.setFilteredResults = setFilteredResults;
        function setFilteredResults() {
            vm.filterFlightData = $filter('filter')(
                vm.filterFlightList,
                vm.resultsFilterFunc
            );
        }


        
        function initSearchBoxUI() {

            vm.flightWay = 'RoundTrip';

            var origin = vm.results.result.search_data[0].origin;
            vm.flights_departure_location = {
                ppnid: origin.code,
                type: origin.isAirport?'airport':'city',
                display: origin.city+', '+origin.state+' '+origin.country
            };

            var destination = vm.results.result.search_data[0].destination;
            vm.flights_arrival_location = {
                ppnid: destination.code,
                type: destination.isAirport?'airport':'city',
                display: destination.city+', '+destination.state+' '+destination.country
            };

            vm.flights_departure_date = new Date(vm.results.result.search_data[0].departure_date);
            vm.flights_return_date = new Date(vm.results.result.search_data[1].departure_date);

            //TODO: nothing in the ppn data is providing this, you'll have to append to url to get:
            vm.flights_adults = 1;
            vm.flights_children = 0;
        }

        function next(option) {
            
            var reserveParams = {
                ppn_bundle: option.ppn_contract_bundle,
                sid: vm.results.result.sid
            };

            //show reserve page in new window
            $window.open(vm.env.SPA_URL + '/flights/reserve?ppn_bundle='+ reserveParams.ppn_bundle + '&sid=' + reserveParams.sid, '_blank');
        }

        function submitSearch() {
            
            //set params from searchbox
            flightSearchService.setParams(
                vm.flightWay,
                vm.flights_departure_location,
                vm.flights_arrival_location,
                vm.flights_departure_date,
                vm.flights_return_date,
                vm.flights_adults,
                vm.flights_children
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
            var failCB = function() {
                vm.enableSearch();
                vm.showErrors = true;
                vm.errs = flightSearchService.errs;
            };
            flightSearchService.validateAndGo(failCB);
        }


        //-- UI HELPERS --//
        function getMarketingPrices() {
            $.each(vm.results.result.itinerary_data,function(idx,val) {

                //lowest price
                if (val.price_details.display_base_fare<vm.lowestPrice) {
                    vm.lowestPrice = val.price_details.display_base_fare;
                }

                //nonstop price
                if (val.price_details.display_base_fare<vm.nonStopPrice && val.slice_data[0].info.connection_count===0) {
                    vm.nonStopPrice = val.price_details.display_base_fare;
                }

            });
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
    };

    flightSelectReturnController.$inject = ['$state', '$stateParams', '$scope', '$rootScope', 'flightSelectReturnService', '$timeout', 'dataFactory','environmentService','$window', '$filter', 'utilities', 'flightSearchService'];
    app.controller('flightSelectReturnController', flightSelectReturnController);
};
