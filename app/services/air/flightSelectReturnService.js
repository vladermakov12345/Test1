module.exports = function(mod){
    var flightSelectReturnService = function(dataFactory,$state,utilities,$stateParams) {
        var vm = this;

        vm.errs = [];
        this.params = {};

        this.resetParams = function() {
            vm.errs = [];
            this.params = {
                sid: undefined,
                ppn_bundle: undefined
            };
        };

        this.setParamsFromState = function(state) {

            this.resetParams();

            if (!state.sid) {
                vm.errs.push('Session information is missing');
            } else {
                this.params.sid = state.sid;
            }

            if (!$stateParams.ppn_bundle) {
                vm.errs.push('Bundle information is missing');
            } else {
                this.params.ppn_bundle = state.ppn_bundle;
            }
        };

        this.isValid = function() {
            return vm.errs.length===0;
        };

        this.searchReturnFlights = function(successCB, errorCB) {

            var succcessFunc = function(response) {

                //specific errors to show?
                if (response.data.errors && response.data.errors.length > 0) {

                    //for simplicity, read only first error message
                    var e = response.data.errors[0];
                    //var errMsg = vm.getErrorMessage(e.code);
                    vm.errs.push(e.message.replace('Air.FlightReturnDepartures: ',''));
                }

                successCB(response);
            };
            var errFunc = function(response) {

                errorCB(response);
            };
            dataFactory.searchReturnFlights(this.params).then(succcessFunc, errFunc);
        };

    };

    flightSelectReturnService.$inject = ['dataFactory','$state','utilities','$stateParams'];
    mod.service('flightSelectReturnService', flightSelectReturnService);
};
