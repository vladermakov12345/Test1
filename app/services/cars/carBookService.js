module.exports = function(mod){
    var carBookService = function(dataFactory,$state,utilities) {
        
        this.errs = [];
        this.params = {};
        this.helper = {};

        //client submitted options (other params are handled server-side)
        this.resetParams = function() {

            this.params = {
                type: 'car',

                customer_id: undefined,
                tracking_id: undefined,
            	car_book_bundle: undefined,
                contract_initials: undefined,

                //driver information
                driver_first_name: undefined,   //required
                driver_last_name: undefined,    //required

                //customer information
                cust_email: undefined,     //required
                cust_phone: undefined,     //optional (required for sms reminder)
            	cust_first_name: undefined,
            	cust_last_name: undefined,

                //required if cdw is selected
                cdw_selected: false,
                cardholder_first_name: undefined,
                cardholder_last_name: undefined,
                cust_street: undefined,
                cust_city: undefined,
                cust_country_code: undefined,
                cust_state_code: undefined,
                cust_post_code: undefined,
                cc_type: undefined,
                cc_number: undefined,
                cc_mo: undefined,
                cc_yr: undefined,
                cc_code: undefined,
                cdw_initials: undefined,

                //sms
                sms_message_flag: false,
                sms_opt_in_out: false,

                //(optional) flight information
                airline_code: undefined,
                flight_number: undefined,

                //(optional) child seats and special requests
                car_equipment_CSI: false,
                car_equipment_CST: false,
                car_equipment_BST: false,
                car_equipment_NVS: false,
                car_equipment_SKI: false,
                car_equipment_HCL: false,
                car_equipment_HCR: false,

                //(optional) discount codes
                car_discount_PC: undefined,
                car_discount_RC: undefined,
                car_discount_CD: undefined,
                car_discount_PP: undefined,

                //reservation details
                car_pickup_ppnId: undefined,
                car_pickup_date: undefined,
                car_pickup_time: undefined,
                car_dropoff_ppnId: undefined,
                car_dropoff_date: undefined,
                car_dropoff_time: undefined,

                //unused
                //driver_age: undefined,
                //street2: undefined,
                // pi_booking_id: undefined,
                // pi_email: undefined,
                // pi_rulesReferenceID: undefined,
                // chg_booking_id: undefined,
                // fulfillment_method: undefined,	//ex email
                // payment_method: undefined, //ex CC
                // insured_type: undefined, //ex primary
                // aaa_member_id: undefined,
                // member_id: undefined,
                // itinerary_details: undefined,
                // requested_currency: undefined
            };

            var that = this;

            this.helper = {
                countryObj: { code: undefined, name: undefined, region_data: undefined },
                stateObj: { code: undefined, name: undefined },
                carEquipment: {
                    CSI: { flag: false, set: function() { that.params.car_equipment_CSI=this.flag; } },
                    CST: { flag: false, set: function() { that.params.car_equipment_CST=this.flag; } },
                    BST: { flag: false, set: function() { that.params.car_equipment_BST=this.flag; } },
                    NVS: { flag: false, set: function() { that.params.car_equipment_NVS=this.flag; } },
                    SKI: { flag: false, set: function() { that.params.car_equipment_SKI=this.flag; } },
                    HCL: { flag: false, set: function() { that.params.car_equipment_HCL=this.flag; } },
                    HCR: { flag: false, set: function() { that.params.car_equipment_HCR=this.flag; } }
                },
                carDiscount: {
                    PC: { value: undefined, set: function() { that.params.car_discount_PC=this.value; } },
                    RC: { value: undefined, set: function() { that.params.car_discount_RC=this.value; } },
                    CD: { value: undefined, set: function() { that.params.car_discount_CD=this.value; } },
                    PP: { value: undefined, set: function() { that.params.car_discount_PP=this.value; } }
                }
                //expiresObj: { month: undefined, year: undefined }
            };
        };

        this.validate = function() {
            this.errs = [];

            //-- validate: customer id
            if (!this.params.customer_id || this.params.customer_id.trim()==='') {
                this.errs.push('No customer id found');
                console.log('No customer id found');
            }

            //-- validate: tracking_id
            if (!this.params.tracking_id || this.params.tracking_id.trim()==='') {
                this.errs.push('Trackling Id not found.');
            }

            //-- validate: car_book_bundle
            if (!this.params.car_book_bundle || this.params.car_book_bundle.trim()==='') {
                this.errs.push('Car book Bundle is not found.');
            }

            if (!this.params.driver_first_name || this.params.driver_first_name.trim()==='') {
                this.errs.push('Please enter the driver\'s first name');
            } else {
                //TODO: add UI for first name with option to reuse driver first name
                this.params.cust_first_name = this.params.driver_first_name;
            }

            if (!this.params.driver_last_name || this.params.driver_last_name.trim()==='') {
                this.errs.push('Please enter the driver\'s last name');
            } else {
                //TODO: add UI for last name with option to reuse driver last name
                this.params.cust_last_name = this.params.driver_last_name;
            }

            if (!this.params.cust_email || this.params.cust_email.trim()==='') {
                this.errs.push('Please enter your email address');
            }

            // required if cdw is selected
            if (this.params.cdw_selected==='1') {

                //cardholder first name
                if (!this.params.cardholder_first_name || this.params.cardholder_first_name.trim()==='') {
                    this.errs.push('Please enter the cardholder\'s first name');
                }

                //cardholder last name
                if (!this.params.cardholder_last_name || this.params.cardholder_last_name.trim()==='') {
                    this.errs.push('Please enter the cardholder\'s last name');
                }

                //cust_street
                if (!this.params.cust_street || this.params.cust_street.trim()==='') {
                    this.errs.push('Please enter your street address');
                }

                //cust_country_code
                if (!this.helper.countryObj.code) {
                    this.errs.push('Please enter your billing country');
                } else {
                    this.params.cust_country_code = this.helper.countryObj.code;
                }

                //cust_state_code
                if (this.helper.countryObj.region_data) {
                    if (!this.helper.stateObj.code) {
                        this.errs.push('Please enter your billing state');
                    } else {
                        this.params.cust_state_code = this.helper.stateObj.code;
                    }
                }

                //cust_city
                if (!this.params.cust_city || this.params.cust_city.trim()==='') {
                    this.errs.push('Please enter your city');
                }

                //cust_post_code
                if (!this.params.cust_post_code || this.params.cust_post_code.trim()==='') {
                    this.errs.push('Please enter your postal code');
                }

                //-- validate: card type
                if (!this.params.cc_type || this.params.cc_type.trim()==='') {
                    this.errs.push('Please specify your credit card type');
                }

                //-- validate: card number
                if (!this.params.cc_number || this.params.cc_number.trim()==='') {
                    this.errs.push('Please enter your credit card number');
                }
                if (this.params.cc_number) {
                    if (this.params.cc_number.length!==16) {
                        this.errs.push('Please specify a valid card number');
                    }
                }

                //-- validate: card expiration
                if (!this.params.cc_mo) {
                    this.errs.push('Please specify your credit card expiration month');
                }
                if (!this.params.cc_yr) {
                    this.errs.push('Please specify your credit card expiration year');
                }

                //-- validate: cvv code
                if (!this.params.cc_code || this.params.cc_code.trim()==='') {
                    this.errs.push('Please enter the cvc code on the back of your credit card');
                }

            }

            //-- validate: initials
            if (!this.params.contract_initials) {
                this.errs.push('Please enter your initials to indicate you have read and accept our terms and conditions and privacy policy.');
            }
        };

        this.hasValidParams = function() {
            return this.errs.length===0;
        };

        this.resetStateObj = function() {
            this.helper.stateObj = { code: undefined, name: undefined, region_data: undefined };
        };

        this.setCarBookBundle = function(carBookBundle) {
            this.params.car_book_bundle = carBookBundle;
        };

        this.setReservationDetails = function(contract) {
            //-- PICKUP --//
            var pickupPPNId = contract.pickup_code?contract.pickup_code:contract.pickup_cityid;
            this.params.car_pickup_ppnId = pickupPPNId;
            this.params.car_pickup_date = contract.pickup_date;
            this.params.car_pickup_time = contract.pickup_time;

            //-- DROPOFF --//
            var dropoffPPNId = contract.dropoff_code?contract.dropoff_code:contract.dropoff_cityid;
            this.params.car_dropoff_ppnId = dropoffPPNId;
            this.params.car_dropoff_date = contract.dropoff_date;
            this.params.car_dropoff_time = contract.dropoff_time;
        };

        // this.useTestData = function() {
        //     this.params.name_first = 'test';
        //     this.params.name_last ='test';
        //     this.params.email ='test@test.com';
        //     this.params.phone_number ='(917)-112.1211';
        //     this.params.guest_name_first ='test';
        //     this.params.guest_name_last ='test';
        //     this.params.card_type ='VI';
        //     this.params.card_number ='4111111111111111';
        //     this.params.cvc_code ='453';
        //     this.params.card_holder ='test johnson';
        //     this.params.address_line_one ='test';
        //     this.params.address_city ='test';
        //     this.params.address_postal_code ='test';
        //     this.params.address_state_code ='VA';
        //     this.params.initials ='TT';

        //     this.helper.countryObj = { code: 'US', name: "United States" };
        //     this.helper.stateObj = { code: 'AL', name: 'Alabama' };
        //     this.helper.expiresObj = { month: '02', year: '2018' };
        // };
    };

    carBookService.$inject = ['dataFactory','$state','utilities'];
    mod.service('carBookService', carBookService);
};
