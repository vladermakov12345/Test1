module.exports = function(mod){
    var clubgoService = function($rootScope, localStorageService, dataFactory) {
        
        var vm = this;
        vm.errs = [];
        vm.status = {};
        vm.params = {};
        vm.steps = [];
        vm.currentStep = 0;

        //funcs
        vm.init = init;
        vm.resetStatus = resetStatus;
        vm.resetStep = resetStep;
        vm.getOwnershipPronoun = getOwnershipPronoun;
        vm.getNextStep = getNextStep;
        vm.getPrevStep = getPrevStep;
        vm.getCurrentStepName = getCurrentStepName;

        //persistence
        vm.submitPermit = submitPermit;
        vm.submitPlate = submitPlate;
        vm.submitOrgMembership = submitOrgMembership;
        vm.setPhotoPersistence = setPhotoPersistence;
        vm.getCommonSuccessFunc = getCommonSuccessFunc;

        vm.init();

        function init() {
            //setup steps
            vm.steps.push({ name: 'init' });
            vm.steps.push({ name: 'chooseOwnershipType' });
            vm.steps.push({ name: 'chooseVerificationType' });
            vm.steps.push({ name: 'verification' });
            vm.steps.push({ name: 'photo' });
            vm.steps.push({ name: 'complete' });

            //params :: permit/plate
            var permit = {
                number: undefined,
                country: undefined,
                stateProv: undefined,
                isValid: function() {
                    var hasNumber = this.number != undefined;
                    var hasCountry = this.country != undefined;
                    var hasStateProv = true;
                    if (hasCountry && this.country.state_data) {
                        (this.country.state_data.length>0)?this.stateProv != undefined: true;
                    }
                    return hasNumber && hasCountry && hasStateProv;
                },
                errors: [],
                clearErrors: function() { this.errors = [] }
            };

            var plate = {
                number: undefined,
                country: undefined,
                stateProv: undefined,
                isValid: function() {
                    var hasNumber = this.number != undefined;
                    var hasCountry = this.country != undefined;
                    var hasStateProv = true;
                    if (hasCountry && this.country.state_data) {
                        (this.country.state_data.length>0)?this.stateProv != undefined: true;
                    }
                    return hasNumber && hasCountry && hasStateProv;
                },
                errors: [],
                clearErrors: function() { this.errors = [] }
            };

            //params :: org
            var org = {
                selected: undefined,
                nameFirst: undefined,
                nameLast: undefined,
                isValid: function() {
                    return this.selected != undefined && this.nameFirst != undefined&& this.nameLast != undefined;
                },
                errors: [],
                clearErrors: function() { this.errors = [] }
            };

            var application = {
                ownerType: undefined,  //[owner|caregiver]
                verificationType: undefined, //[permit|plate|org|other]
                permit: permit,
                plate:plate,
                org: org,
                photo: undefined
            };

            //defne persisted
            var persisted = {
                dbRec: undefined,
                photo: undefined
            };

            vm.params = {
                application: application,
                persisted: persisted,
            };

            //setup application watch
            $rootScope.$watch(vm.params, function(newVal, oldVal) {
                console.info('application model change made: ' + vm.params);
            });

            //setup persistence watch
            $rootScope.$watch('userCUGDetails', function (newVal, oldVal) {
                vm.params.persisted.dbRec = localStorageService.getUserCUGDetails();
                vm.resetStatus();
            });

            //detect if user parking permit has been uploaded
            vm.setPhotoPersistence();
            
            //need this??
            // this.helper = {
            //     countryObj: { code: undefined, name: undefined, region_data: undefined },
            //     stateObj: { code: undefined, name: undefined },
            // };
        };

        function setPhotoPersistence() {
            dataFactory.IsUserPermitExist().then(function (result) {
                var x = result.data.data;
                //TODO: change from boolean result to actual photo!
                if (x) {
                    vm.params.persisted.photo = x;
                }
                vm.resetStep();
                vm.resetStatus();
            });
        }

        function resetStatus() {

            if (!vm.params.persisted.dbRec) {
                vm.status = {
                    text: 'Not yet Applied',
                    color: 'gray'
                };
                return;
            }

            switch (vm.params.persisted.dbRec.statusCode) {
                //pending review
                case 'p': {
                    var text = 'Received';
                    var meaning = 'Your application has been received.';

                    //solicit photo upload?
                    var permitType = vm.params.persisted.dbRec.permitType;
                    var isPermitOrPlate = (permitType==='permit' || permitType==='plate');
                    if (isPermitOrPlate && !vm.params.persisted.photo) {
                        text += ' (Pending Photo)'

//left off here - this issue may be affecting just the example from maybusiness2004@yahoo.com, or the others as well
//can we adjust so that the photo is a separate status???
                        meaning += ' Please upload a photo below in order to complete your application.  If you are unable to do so now, you can revisit this page and upload at any time with 14 days of applying for clubGO membership.';
                    } else {
                        text += ' (Under Review)',
                        meaning += 'Once your application is approved, we\'ll email you with tips for saving money with clubGO!'
                    }

                    vm.status = {
                        text: text,
                        meaning: meaning,
                        color: '#6cc557'
                    };
                    return;
                };
                //accepted
                case 'a': {
                    vm.status = {
                        text: 'Accepted!',
                        meaning: 'Your application has been approved.',
                        color: '#29807c'
                    };
                    return;
                };
                //denied
                case 'd': {
                    vm.status = {
                        text: 'Not Approved',
                        meaning: 'Your application has been denied.  If you believe this to be in error, please contact us.',
                        color: 'red'
                    };
                    return;
                };
                //inactivated
                case 'i': {
                    vm.status = {
                        text: 'Inactivated',
                        meaning: 'Your application has been inactivated.  If you believe this to be in error, please contact us.',
                        color: 'red'
                    };
                    return;
                };
            }

            console.error('Invalid persisted status code');
        }

        function resetStep() {
            //application started?
            if (!vm.params.persisted.dbRec) {
               vm.currentStep = 0;
               return;
            }

            //do we need a photo?
            if (vm.params.persisted.dbRec.parkingID && !vm.params.persisted.photo) {
                vm.currentStep = 4;
                return;
            }

            //application complete!
            vm.currentStep = 5
        }

        function getOwnershipPronoun() {
            return vm.params.application.ownerType==='owner'?'my':'the owner\'s';
        };

        function getPrevStep() {
            if (vm.currentStep > 0) {
                vm.currentStep -= 1;
            }
            return vm.getCurrentStepName();
        }

        function getNextStep() {
            if (vm.currentStep < vm.steps.length) {
                vm.currentStep += 1;
            }
            return vm.getCurrentStepName();
        }

        function getCurrentStepName() {
            return vm.steps[vm.currentStep].name;
        }

        function submitOrgMembership(sFunc, eFunc) {
            var successCB = function(response) {
                //vm.setPhotoPersistence();
                
                //next step (skip photo step)
                vm.currentStep += 1;
                vm.getNextStep();

                sFunc(response);
            };

            var params = {
                cugOrganizationId: vm.params.application.org.selected.cugOrganizationId,
                firstName: vm.params.application.org.nameFirst,
                lastName: vm.params.application.org.nameLast
            };

            var successCB = vm.getCommonSuccessFunc(sFunc);
            dataFactory.submitCugOrganizationId(params).then(successCB, eFunc);
        }

        function submitPermit(sFunc,eFunc) {
            var params = {
                permitType: 'permit',
                ownerType: vm.params.application.ownerType,
                parkingPermitId: vm.params.application.permit.number,
                country: vm.params.application.permit.country.name,
                stateProv: (vm.params.application.permit.stateProv?vm.params.application.permit.stateProv.name:undefined)
            };

            var successCB = vm.getCommonSuccessFunc(sFunc);
            dataFactory.submitCugParkingId(params).then(successCB, eFunc);
        }

        function submitPlate(sFunc,eFunc) {
            var params = {
                permitType: 'plate',
                ownerType: vm.params.application.ownerType,
                parkingPermitId: vm.params.application.plate.number,
                country: vm.params.application.plate.country.name,
                stateProv: (vm.params.application.plate.stateProv?vm.params.application.plate.stateProv.name:undefined)
            };

            var successCB = vm.getCommonSuccessFunc(sFunc);
            dataFactory.submitCugParkingId(params).then(successCB, eFunc);
        }

        function getCommonSuccessFunc(sFunc) {
            return function(response) {
                var isGood = sFunc(response);
                
                if (!isGood) return;

                vm.setPhotoPersistence();
                vm.getNextStep();
            };
        }





        // this.validate = function() {
        //     this.errs = [];

        //     //-- validate: customer id
        //     if (!this.params.customer_id || this.params.customer_id.trim()==='') {
        //         this.errs.push('No customer id found');
        //         console.log('No customer id found');
        //     }

        //     //-- validate: tracking_id
        //     if (!this.params.tracking_id || this.params.tracking_id.trim()==='') {
        //         this.errs.push('Trackling Id not found.');
        //     }

        //     //-- validate: car_book_bundle
        //     if (!this.params.car_book_bundle || this.params.car_book_bundle.trim()==='') {
        //         this.errs.push('Car book Bundle is not found.');
        //     }

        //     if (!this.params.driver_first_name || this.params.driver_first_name.trim()==='') {
        //         this.errs.push('Please enter the driver\'s first name');
        //     } else {
        //         //TODO: add UI for first name with option to reuse driver first name
        //         this.params.cust_first_name = this.params.driver_first_name;
        //     }

        //     if (!this.params.driver_last_name || this.params.driver_last_name.trim()==='') {
        //         this.errs.push('Please enter the driver\'s last name');
        //     } else {
        //         //TODO: add UI for last name with option to reuse driver last name
        //         this.params.cust_last_name = this.params.driver_last_name;
        //     }

        //     if (!this.params.cust_email || this.params.cust_email.trim()==='') {
        //         this.errs.push('Please enter your email address');
        //     }

        //     // required if cdw is selected
        //     if (this.params.cdw_selected==='1') {

        //         //cardholder first name
        //         if (!this.params.cardholder_first_name || this.params.cardholder_first_name.trim()==='') {
        //             this.errs.push('Please enter the cardholder\'s first name');
        //         }

        //         //cardholder last name
        //         if (!this.params.cardholder_last_name || this.params.cardholder_last_name.trim()==='') {
        //             this.errs.push('Please enter the cardholder\'s last name');
        //         }

        //         //cust_street
        //         if (!this.params.cust_street || this.params.cust_street.trim()==='') {
        //             this.errs.push('Please enter your street address');
        //         }

        //         //cust_country_code
        //         if (!this.helper.countryObj.code) {
        //             this.errs.push('Please enter your billing country');
        //         } else {
        //             this.params.cust_country_code = this.helper.countryObj.code;
        //         }

        //         //cust_state_code
        //         if (this.helper.countryObj.region_data) {
        //             if (!this.helper.stateObj.code) {
        //                 this.errs.push('Please enter your billing state');
        //             } else {
        //                 this.params.cust_state_code = this.helper.stateObj.code;
        //             }
        //         }

        //         //cust_city
        //         if (!this.params.cust_city || this.params.cust_city.trim()==='') {
        //             this.errs.push('Please enter your city');
        //         }

        //         //cust_post_code
        //         if (!this.params.cust_post_code || this.params.cust_post_code.trim()==='') {
        //             this.errs.push('Please enter your postal code');
        //         }

        //         //-- validate: card type
        //         if (!this.params.cc_type || this.params.cc_type.trim()==='') {
        //             this.errs.push('Please specify your credit card type');
        //         }

        //         //-- validate: card number
        //         if (!this.params.cc_number || this.params.cc_number.trim()==='') {
        //             this.errs.push('Please enter your credit card number');
        //         }
        //         if (this.params.cc_number) {
        //             if (this.params.cc_number.length!==16) {
        //                 this.errs.push('Please specify a valid card number');
        //             }
        //         }

        //         //-- validate: card expiration
        //         if (!this.params.cc_mo) {
        //             this.errs.push('Please specify your credit card expiration month');
        //         }
        //         if (!this.params.cc_yr) {
        //             this.errs.push('Please specify your credit card expiration year');
        //         }

        //         //-- validate: cvv code
        //         if (!this.params.cc_code || this.params.cc_code.trim()==='') {
        //             this.errs.push('Please enter the cvc code on the back of your credit card');
        //         }

        //     }

        //     //-- validate: initials
        //     if (!this.params.contract_initials || this.params.contract_initials.trim()==='') {
        //         this.errs.push('Please enter your initials to indicate you have read and accept our terms and conditions and privacy policy.');
        //     }
        // };

        // this.hasValidParams = function() {
        //     return this.errs.length===0;
        // };

        // this.resetStateObj = function() {
        //     this.helper.stateObj = { code: undefined, name: undefined, region_data: undefined };
        // };

        // this.setCarBookBundle = function(carBookBundle) {
        //     this.params.car_book_bundle = carBookBundle;
        // };
        
    };

    clubgoService.$inject = ['$rootScope', 'localStorageService', 'dataFactory'];
    mod.service('clubgoService', clubgoService);
};
