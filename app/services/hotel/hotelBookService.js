module.exports = function(mod){
    var hotelBookService = function(dataFactory,$state,utilities) {
        
        this.errs = [];
        this.params = {};
        this.helper = {};

        //client submitted options (other params are handled server-side)
        this.resetParams = function() {
            this.params = {
                type: 'hotel',
                isCUG: false,

                tracking_id: undefined,
                ppn_bundle: undefined,
                customer_id: undefined,
                name_first: undefined,
                name_last: undefined,
                email: undefined,
                phone_number: undefined,
                guest_name_first: undefined,
                guest_name_last: undefined,
                //guest_name_first[2]: undefined,
                //guest_name_last[2]: undefined,
                card_type: undefined,
                card_number: undefined,
                expires: undefined,
                cvc_code: undefined,
                card_holder: undefined,
                address_line_one: undefined,
                address_city: undefined,
                address_postal_code: undefined,
                address_state_code: undefined,
                country_code: undefined,
                agreed_to_terms: false,
                initials: undefined,

                Guests: 0,
                Rooms: 0,
                CheckinDate: undefined,
                CheckoutDate: undefined,

                //TODO: move to server side
                // newsletter: 0,
                // add_insurance: 0,
                // smoking: 1,
                Comments: '',
                HotelPPNId: undefined,
                specialRequests: [
                    { id: 'first_floor', caption: 'First floor room', checked: false },
                    { id: 'ada_tub', caption: 'Room featuring ADA tub', checked: false },
                    { id: 'rollin_shower', caption: 'Room featuring roll in shower', checked: false },
                    { id: 'hearing_accessible', caption: 'Hearing accessible room', checked: false },
                    { id: 'fridge', caption: 'Fridge for medication', checked: false }
                ],
                specialRequestText: ''
            };

            this.helper = {
                countryObj: { code: undefined, name: undefined },
                stateObj: { code: undefined, name: undefined },
                expiresObj: { month: undefined, year: undefined }
            };
        };



        this.validatePart1 = function() {
            this.errs = [];

            if (!this.params.name_first || this.params.name_first.trim()==='') {
                this.errs.push('Please enter your first name');
            }

            if (!this.params.name_last || this.params.name_last.trim()==='') {
                this.errs.push('Please enter your last name');
            }

            if (!this.params.address_line_one || this.params.address_line_one.trim()==='') {
                this.errs.push('Please enter your billing address');
            }

            if (!this.params.address_city || this.params.address_city.trim()==='') {
                this.errs.push('Please enter your billing city');
            }

            if (!this.helper.countryObj.code) {
                this.errs.push('Please enter your billing country');
            } else {
                this.params.country_code = this.helper.countryObj.code;
            }

            //non-cug has state_data, cug is region_data
            if (this.helper.countryObj.state_data || this.helper.countryObj.region_data) {
                if (!this.helper.stateObj.code) {
                    this.errs.push('Please enter your billing state');
                } else {
                    this.params.address_state_code = this.helper.stateObj.code;
                }
            }

            if (!this.params.email || this.params.email.trim()==='') {
                this.errs.push('Please enter your email');
            }

            if (!this.params.phone_number || this.params.phone_number.trim()==='') {
                this.errs.push('Please enter your phone number');
            }
        };

        this.validatePart2 = function() {
            this.errs = [];

            //-- validate: customer id
            if (!this.params.customer_id || this.params.customer_id.trim()==='') {
                this.errs.push('Please log in to continue.  Message 8472119');
                console.log('No customer id presented');
            }

            //-- validate: ppn bund;e
            if (!this.params.ppn_bundle || this.params.ppn_bundle.trim()==='') {
                this.errs.push('PPN Bundle not found');
            }

            //-- validate: card type
            if (!this.params.card_type || this.params.card_type.trim()==='') {
                this.errs.push('Please specify your credit card type');
            }
            //removing cc validation (list is populated by options)
            //TODO: cards accepted - vary by hotel (full set is "American Express", "Discover", "Master Card", "VISA", "JCB", Carte Bleue")
            // if (this.params.card_type) {
            //     if ($.inArray( this.params.card_type, [ "AX", "DS", "MC", "VI", "Visa", "MasterCard", "American Express", "JCB", "Carte Bleue" ]) ===-1) {
            //         this.errs.push(this.params.card_type+' is not an accepted credit card type for booking this hotel.');
            //     }
            // }

            //-- validate: card number
            if (!this.params.card_number || this.params.card_number.trim()==='') {
                this.errs.push('Please enter your credit card number');
            }
            if (this.params.card_number) {
                if (this.params.card_number.length!==16) {
                    this.errs.push('Please specify a valid card number');
                }
            }

            //-- validate: card expiration
            if (!this.helper.expiresObj.month) {
                this.errs.push('Please specify your credit card expiration month');
            }
            if (!this.helper.expiresObj.year) {
                this.errs.push('Please specify your credit card expiration year');
            }
            if (this.helper.expiresObj.month && this.helper.expiresObj.year) {
                this.params.expires = this.helper.expiresObj.month.concat(this.helper.expiresObj.year);
            }

            //-- validate: card holder name
            if (!this.params.card_holder || this.params.card_holder.trim()==='') {
                this.errs.push('Please specify the name on your credit card');
            }

            //-- validate: cvv code
            if (!this.params.cvc_code || this.params.cvc_code.trim()==='') {
                this.errs.push('Please enter the cvc code on the back of your credit card');
            }

            //-- validate: comments
            if (this.params.specialRequestText && this.params.specialRequestText.length>200) {
                this.errs.push('Please limit the special requests field to 200 characters');
            }

            //-- validate: initials
            if (!this.params.agreed_to_terms) {
//TODO: add modal in the error text to terms, privacy policies
                this.errs.push('Please check the box to indicate that you have read and accept our terms and conditions and privacy policy');
            } else {
                this.params.initials=this.params.name_first.trim().charAt(0)+this.params.name_last.trim().charAt(0);
            }
        };

        this.hasValidParams = function() {
            return this.errs.length===0;
        };

        this.resetStateObj = function() {
            this.helper.stateObj = { code: undefined, name: undefined };
        };

        this.setPPNBundle = function(ppnBundle) {
            this.params.ppn_bundle = ppnBundle;
        };

        this.setCUG = function(isCUG) {
            this.params.isCUG = isCUG;
        };

        this.setComments = function() {
            var comments = '';

            //specific requests
            if (this.params.specialRequests) {
                angular.forEach(this.params.specialRequests, function(request,idx) {
                    if (request.checked===true) {
                        comments += request.caption + '\n';
                    }
                });
            }

            //open-text
            if (this.params.specialRequestText) {
                var sr = this.params.specialRequestText.trim();
                if (sr !== '') {
                    comments += '\n'+sr;
                }
            }
            

            if (comments !== '') {
                comments = 'Special Requests:\n' + comments;
            }

            this.params.Comments = comments;
        };

        this.setSearchCriteria = function(numGuests,numRooms,checkInDate,checkOutDate) {
            this.params.Guests = numGuests;
            this.params.Rooms = numRooms;
            this.params.CheckinDate = checkInDate;
            this.params.CheckoutDate = checkOutDate;
        };

        // //validate that we have correct set of parameters to do a search for hotels
        // this.validateAndGo = function() {
        //     var self=this;

        //     var successFunc = function (response) {
        //         if (!response.data.IsValid) {
        //             self.errs = response.data.Errs;
        //             return;
        //         }
        //         $state.go('hotels', self.getUrlSafeParams(), {reload: true}); 
        //     };

        //     var errFunc = function (response) {
        //         //todo: determine if/how to notify user
        //         //todo: determine how to log so we know this is a problem!
        //         console.log('unable to validate');
        //         self.errs.push('error occurred while validating search hotel params');
        //         return;
        //     };

        //     dataFactory.validateSearchHotels(this.params).then(successFunc,errFunc);
        // };




        // this.setParamsFromState = function(state) {
        //     this.resetParams();
        //     if (!state.ppnid) this.errs.push('Please specify a destination');
        //     if (state.ppnid) this.params.ppnid = state.ppnid;

        //     if (!state.type) this.errs.push('Search type is missing');
        //     if (state.type) this.params.type = state.type;

        //     if (!state.display) this.errs.push('Display is missing');
        //     if (state.display) this.params.display = state.display;

        //     if (!state.checkin) this.errs.push('Please specify a check in date');
        //     if (state.checkin) this.params.checkin = new Date(state.checkin);

        //     if (!state.checkout) this.errs.push('Please specify a check out date');
        //     if (state.checkout) this.params.checkout = new Date(state.checkout);

        //     if (!state.rooms) this.errs.push('Please specify number of rooms');
        //     if (state.rooms) this.params.rooms = state.rooms;
        // };




        
        // //support for state change to hotels
        // this.getUrlSafeParams = function() {
        //     return {
        //         ppnid: this.params.ppnid,
        //         type: this.params.type,
        //         display: this.params.display,
        //         checkin: utilities.getUrlSafeDate(this.params.checkin),
        //         checkout: utilities.getUrlSafeDate(this.params.checkout),
        //         rooms: this.params.rooms
        //     };
        // };

        this.useTestData = function() {
            this.params.name_first = 'test';
            this.params.name_last ='test';
            this.params.email ='test@test.com';
            this.params.phone_number ='(917)-112.1211';
            this.params.guest_name_first ='test';
            this.params.guest_name_last ='test';
            this.params.card_type ='VI';
            this.params.card_number ='4111111111111111';
            this.params.cvc_code ='453';
            this.params.card_holder ='test johnson';
            this.params.address_line_one ='test';
            this.params.address_city ='test';
            this.params.address_postal_code ='test';
            this.params.address_state_code ='VA';
            this.params.agreed_to_terms=true;
            this.params.Comments='';
            this.params.initials ='TT';

            this.helper.countryObj = { code: 'US', name: "United States" };
            this.helper.stateObj = { code: 'AL', name: 'Alabama' };
            this.helper.expiresObj = { month: '02', year: '2018' };
        };
    };

    hotelBookService.$inject = ['dataFactory','$state','utilities'];
    mod.service('hotelBookService', hotelBookService);
};
