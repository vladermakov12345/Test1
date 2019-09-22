module.exports = function(app) {
	//require("./bookbox.less");

    var searchBarController = function($scope, $state, hotelSearchService, flightSearchService, carSearchService, $timeout, environmentService) {

        var vm = this;

        vm.env = environmentService();
        vm.hotelSearchService = hotelSearchService;

        //defaults :: all
        var dat = new Date();
        dat.setDate(dat.getDate() + 14);

//TODO: refactor these to come from the respective service so that we are defining in a single abstract place; this should not be in a directive

        //defaults :: hotel search

        //model :: hotel
        vm.hotelSearchRooms = hotelSearchService.default.rooms;
        vm.hotelDateCheckin = hotelSearchService.default.checkin;

        hotelSearchService.errs = [];

        //defaults :: flight search
        vm.flights_adults = 1;
        vm.flights_adults_min = 1;
        vm.flights_adults_max = 8;
        vm.flights_children = 0;
        vm.flights_children_min = 0;
        vm.flights_children_max = 8;
        vm.flights_departure_date = dat;    //flights departure date
        flightSearchService.errs = [];

        //defaults :: cars search
        vm.cars_pickup_date = dat;
        carSearchService.errs = [];

        vm.init = init;
        vm.resetErrs = resetErrs;
        vm.searchHotels = searchHotels;
        vm.moveToSearchButton = moveToSearchButton; 
        vm.searchFlights = searchFlights;
        vm.goCruising = goCruising;
        vm.searchCruises = searchCruises;
        vm.searchInsurance = searchInsurance;
        vm.searchCars = searchCars;

        function init() {

            //setup tab detection
            // $('#tab-link-hotels a').click(function(){
            //     vm.resetErrs();
            // });
            // $('#tab-link-flights a').click(function(){
            //     vm.resetErrs();
            // });
            // $('#tab-link-cars a').click(function(){
            //     vm.resetErrs();
            // });
        }

        function resetErrs() {
            vm.errs = [];
            hotelSearchService.errs = [];
            flightSearchService.errs = [];
            carSearchService.errs = [];
            //$scope.$apply();
        }

        /////////////////////////////////////////////
        ////////////////// HOTELS /////////////////// 
        /////////////////////////////////////////////


        //watch for errors coming from async call to validateAndGo (and elsewhere???)
        $scope.hotelSearchService = hotelSearchService;
        $scope.$watch('hotelSearchService.errs', function(newvalue) {
            vm.errs = [];
            vm.errs = newvalue;
        }, true);
        function searchHotels() {
            
            //load params
            hotelSearchService.setParams(
                vm.hotelDestination,
                vm.hotelDateCheckin,
                vm.hotelDateCheckout,
                vm.hotelSearchRooms,
                vm.hotelSearchAdults,
                vm.hotelSearchChildren);

            //valid so far?
            if (!hotelSearchService.hasValidParams()) {
                return;
            }
            
            //server validate and go to results page
            hotelSearchService.validateAndGo();
        }



        /////////////////////////////////////////////
        ////////////////// FLIGHTS ////////////////// 
        /////////////////////////////////////////////
        vm.selectedFlightWay='RoundTrip';

        function searchFlights() {

            //load params
            flightSearchService.setParams(
                vm.selectedFlightWay,
                vm.flights_departure_location,
                vm.flights_arrival_location,
                vm.flights_departure_date,
                vm.flights_return_date,
                vm.flights_adults,
                vm.flights_children);
                //vm.flights_cabin

            //quit if not valid
            if (!flightSearchService.isValid()) {
                return;
            }
            
            //server validate and go to results page
            var failCB = function () {
                //for example: vm.enableSearch();
            };
            flightSearchService.validateAndGo(failCB);
        }
        //watch for errors coming from async call to validateAndGo
        //TODO: determine if we need multiple watches or if we can watch hotel/flight search service in one
        $scope.flightSearchService = flightSearchService;
        $scope.$watch('flightSearchService.errs', function(newvalue) {
            vm.errs = [];
            vm.errs = newvalue;
        }, true);

        //set one way or round trip
        vm.setFlightWay = function(way) {
            vm.selectedFlightWay = way;
        };



        /////////////////////////////////////////////
        //////////////////  CARS   ////////////////// 
        /////////////////////////////////////////////
        function searchCars() {
            //load params
            carSearchService.setParams(
                vm.cars_pickup_location,
                vm.cars_pickup_date,
                vm.cars_pickup_time,
                vm.cars_dropoff_location,
                vm.cars_dropoff_date,
                vm.cars_dropoff_time);

            //valid so far?
            if (!carSearchService.hasValidParams()) {
                return;
            }
            
            //server validate and go to results page
            carSearchService.validateAndGo();
        }
        $scope.carSearchService = carSearchService;
        $scope.$watch('carSearchService.errs', function(newvalue) {
            vm.errs = [];
            vm.errs = newvalue;
        }, true);




        /////////////////////////////////////////////
        ////////////////// CRUISES  ///////////////// 
        /////////////////////////////////////////////
        function goCruising() {
            $state.go('cruises');
        }

        function searchCruises() {
            //validation
            vm.errs = [];

            //TODO: is there anything we want to validate at this point?

            var params = {
                phrase: vm.cruiseSearchText
            };

            $state.go('cruises', params);
        }

        ///////////////////////////////////////////////
        ////////////////// INSURANCE  ///////////////// 
        ///////////////////////////////////////////////
        function searchInsurance() {
            //validation
            vm.errs = [];

            //TODO: is there anything we want to validate at this point?

            var params = {
                
            };

            $state.go('insurance', params);
        }

//todo: abstract out these focus & move logic
        vm.focusTimeout = function (elem) {
          $timeout(function () {
            angular.element('#' + elem).find('button').trigger('click');
          });
        };

        function moveToSearchButton() {
            vm.focusTimeout('hotelSearchSubmit');
        };
   
    };

    searchBarController.$inject = ['$scope','$state','hotelSearchService', 'flightSearchService', 'carSearchService', '$timeout', 'environmentService'];

    var searchBarFunc = function (dataFactory,$state) {
        return {
          restrict: 'E',
          controller: searchBarController,
          controllerAs: 'searchBar',
          bindToController: true,
          template: require("./searchBar.html"),
          scope: {
            //type: '@',   
            //referenceid: '@'
          },
		      link: function(scope, element, attrs) {
		        // scope.GO = function () {
		        // 	//TODO: add a Join() to the account service and call it here
		        //   	console.log('TODO: add a Join() to the account service and call it here from comingsoon.js');
		        //   };

          //      
          //           
          //       
// scope.what = scope.bookbox.what;
// scope.bookbox.hotel_destination = attrs.city;
// scope.bookbox.bookingtype = attrs.type;

                //bookbox.hotel_destination = attrs.city;

                // scope.$watch('cityoptions',function() {
                //     bookbox.city = attrs.city;
                //     bookbox.city = scope.bookbox.city;
                //     //planner.cityOptions = scope.planner.cityoptions;
                // });
		      }
        };
    };

    searchBarFunc.$inject = ['dataFactory','$state'];
    app.directive('searchBar', searchBarFunc);
};

    