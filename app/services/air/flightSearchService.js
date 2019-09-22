/*
    persist the parameters required for searching flights
*/
module.exports = function(mod){
    var flightSearchService = function(dataFactory,$state,utilities,$stateParams) {
        
        var vm = this;

        vm.errs = [];
        this.params = {};

        //vm.getErrorMessage = getErrorMessage;

        this.resetParams = function() {
            vm.errs = [];
            this.params = {
                way: undefined,
                departure_ppnid: undefined,
                departure_type: undefined,
                departure_display: undefined,
                arrival_ppnid: undefined,
                arrival_type: undefined,
                arrival_display: undefined,
                departureDate: undefined,
                returnDate: undefined,
                adults: undefined,
                children: undefined,
                cabin: undefined
            };
        };

        //this is called from ???  non hotels pages (hotel, home, bookbox)
        this.setParams = function(way, departureLocation, arrivaLocation, departureDate, returnDate, adults, children, cabin) {
        
            this.resetParams();

            //check way
            this.validateWay(way, departureDate);
            if (way !== 'OneWay' && way !== 'RoundTrip' && way !== 'Multi') {
                vm.errs.push('Please select either Roundtrip or One-way.');
            } else {
                this.params.way = way;
            }

            //check departure location
            if (!departureLocation) {
                vm.errs.push('Please specify a departure location.');
            } else {
                if (departureLocation.ppnid) this.params.departure_ppnid = departureLocation.ppnid;
                if (departureLocation.type) this.params.departure_type = departureLocation.type;
                if (departureLocation.display) this.params.departure_display = departureLocation.display;
            }

            //check arrival location
            if (!arrivaLocation) {
                vm.errs.push('Please specify where you are flying to.');
            } else {
                if (arrivaLocation.ppnid) this.params.arrival_ppnid = arrivaLocation.ppnid;
                if (arrivaLocation.type) this.params.arrival_type = arrivaLocation.type;
                if (arrivaLocation.display) this.params.arrival_display = arrivaLocation.display;
            }

            //check departure date
            if (!departureDate || departureDate == 'Invalid Date') {
                vm.errs.push('Please specify a departure date.');
            } else {
                this.params.departureDate = new Date(departureDate);
            }

            //check return date
            if (way === 'RoundTrip') {
                if (!returnDate || returnDate == 'Invalid Date') {
                    vm.errs.push('Please specify a return date.');
                } else {
                    this.params.returnDate = new Date(returnDate);
                }
            }

            //check # adults
            if (!adults) {
                vm.errs.push('Please specify number of adults.');
            } else {
                this.params.adults = parseInt(adults);
            }

            //check # adults
            if (children) {
                this.params.children = parseInt(children);
            }

            //check cabin class
            if (cabin) {
                this.params.cabin = cabin;
            }
        };

        this.isValid = function() {
            return vm.errs.length===0;
        };

        //validate that we have correct set of parameters to do a search for hotels
        this.validateAndGo = function(failCB) {
            var self=this;

            var successFunc = function (response) {
                if (!response.data.IsValid) {
                    self.errs = response.data.Errs;
                    failCB();
                    return;
                }

                $state.go('flights', self.getUrlSafeParams(), {reload: true});
            };

            var errFunc = function (response) {
                //todo: determine how to log so we know this is a problem!
                self.errs.push('Error occurred while validating flight search params: ' + response);
                failCB();
                return;
            };

            dataFactory.validateSearchFlights(this.params).then(successFunc,errFunc);
        };

        this.searchFlights = function(successCB, errorCB) {

            var succcessFunc = function(response) {

                //specific errors to show?
                if (response.data.errors && response.data.errors.length > 0) {

                    //for simplicity, read only first error message
                    var e = response.data.errors[0];
                    //var errMsg = vm.getErrorMessage(e.code);
                    vm.errs.push(e.message.replace('Air.FlightDepartures: ',''));
                }

                successCB(response);
            };
            var errFunc = function(response) {

                errorCB(response);
            };
            dataFactory.searchFlights(this.params).then(succcessFunc, errFunc);
        };

        this.setParamsFromState = function(state) {

            this.resetParams();

            this.validateWay(state.way);

            //departure
            if (!state.dep_ppnid) vm.errs.push('From where are you departing');
            if (state.dep_ppnid) this.params.departure_ppnid = state.dep_ppnid;

            if (!state.dep_type) vm.errs.push('Departure type is missing');   //should never happen b/c user cannot correct
            if (state.dep_type) this.params.departure_type = state.dep_type;

            if (state.dep_display) this.params.departure_display = state.dep_display;

            //arrival
            if (!state.arr_ppnid) vm.errs.push('Please specify a destination');
            if (state.arr_ppnid) this.params.arrival_ppnid = state.arr_ppnid;

            if (!state.arr_type) vm.errs.push('Arrival type is missing');   //should never happen b/c user cannot correct
            if (state.arr_type) this.params.arrival_type = state.arr_type;

            if (state.arr_display) this.params.arrival_display = state.arr_display;


            //departure date
            if (!state.dep_date) {
                vm.errs.push('Please specify a departure date');
            } else {
                this.params.departureDate = new Date(state.dep_date.split('-').join('/'));
            }

            //return date
            if (this.params.way === 'RoundTrip') {
                if (!state.return_date) {
                    vm.errs.push('Please specify a return date');
                } else {
                    this.params.returnDate = new Date(state.return_date.split('-').join('/'));
                }
            }

            //guests
            if (!state.adults) {
                this.params.adults = 1;
            } else {
                //todo: handle lower/upper bound
                this.params.adults = parseInt(state.adults);
            }

            if (!state.children) {
                this.params.children = 0;
            } else {
                //todo: handle lower/upper bound
                this.params.children = parseInt(state.children);
            }

            //cabin class
            if (!state.cabin) {
                this.params.cabin = 'No Preference';
            } else {
                this.params.cabin = state.cabin;
            }
        };

        // function getErrorMessage(errCode) {
        //     switch (errCode) {
        //         case '3.4872.12' : return "Invalid departure date";
        //         case '3.4872.15' : return "No itineraries available";
        //         default: return errCode;
        //     }
        // }

        this.getUrlSafeParams = function() {
            return {
                way: this.params.way,
                dep_ppnid: this.params.departure_ppnid,
                dep_type: this.params.departure_type,
                dep_display: this.params.departure_display,
                arr_ppnid: this.params.arrival_ppnid,
                arr_type: this.params.arrival_type,
                arr_display: this.params.arrival_display,
                dep_date: utilities.getUrlSafeDate(this.params.departureDate),
                return_date: utilities.getUrlSafeDate(this.params.returnDate),
                adults: this.params.adults,
                children: this.params.children,
                cabin: this.params.cabin
            };
        };

        //-- validators --//
        this.validateWay = function(way, return_date) {
            if (way) this.params.way = way; //1. go with explicit way
            if (!way) {
                if (return_date) {
                    this.params.way = 'RoundTrip';          //2. infer if we have a return date
                } else {
                    this.params.way = 'OneWay';            //2. default
                }
            }

            /*
            if (way !== 'OneWay' && way !== 'RoundTrip' && way !== 'Multi') {
                this.errs.push('Please select either Roundtrip or One-way.');
            } else {
                this.params.way = way;
            }
            */
        };
    };

    flightSearchService.$inject = ['dataFactory','$state','utilities','$stateParams'];
    mod.service('flightSearchService', flightSearchService);
};
