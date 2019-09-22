/*
    persist the parameters required for searching flights
*/

module.exports = function(mod){
    var carSearchService = function(dataFactory,$state,utilities) {
        
        this.errs = [];
        this.params = {};

        this.resetParams = function() {
            this.errs = [];
            this.params = {
                sid: 123,

                pickupLocation_code: undefined,
                pickupLocation_ppnid: undefined,
                pickupLocation_city: undefined,
                pickupLocation_state: undefined,
                pickupLocation_country: undefined,
                pickupLocation_type: undefined,
                pickupLocation_display: undefined,
                pickupDate: undefined,
                pickupTime: undefined,

                dropoffLocation_code: undefined,
                dropoffLocation_ppnid: undefined,
                dropoffLocation_city: undefined,
                dropoffLocation_state: undefined,
                dropoffLocation_country: undefined,
                dropoffLocation_type: undefined,
                dropoffLocation_display: undefined,
                dropoffDate: undefined,
                dropoffTime: undefined
            };
        };

        this.setParams = function(pickup_location,pickup_date,pickup_time,dropoff_location,dropoff_date,dropoff_time) {
            this.resetParams();

            //check pickup location
            if (!pickup_location) {
                this.errs.push('Please specify a pick up location.');
            } else {
                if (pickup_location.code) this.params.pickupLocation_code = pickup_location.code;
                if (pickup_location.ppnid) this.params.pickupLocation_ppnid = pickup_location.ppnid;
                if (pickup_location.city) this.params.pickupLocation_city = pickup_location.city;
                if (pickup_location.state) this.params.pickupLocation_state = pickup_location.state;
                if (pickup_location.country) this.params.pickupLocation_country = pickup_location.country;
                if (pickup_location.type) this.params.pickupLocation_type = pickup_location.type;
                if (pickup_location.display) this.params.pickupLocation_display = pickup_location.display;
            }

            //check pick up date
            if (!pickup_date || pickup_date == 'Invalid Date') {
                this.errs.push('Please specify a valid pick up date.');
            } else {
                this.params.pickupDate = new Date(pickup_date);
            }

            //check pick up time
            if (!pickup_time) {
                this.errs.push('Please specify a valid pick up time.');
            } else {
                this.params.pickupTime = this.getTimeObject(pickup_time);
            }

            //check dropoff location
            if (!dropoff_location) {
                this.errs.push('Please specify a dropoff location.');
            } else {
                if (dropoff_location.code) this.params.dropoffLocation_code = dropoff_location.code;
                if (dropoff_location.ppnid) this.params.dropoffLocation_ppnid = dropoff_location.ppnid;
                if (dropoff_location.city) this.params.dropoffLocation_city = dropoff_location.city;
                if (dropoff_location.state) this.params.dropoffLocation_state = dropoff_location.state;
                if (dropoff_location.country) this.params.dropoffLocation_country = dropoff_location.country;
                if (dropoff_location.type) this.params.dropoffLocation_type = dropoff_location.type;
                if (dropoff_location.display) this.params.dropoffLocation_display = dropoff_location.display;
            }

            //check pick up date
            if (!dropoff_date || dropoff_date == 'Invalid Date') {
                this.errs.push('Please specify a valid drop off date.');
            } else {
                this.params.dropoffDate = new Date(dropoff_date);
            }

            //check pick up time
            if (!dropoff_time) {
                this.errs.push('Please specify a valid drop off time.');
            } else {
                this.params.dropoffTime = this.getTimeObject(dropoff_time);
            }
        };

        this.hasValidParams = function() {
            return this.errs.length===0;
        };

        //validate that we have correct set of parameters to do a search for hotels
        this.validateAndGo = function() {
            var self=this;

            var successFunc = function (response) {
                if (!response.data.IsValid) {
                    self.errs = response.data.Errs;
                    return;
                }

                $state.go('cars', self.getUrlSafeParams(), {reload: true});
            };

            var errFunc = function (response) {
                //todo: determine how to log so we know this is a problem!
                self.errs.push('Error occurred while validating car search params: ' + response);
                return;
            };

            dataFactory.validateSearchCars(this.params).then(successFunc,errFunc);
        };

        this.getUrlSafeParams = function() {
            return {
                pickupLocation_code: this.params.pickupLocation_code,
                pickupLocation_ppnid: this.params.pickupLocation_ppnid,
                pickupLocation_city: this.params.pickupLocation_city,
                pickupLocation_state: this.params.pickupLocation_state,
                pickupLocation_country: this.params.pickupLocation_country,
                pickupLocation_type: this.params.pickupLocation_type,
                pickupLocation_display: this.params.pickupLocation_display,
                pickupDate: utilities.getUrlSafeDate(this.params.pickupDate),
                pickupTime: this.params.pickupTime,

                dropoffLocation_code: this.params.dropoffLocation_code,
                dropoffLocation_ppnid: this.params.dropoffLocation_ppnid,
                dropoffLocation_city: this.params.dropoffLocation_city,
                dropoffLocation_state: this.params.dropoffLocation_state,
                dropoffLocation_country: this.params.dropoffLocation_country,
                dropoffLocation_type: this.params.dropoffLocation_type,
                dropoffLocation_display: this.params.dropoffLocation_display,
                dropoffDate: utilities.getUrlSafeDate(this.params.dropoffDate),
                dropoffTime: this.params.dropoffTime
            };
        };

        this.setParamsFromState = function(state) {

            this.resetParams();

            //pickup
            if (!state.pickupLocation_ppnid) this.errs.push('Please specify a pickup location');
            if (state.pickupLocation_ppnid) this.params.pickupLocation_ppnid = state.pickupLocation_ppnid;

            if (!state.pickupLocation_type) this.errs.push('Pickup search type is missing');
            if (state.pickupLocation_type) this.params.pickupLocation_type = state.pickupLocation_type;

            if (!state.pickupLocation_display) this.errs.push('Pickup display is missing');
            if (state.pickupLocation_display) this.params.pickupLocation_display = state.pickupLocation_display;

            if (!state.pickupDate) {
                this.errs.push('Please specify a pickup date');
            } else {
                this.params.pickupDate = new Date(state.pickupDate.split('-').join('/'));
            }

            if (!state.pickupTime) {
                this.errs.push('Please specify a pickup time');
            } else if (state.pickupTime.match(/(\d+):(\d+) (\w+)/)[1]>12 || state.pickupTime.match(/(\d+):(\d+) (\w+)/)[1]<1) {
                state.pickupTime = undefined;
                this.errs.push('Please specify a valid pickup time');
            } else {
                this.params.pickupTime = state.pickupTime; //new Date(state.pickupTime.split('-').join('/'));
            }

            if (state.pickupLocation_code) this.params.pickupLocation_code = state.pickupLocation_code;
            if (state.pickupLocation_city) this.params.pickupLocation_city = state.pickupLocation_city;
            if (state.pickupLocation_state) this.params.pickupLocation_state = state.pickupLocation_state;
            if (state.pickupLocation_country) this.params.pickupLocation_country = state.pickupLocation_country;


            //dropoff
            if (!state.dropoffLocation_ppnid) this.errs.push('Please specify a dropoff location');
            if (state.dropoffLocation_ppnid) this.params.dropoffLocation_ppnid = state.dropoffLocation_ppnid;

            if (!state.dropoffLocation_type) this.errs.push('Dropoff search type is missing');
            if (state.dropoffLocation_type) this.params.dropoffLocation_type = state.dropoffLocation_type;

            if (!state.dropoffLocation_display) this.errs.push('Dropoff display is missing');
            if (state.dropoffLocation_display) this.params.dropoffLocation_display = state.dropoffLocation_display;

            if (!state.dropoffDate) {
                this.errs.push('Please specify a dropoff date');
            } else {
                this.params.dropoffDate = new Date(state.dropoffDate.split('-').join('/'));
            }
            
            if (!state.dropoffTime) {
                this.errs.push('Please specify a dropoff time');
            } else if (state.dropoffTime.match(/(\d+):(\d+) (\w+)/)[1]>12 || state.dropoffTime.match(/(\d+):(\d+) (\w+)/)[1]<1) {
                state.dropoffTime = undefined;
                this.errs.push('Please specify a valid dropoff time');
            } else {
                this.params.dropoffTime = state.dropoffTime;//new Date(state.dropoffTime.split('-').join('/'));
            }

            if (state.dropoffLocation_code) this.params.dropoffLocation_code = state.dropoffLocation_code;
            if (state.dropoffLocation_city) this.params.dropoffLocation_city = state.dropoffLocation_city;
            if (state.dropoffLocation_state) this.params.dropoffLocation_state = state.dropoffLocation_state;
            if (state.dropoffLocation_country) this.params.dropoffLocation_country = state.dropoffLocation_country;
        };

        this.getTimeObject = function (timeString) {
            var parts = timeString.match(/(\d+):(\d+) (\w+)/),
            hours = parseInt(parts[1], 10), // /am/i.test(parts[3]) ? parseInt(parts[1], 10) : parseInt(parts[1], 10) + 12,
            minutes = parseInt(parts[2], 10).toString();
            if (minutes === '0') { minutes = '00'; }
            return hours + ':' + minutes + ' ' + parts[3];
        };

        this.getPickUpLocation = function() {
            return {
                code: this.params.pickupLocation_code,
                ppnid: this.params.pickupLocation_ppnid,
                city: this.params.pickupLocation_city,
                state: this.params.pickupLocation_state,
                country: this.params.pickupLocation_country,
                type: this.params.pickupLocation_type,
                display: this.params.pickupLocation_display
            };
        };

        this.getDropOffLocation = function() {
            return {
                code: this.params.dropoffLocation_code,
                ppnid: this.params.dropoffLocation_ppnid,
                city: this.params.dropoffLocation_city,
                state: this.params.dropoffLocation_state,
                country: this.params.dropoffLocation_country,
                type: this.params.dropoffLocation_type,
                display: this.params.dropoffLocation_display
            };
        };

        this.getPickupTimeDisplay = function () {
            return dateFns.format(new Date(this.params.pickupDate), 'MMM DD') + ' @ ' + this.params.pickupTime;
        };

        this.getDropOffTimeDisplay = function () {
            return dateFns.format(new Date(this.params.dropoffDate), 'MMM DD') + ' @ ' + this.params.dropoffTime;
        };

        this.getPickUpDate = function() {
            var d = new Date();
            d.setDate(d.getDate() + 14);
            return this.params.pickupDate || d;
        };

        this.getDropOffDate = function() {
            var d = new Date();
            d.setDate(d.getDate() + 21);
            return this.params.dropoffDate || d;
        };

        this.getPickUpTime = function() {
            return this.params.pickupTime || '9:30 AM';
        };

        this.getDropOffTime = function() {
            return this.params.dropoffTime || '9:30 AM';
        };
    };

    carSearchService.$inject = ['dataFactory','$state','utilities'];
    mod.service('carSearchService', carSearchService);
};
