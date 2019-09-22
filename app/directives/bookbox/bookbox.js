(function() {
	require("./bookbox.less");

    var bookboxController = function($scope,$state,hotelSearchService, flightSearchService, carSearchService, $timeout) {

        var vm = this;

        vm.init = init;
        vm.errs = [];
        vm.go = go;
        vm.searchHotels = searchHotels;
        vm.searchCruises = searchCruises;
        vm.hotelSearchRooms = 1;
        vm.hotelSearchGuests = 1;
        vm.selectedFlightWay = 'RoundTrip';
        vm.searchFlights = searchFlights;
        vm.searchCars = searchCars;

        //defaults
        vm.flights_adults = 1;
        vm.flights_children = 0;

        vm.moveToHotelSearchCheckInDate = function () {
            $timeout(function () {
                angular.element('#hotel_search_checkin').find('button').trigger('click');
            });
        };

        vm.moveToHotelSearchChekoutDate = function () {
            $timeout(function () {
                angular.element('#hotel_search_checkout').find('button').trigger('click');
            });
        };

        vm.moveToHotelSearchRooms = function () {
            $timeout(function () {
                angular.element('#hotel_search_rooms').find('button').trigger('click');
            });
        };

        vm.moveToHotelSearchGuest = function () {
            $timeout(function () {
                angular.element('#hotel_search_guest').find('button').trigger('click');
            });
        };

        vm.moveToHotelSearchSubmit = function () {
            $timeout(function () {
                angular.element('#hotel_search_submit').focus();
            });
        };

        vm.moveToFlightArrivalLocation = function () {
            $timeout(function () {
                angular.element('#flight_arrival_location').find("input.ui-select-focusser").focus();
            });
        };

        vm.moveToFlightDepartureDate = function () {
            $timeout(function () {
                angular.element('#flight_departure_date').find('button').trigger('click');
            });
        };

        vm.moveToFlightArrivalDate = function () {
            $timeout(function () {
                angular.element('#flight_arrival_date').find('button').trigger('click');
            });
        };

        vm.moveToFlightPersonAdult = function () {
            $timeout(function () {
                angular.element('#flight_persons_adult').find('button').trigger('click');
            });
        };

        vm.moveToFlightPersonChild = function () {
            $timeout(function () {
                angular.element('#flight_persons_child').find('button').trigger('click');
            });
        };

        vm.moveToFlightSearchSubmit = function () {
            $timeout(function () {
                angular.element('#flight_search_submit').focus();
            });
        };

        vm.moveToCarsPickupDate = function () {
            $timeout(function () {
                angular.element('#cars_pickup_date').find('button').trigger('click');
            });
        };

        vm.moveToCarsPickupTime = function () {
            $timeout(function () {
                angular.element('#cars_pickup_time').find('button').trigger('click');
            });
        };

        vm.moveToCarsDropoffLocation = function () {
            $timeout(function () {
                angular.element('#cars_dropoff_location').find("input.ui-select-focusser").focus();
            });
        };

        vm.moveToCarsDropoffDate = function () {
            $timeout(function () {
                angular.element('#cars_dropoff_date').find('button').trigger('click');
            });
        };

        vm.moveToCarsDropoffTime = function () {
            $timeout(function () {
                angular.element('#cars_dropoff_time').find('button').trigger('click');
            });
        };

        vm.moveToCarsSearchSubmit = function () {
            $timeout(function () {
                angular.element('#cars_search_submit').focus();
            });
        };
        
        //initialization
        vm.init();

        //functional definitions
        function init() {

            //reset hotelSearchService
            $scope.hotelSearchService = hotelSearchService;

            //reset hotel search service errors
            hotelSearchService.resetParams();

            //watch for errors coming from async call to validateAndGo (and elsewhere???)
            $scope.$watch('hotelSearchService.errs', function(newvalue) {
                vm.errs = newvalue;
            }, true);


            //default what to book
            if (vm.what) {
                //vm.selectedDirectory = vm.type;
            }
            //default city to book
            if (vm.city) {
                vm.hotel_destination = vm.city;
                //vm.selectedCity = vm.GetCityObject(vm.city);
            }

            //set default checkin date
            var dat = new Date();
            dat.setDate(dat.getDate() + 14);
            vm.hotelDateCheckin = dat;

            //set booking options defaults
            vm.hotel_rooms = 1;
            vm.hotel_guests = 1;
        }

        function searchFlights() {
            vm.errs = [];

            //load params
            flightSearchService.setParams(
            vm.selectedFlightWay,
            vm.flights_departure_location,
            vm.flights_arrival_location,
            vm.flights_departure_date,
            vm.flights_return_date,
            vm.flights_adults,
            vm.flights_children);

            //valid?
            if (!flightSearchService.isValid()) {
                vm.errs = flightSearchService.errs;
                return;
            }

            //server validate and go to results page
            var failCB = function (res) {
                console.log(res);
            };
            flightSearchService.validateAndGo(failCB);
        }

        function searchCars() {
            //load params
            carSearchService.setParams(
            vm.cars_pickup_location,
            vm.cars_pickup_date,
            vm.cars_pickup_time,
            vm.cars_dropoff_location,
            vm.cars_dropoff_date,
            vm.cars_dropoff_time);

            $state.go('cars', carSearchService.getUrlSafeParams());

            // //valid so far?
            // if (!carSearchService.hasValidParams()) {
            //     return;
            // }

            // //server validate and go to results page
            // carSearchService.validateAndGo();
        }

        var stopWatchForCarSearchError = $scope.$watch('carSearchService.errs', function(newValue) {
            vm.errs = [];
            vm.errs = newValue;
        }, true);

        var stopWatchForFlightSearchError = $scope.$watch('flightSearchService.errs', function(newValue) {
            vm.errs = [];
            vm.errs = newValue;
        }, true);

        $scope.$on('$destroy', function () {
           stopWatchForCarSearchError();
           stopWatchForFlightSearchError();
        });

        //-- SEARCH HOTELS
        function searchHotels() {
            //READY FOR DELETING
            //temporary: begin
            //vm.env = environmentService
            // if (vm.env.name === 'production') {
            //     $state.go('hotelscomingsoon'); 
            //     return;
            // }
            //temporary: end

            //set params
            hotelSearchService.setParams(
                vm.hotelDestination,
                vm.hotelDateCheckin,
                vm.hotelDateCheckout,
                vm.hotelSearchRooms,
                vm.hotelSearchGuests);

            //valid so far?
            if (!hotelSearchService.hasValidParams()) {
                //todo: you may need to remove this line b/c watch covers it
                vm.errs = hotelSearchService.errs;
                return;
            }

            //server validate and go to results page
            hotelSearchService.validateAndGo(); 
        }

        function go() {
            $state.go(vm.bookingtype); 
        }

        $scope.$watch('vm.city', function(newvalue) {
            if (newvalue) {
                $scope.bookbox.hotel_destination = newvalue;
            }
        });

        //-- SEARCH CRUISES
        function searchCruises() {
            var params = {
                phrase: vm.cruises_searchText
            };

            $state.go('cruises', params);
        }

    };

    bookboxController.$inject = ['$scope','$state','hotelSearchService', 'flightSearchService', 'carSearchService', '$timeout'];

    var bookboxFunc = function (dataFactory,$state) {
        return {
        	restrict: 'E',
		    // scope: {
      //       	what: "=?",
      //           city: "="
      //       },
            controller: bookboxController,
            controllerAs: 'bookbox',
            bindToController: true,
		    template: require("./bookbox.html"),
		    link: function(scope, element, attrs) {
		        // scope.GO = function () {
		        // 	//TODO: add a Join() to the account service and call it here
		        //   	console.log('TODO: add a Join() to the account service and call it here from comingsoon.js');
		        //   };

          //      
          //           
          //       
                scope.what = scope.bookbox.what;
                scope.bookbox.hotel_destination = attrs.city;
                scope.bookbox.bookingtype = attrs.type;

                //bookbox.hotel_destination = attrs.city;

                // scope.$watch('cityoptions',function() {
                //     bookbox.city = attrs.city;
                //     bookbox.city = scope.bookbox.city;
                //     //planner.cityOptions = scope.planner.cityoptions;
                // });
		    }
        };
    };

    bookboxFunc.$inject = ['dataFactory','$state'];
    angular.module('app').directive('bookbox', bookboxFunc);
})();

    