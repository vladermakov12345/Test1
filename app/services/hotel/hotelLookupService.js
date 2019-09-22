/*
    persist the parameters required for loading a particular hotel page
*/
module.exports = function(mod){
	var hotelLookupService = function(dataFactory,$state,utilities) {
        
        this.params = {
            hotelid: undefined,
            checkin: undefined,
            checkout: undefined,
            rooms: undefined,
            adults: undefined,
            children: undefined
        };

        this.setParams = function(state) {
            this.errs = [];
            
            if (!state.hid) this.errs.push('Hotel id is missing.');
            this.params.hotelid = state.hid;

            if (!state.checkin) this.errs.push('Check in date is missing.');
            this.params.checkin = new Date(state.checkin.split('-').join('/'));

            if (!state.checkout) this.errs.push('Check out date is missing');
            this.params.checkout = new Date(state.checkout.split('-').join('/'));

            if (!state.rooms) this.errs.push('Number of rooms is missing.');
            this.params.rooms = state.rooms;

            if (!state.adults) this.errs.push('Number of adults is missing.');
            this.params.adults = state.adults;

            if (!state.children) this.errs.push('Number of children is missing.');
            this.params.children = state.children;

            if (state.destination) {
                this.params.destination = state.destination;
            }
        };

        this.getUrlSafeParams = function() {
            return {
                hid: this.params.hotelid,
                checkin: utilities.getUrlSafeDate(this.params.checkin),
                checkout: utilities.getUrlSafeDate(this.params.checkout),
                rooms: this.params.rooms,
                adults: this.params.adults,
                children: this.params.children,
                destination: this.params.destination
            };
        };

        this.hasValidParams = function() {
            return this.errs.length===0;
        };

        this.errs = [];
	};

    hotelLookupService.$inject = ['dataFactory','$state','utilities'];
    mod.service('hotelLookupService', hotelLookupService);
};