/*
    persist the parameters required for searching hotels
*/

module.exports = function(mod){
    var hotelSearchService = function(dataFactory,$state,utilities) {
        this.errs = [];
        this.params = {};

        this.resetParams = function() {
            this.errs = [];
            this.params = {
                ppnid: undefined,
                type: undefined,
                display: undefined,
                checkin: undefined,
                checkout: undefined,
                rooms: undefined,
                adults: undefined,
                children: undefined,
                radius: undefined,
                geo: undefined,
                cityid: undefined
            };
        };

        this.getCheckinDate = function(paramsCheckinDate) {
            //use state param value for check in if valid and in future
            if (paramsCheckinDate) {
                var cInDate = dateFns.parse(paramsCheckinDate.split('-').join('/'));
                var compDate = dateFns.addDays(cInDate,1);  //hack b/c dateFns isPast returns true for today
                if (dateFns.isValid(cInDate) && !dateFns.isPast(compDate)) {
                    return cInDate;
                }
            }

            //otherwise use a default checkin date (today + 14 days)
            var defaultCheckinDate = new Date();
            defaultCheckinDate.setDate(defaultCheckinDate.getDate() + 14);
            console.info('Hotel check in date: invalid date from state so applying default: ' + defaultCheckinDate);
            return defaultCheckinDate;
        };

        this.getCheckoutDate = function(paramsCheckoutDate) {
            //use state param value for check out if valid, in future AND greater than params check in date
            if (paramsCheckoutDate) {
                var cOutDate = dateFns.parse(paramsCheckoutDate.split('-').join('/'));
                if (dateFns.isValid(cOutDate) && dateFns.isFuture(cOutDate) && dateFns.compareAsc(this.params.checkin, cOutDate) == -1) {
                    return cOutDate;
                }
            }

            //otherwuse use a default check out date (params start date + 5)
            var defaultCheckoutDate = dateFns.addDays(this.params.checkin,2);
            console.info('Hotel check out date: invalid date from state so applying default: ' + defaultCheckoutDate);
            return defaultCheckoutDate;
        };
    
        this.setParamsFromState = function(state) {
            this.resetParams();
            if (!state.type) this.errs.push('Search type is missing');
            if (state.type) this.params.type = state.type;

            if (state.type !== 'hospital') {
                if (!state.ppnid) this.errs.push('Please specify a destination');
                if (state.ppnid) this.params.ppnid = state.ppnid;
            }

            if (!state.display) this.errs.push('Display is missing');
            if (state.display) this.params.display = state.display;

            this.params.checkin = this.getCheckinDate(state.checkin);

            this.params.checkout = this.getCheckoutDate(state.checkout);

            if (!state.rooms) {
                this.params.rooms = 1;   //this.errs.push('Please specify number of rooms');
            } else {
                //todo: handle lower/upper bound
                this.params.rooms = state.rooms;
            }

            if (!state.adults) {
                this.params.adults = 2;
            } else {
                //todo: handle lower/upper bound
                this.params.adults = state.adults;
            }

            if (!state.children) {
                this.params.children = 0;
            } else {
                //todo: handle lower/upper bound
                this.params.children = state.children;
            }

            if (!state.radius) {
                this.params.radius = 10;
            } else {
                this.params.radius = state.radius;
            }

            //for hospitals
            if (state.latitude && state.longitude) {
                this.params.geo = {
                    latitude: state.latitude,
                    longitude: state.longitude
                }
            }

            //for poi - hack for cug
            if (state.cityid) {
                this.params.cityid = state.cityid;
            }

        };

        //this is called from non hotels pages (hotel, home, bookbox)
        this.setParams = function(destination, checkin, checkout, rooms, adults, children, radius) {
            this.resetParams();
            if (!destination) this.errs.push('Please specify a destination');
            if (destination) {

                //destination a hospital?
                if (destination.type === 'hospital') {
                    this.params.type = 'hospital';
                    this.params.geo = {
                        latitude: destination.latitude,
                        longitude: destination.longitude
                    };
                    this.params.display = destination.display;
                } else {
                    if (destination.ppnid) this.params.ppnid = destination.ppnid;
                    if (destination.type) this.params.type = destination.type;
                    if (destination.display) this.params.display = destination.display;
                }

                //poi?
                if (destination.type === 'poi') {
                    this.params.cityid = destination.cityid;
                }
            }
            
            if (!checkin || checkin == 'Invalid Date') {
                this.errs.push('Please specify a valid check in date.');
            } else {
                this.params.checkin = new Date(checkin);
            }

            if (!checkout || checkout == 'Invalid Date') {
                this.errs.push('Please specify a valid check out date.');
            } else {
                this.params.checkout = new Date(checkout);
            }

            if (!rooms) {
                this.errs.push('Please specify number of rooms.');
            } else {
                this.params.rooms = rooms;
            }

            //removed until Pricline gives us a clear understanding
            if (!adults) {
                //this.errs.push('Please specify number of adults.');
            } else {
                this.params.adults = adults;
            }

            if (children<0) {
                //this.errs.push('Please specify number of children.');
            } else {
                this.params.children = children;
            }

            if (radius) {
                this.params.radius = radius;
            }

            // if (geo && geo.longitude && geo.latitude) {
            //     this.params.longitude = geo.longitude;
            //     this.params.latitude = geo.latitude;
            // }
        };

        // this.validate = function() {
        //     this.errs = [];
        //     if (!this.params.ppnid) this.errs.push('Please specify a destination');
        //     if (!this.params.checkin) this.errs.push('Please specify a checkin date');
        //     if (!this.params.checkout) this.errs.push('Please specify a checkout date');
        //     if (!this.params.rooms) this.errs.push('Please specify a number of rooms');
        //     if (this.params.type !== 'city' &&
        //      this.params.type !== 'hotel' &&
        //      this.params.type !== 'airport' &&
        //      this.params.type !== 'poi'
        //      ) this.errs.push('Search type is invalid.  Please try again.');
        // };

        this.hasValidParams = function() {

            //this.validate();
            return this.errs.length===0;
        };

        // this.getErrorMessage = function() {
        //     var msg = "";
        //     this.errs.forEach(function(err, idx) { msg+=(idx>0?', ':'') + err; });
        //     return msg;
        // };

        this.setLastSearchCriteria = function(params) {
            var ret = {
                ppnid: this.params.ppnid,
                type: this.params.type,
                display: this.params.display,
                checkin: utilities.getUrlSafeDate(this.params.checkin),
                checkout: utilities.getUrlSafeDate(this.params.checkout),
                rooms: this.params.rooms,
                adults: this.params.adults,
                children: this.params.children,
                radius: this.params.radius,
                cityid: this.params.cityid
            };

            if (this.params.geo && this.params.geo.latitude && this.params.geo.longitude) {
                ret.latitude = this.params.geo.latitude;
                ret.longitude = this.params.geo.longitude;
            }

            this.lastSearchCriteria = ret;
        };

        //validate that we have correct set of parameters to do a search for hotels
        this.validateAndGo = function() {
            var self=this;

            var successFunc = function (response) {
                if (!response.data.IsValid) {
                    
                    self.errs = response.data.Errs;
                    //self.errs = [JSON.parse(response.data.Errs)];

                    return ;
                }
                
                $state.go('hotels', self.getUrlSafeParams(), {reload: true}); 
            };

            var errFunc = function (response) {
                //todo: determine how to log so we know this is a problem!
                self.errs.push('Error occurred while validating search hotel params: ');
                self.errs.push(response);
                return;
            };

            dataFactory.validateSearchHotels(this.params).then(successFunc,errFunc);
        };

        this.getUrlSafeParams = function() {
            var ret = {
                ppnid: this.params.ppnid,
                type: this.params.type,
                display: this.params.display,
                checkin: utilities.getUrlSafeDate(this.params.checkin),
                checkout: utilities.getUrlSafeDate(this.params.checkout),
                rooms: this.params.rooms,
                adults: this.params.adults,
                children: this.params.children,
                radius: this.params.radius,
                cityid: this.params.cityid
            };

            if (this.params.geo && this.params.geo.latitude && this.params.geo.longitude) {
                ret.latitude = this.params.geo.latitude;
                ret.longitude = this.params.geo.longitude;
            }

            return ret;
        };

        this.getDefaultCheckinDate = function() {
            var dat = new Date();
            dat.setDate(dat.getDate() + 14);
            return dat;
        };
        
        this.default = {
            checkin: this.getDefaultCheckinDate(),
            adults: 2,
            adultsMin: 1,
            adultsMax: 14,
            children:0,
            childrenMin: 0,
            childrenMax: 6,
            rooms:1,
            roomsMin: 1,
            roomsMax: 9
        };

    };

    hotelSearchService.$inject = ['dataFactory','$state','utilities'];
    mod.service('hotelSearchService', hotelSearchService);
};
