module.exports = function(app) {
    var reserveFlightController = function ($rootScope, $scope, $state, $stateParams, dataFactory, $uibModal, $uibModalStack, utilities, $sce, loginModalService, joinModalService, $document, localStorageService, $interval, guid, userPersistenceService, flightUtilities) {

        var vm = this;
        require('./reserveFlight.less');

        vm.contractLookupErrs = [];
        vm.isWaitingContract = true;
        vm.contract = {};
        vm.getContractPolicy = getContractPolicy;
        vm.getTermsAndConditionsPolicy = getTermsAndConditionsPolicy;
        vm.getPrivacyPolicy = getPrivacyPolicy;
        vm.bookRequestParams = {
            passengers: [],
            purchaser: {},
            payment: {}
        };
        //vm.bookRequestParams.passengers = [];
        vm.continueState = 'INITIAL';
        vm.currentYear = new Date().getFullYear();


        //page visibility
        vm.showFlightDetails = true;
        vm.showReservationForm = false;

        //policies (category='contract_popup')
        vm.policy_baggage_fees = {};
        vm.policy_travel_insurance = {};
        vm.policy_taxes_and_fees = {};
        vm.policy_meal_seat = {};
        vm.policy_fare_rules = {};
        vm.policy_check_in = {};
        vm.policy_passenger_names = {};
        vm.policy_under_15 = {};
        vm.policy_disinsection = {};
        vm.policy_valid_passport = {};

        //policies (category='terms_and_conditions')
        vm.policy_termsAndConditions = {};
        vm.privacy_policy = {};

        vm.airlineBaggageInfo = {};

        //validations
        vm.showValidations = false; //indicates whether we state allows validations to be shown to user
        vm.inputIsValid = false;    //flag indicating validity of form fields
        vm.needsWork = [];
        vm.bookingErrs = [];
        vm.detectValidationChanges = detectValidationChanges;
        vm.isValid = isValid;

        vm.init = init;
        vm.getContract = getContract;
        vm.continueBooking = continueBooking;
        vm.book = book;
        vm.validate = validate;

        //scope for ui calls
        vm.localStorageService = localStorageService;
        vm.utilities = utilities;

        vm.init();

        function init() {

            //setup meta tags
            var desc = 'Accessible flights';
            $rootScope.metaTagService.setup({
                ogDescription: desc,
                twitterDescription: desc,
            });

            //retrieve priceline contract
            vm.getContract();

            //get policies
            vm.getContractPolicy();
            vm.getTermsAndConditionsPolicy();
            vm.getPrivacyPolicy();

            //prepopulate form
            var u = localStorageService.getUserProfile();
            if (u) {
                vm.bookRequestParams.purchaser.name_first = u.given_name || '';
                vm.bookRequestParams.purchaser.name_last = u.family_name || '';
                vm.bookRequestParams.payment.email = u.email || '';
            }

            //TODO: default email address when logged in
            // var defaultEmailWhenLoggedIn = $scope.$watch('vm.localStorageService.getAuthenticationState()', function(newvalue) {
            //     if (newvalue) {
            //         if (!vm.bookRequestParams.payment) {
            //             vm.bookRequestParams.payment = {};
            //         }
            //         vm.bookRequestParams.payment.email=vm.localStorageService.getUserProfile().email;
            //     }
            // }, true);
            // //clear the watch
            // $scope.$on('$destroy', function () {
            //    defaultEmailWhenLoggedIn();
            // });
            vm.detectValidationChanges();
        }

        function getContract() {
            vm.isWaitingContract = true;

            //do we have required reserve params
            if (!$stateParams.ppn_bundle || $stateParams.ppn_bundle === '') {
                vm.contractLookupErrs.push({ message: "Flight bundle information not found." });
                vm.isWaitingContract = false;
                return;
            }
            if (!$stateParams.sid || $stateParams.sid === '') {
                vm.contractLookupErrs.push({ message: "Session id not found." });
                vm.isWaitingContract = false;
                return;
            }

            var successFunc = function (response) {
                vm.isWaitingContract = false;

                //errors
                if (!response || !response.data) {
                    vm.contractLookupErrs.push({ message: "No response from server." });
                    return;
                }
                if (response.data.errors && response.data.errors.length > 0) {
                    vm.contractLookupErrs = response.data.errors;
                    return;
                }
                if (!response.data.data || !response.data.data.results) {
                    vm.contractLookupErrs.push({ message: "Unable to retrieve contract results" });
                    return;
                }

                vm.contract = response.data.data.results.result;
                console.log(vm.contract);

                // if (vm.contract.cdw && vm.contract.cdw.text_block) {
                //     vm.cdw = JSON.parse(vm.contract.cdw.text_block);
                //     console.log(vm.cdw);
                // }

                vm.isWaitingContract = false;

                //set airline baggage info
                var cb = function(response) {
                    vm.airlineBaggageInfo = response.data.solution;
                };
                dataFactory.getFlightBaggageInfo(vm.contract.itinerary_data.baggage_carrier.airline).then(cb);
            };

            var errFunc = function (response) {
                vm.isWaitingContract = false;
            };

            var params = {
                ppn_bundle: $stateParams.ppn_bundle,
                sid: $stateParams.sid
            };
            dataFactory.getFlightContract(params).then(successFunc, errFunc);
        }

        function getContractPolicy() {
            var successFunc = function(response) {
                var blockData = response.data['getSharedPolicy.Air'].results.result.air_data.policy_data.policy_0.block_data;
                vm.policy_baggage_fees = blockData.baggage_fees;
                vm.policy_travel_insurance = blockData.travel_insurance;
                vm.policy_taxes_and_fees = blockData.taxes_and_fees;
                vm.policy_meal_seat = blockData.meal_seat;
                vm.policy_fare_rules = blockData.fare_rules;
                vm.policy_check_in = blockData.check_in;
                vm.policy_passenger_names = blockData._passenger_names;
                vm.policy_under_15 = blockData.under_15;
                vm.policy_disinsection = blockData.disinsection;
                vm.policy_valid_passport = blockData.valid_passport;
            };
            var errFunc = function(response) {};
            dataFactory.getFlightPolicy('contract_popup').then(successFunc,errFunc);
        }

        function getTermsAndConditionsPolicy() {
            var successFunc = function(response) {
                vm.policy_termsAndConditions = response.data['getSharedPolicy.Air'].results.result.air_data.policy_data.policy_0.block_data;
            };
            var errFunc = function(response) {};
            dataFactory.getFlightPolicy('terms_and_conditions').then(successFunc,errFunc);
        }

        function getPrivacyPolicy() {
            var successFunc = function(response) {
                vm.privacy_policy = response.data['getSharedPolicy.Air'].results.result.air_data.policy_data.policy_0.block_data;
            };
            var errFunc = function(response) {};
            dataFactory.getFlightPolicy('privacy_policy').then(successFunc,errFunc);
        }

        function continueBooking() {

            //define what we want to achieve
            var continueFunc = function() {
                vm.showFlightDetails = false;
                vm.showReservationForm = true;
                $document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;
                vm.continueState = 'BOOK';
            };

            //authenticate
            if (!localStorageService.getAuthenticationState()) {

                //define what to do once authenticated
                var successCB = function() {
                    continueFunc();
                };

                //show login modal
                var params = {
                    onSuccessFunc: successCB
                };
                loginModalService(params);

                return;
            }

            continueFunc();
        }

        //define what to do if request is successfully processed
        vm.successBookFunc = function (response) {

            //-- handle UNSUCCESSFUL case --//
            if (response.data.status !== "success") {

                //assign errors
                for (var i = 0; i < response.data.errors.length; i++) {

                    var errMsg = '';
                    var err = response.data.errors[i];

                    console.log(err);

                    //error we detected
                    // if (!err) {
                    //     vm.bookingErrs.push(err);
                    //     continue;
                    // }

                    if (err && err.message) {   
                        vm.bookingErrs.push(err.message);
                        continue;
                    }

                    if (err && err.status) {    //PPN error
                        vm.bookingErrs.push(err.status);
                        continue;
                    }

                    //backup
                    vm.bookingErrs.push('An unidentifiable error has occurred.  We apologize for the inconvenience.  Please check the information you are submitting for errors.');
                }

                //show errors & close button
                var modalScope = $uibModalStack.getTop().value.modalScope;
                modalScope.vm.showHeader = true;
                modalScope.vm.title = "Unable to book";

                var text = "Hmm... we're unable to book your flight.";

                if (vm.bookingErrs) {
                    text = text + "<ul>";
                    for (var ie = vm.bookingErrs.length - 1; ie >= 0; ie--) {
                        text = text + "<li>" + vm.bookingErrs[ie] + "</li>";
                    }
                    text = text + "</ul>";
                }
                modalScope.vm.text = text;

                modalScope.vm.showFooter = true;

                return;
            }

            //-- HANDLE SUCCESS CASE --//
            $uibModalStack.dismissAll();

            //grab ppn data
            var ppnResultObj = response.data.data.results;
            var bookingId = ppnResultObj.result.trip_number;
            var bookingStatus = ppnResultObj.status;
            var bookingEmail = ppnResultObj.email;

            console.log(response);
            console.log('flight booking complete!');

            //clear tracking id :: tracking id should live only for lifetime of user's attempt to book (on this reserve page).
            userPersistenceService.clearPPNTrackingId('flight');

            //show confirmation page & send email
            $state.go('booking_flight', {
                bid: bookingId,
                e: bookingEmail,
                c: 'CONFIRM',    //sends confirmation email
            });
        };

        //define what to do if request is NOT successfully processed
        vm.errBookFunc = function (response) {
            console.log(response);
            vm.bookingErrs.push('Hmm... looks like a problem occurred while booking... Please try again.  We apologize for the inconvenience.');
            $uibModalStack.dismissAll();
            return;
        };

        vm.getFlightTrackingId = function() {
            var ppntrackingid = userPersistenceService.getPPNTrackingId('flight');
            if (ppntrackingid === undefined) {
                ppntrackingid = guid.get();
                userPersistenceService.setPPNTrackingId('flight', ppntrackingid);
            }
            return ppntrackingid;
        };

        function book() {

            //define what we want to achieve
            var bookFunc = function() {

                //validate input
                vm.showValidations = true;
                vm.validate();
                if (!vm.inputIsValid) {
                    return;
                }

                //start with 0 booking errors
                vm.bookingErrs = [];


                //-- non user-specified parameters
                vm.bookRequestParams.customer_id = localStorageService.getCustomerId();
                vm.bookRequestParams.ppn_bundle = vm.contract.itinerary_data.ppn_book_bundle;
                vm.bookRequestParams.tracking_id = vm.getFlightTrackingId();
                vm.bookRequestParams.slices = JSON.stringify(vm.contract.itinerary_data.slice_data);

                // open a progress modal
                vm.openBookingInProgressModal();

                //ensure user sees that booking in progress
                setTimeout(function () {
                    console.log(vm.bookRequestParams);
                    dataFactory.bookFlight(vm.bookRequestParams).then(vm.successBookFunc, vm.errBookFunc);
                }, 2000);
            };

            //is authenticated?
            if (!localStorageService.getAuthenticationState()) {

                //define what to do once authenticated
                var successCB = function() {
                    bookFunc();
                };

                //show login modal
                loginModalService();

                return;
            }

            bookFunc();
        }

        vm.openBookingInProgressModal = openBookingInProgressModal;
        function openBookingInProgressModal() {
            var instance = $uibModal.open({
                template: require("../../modal/modal.html"),
                controller: 'modalController',
                controllerAs: 'vm',
                bindToController: true,
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                backdrop: 'static',
                keyboard: true,
                size: 'lg',
                resolve: {
                    items: function () {
                        return {
                            title: 'Booking in Progress...',
                            text: require("./inProgressModalText.html"),
                            closeOnTop: 'n',
                            showHeader: false,
                            showFooter: false
                        };
                    }
                }
            });
            return instance.result.then();
        }

        function validate() {
            vm.inputIsValid = vm.isValid();
        }
        
        function isValid() {

            //valiate purchaser information
            var purchaser = vm.bookRequestParams.purchaser;
            if (!purchaser) return false;
            if (!purchaser.name_first) return false;
            if (!purchaser.name_last) return false;

            //validate passenger information
            $.each(vm.bookRequestParams.passengers,function(idx) {
                var passenger = vm.bookRequestParams.passengers[idx];
                if (!passenger) return false;
                if (!passenger.name_first) return false;
                if (passenger.name_last==='') return false;
                if (!passenger.dob) return false;
                if (passenger.dob.month==='') return false;
                if (passenger.dob.day==='') return false;
                if (passenger.dob.year==='') return false;
                //if (passenger.dob.year >= new Date().getFullYear()-15) return false;
                if (passenger.gender==='') return false;
            });

            //validate payment information
            var payment = vm.bookRequestParams.payment;
            if (!payment) return false;
            if (!payment.name) return false;
            if (!payment.address) return false;
            if (!payment.country) return false;
            if (!payment.country.code) return false;
            if (payment.country.region_data) {
                if (!payment.state) return false;
                if (!payment.state.code) return false;
            }
            if (!payment.city) return false;
            if (!payment.zip) return false;
            if (!payment.email) return false;
            if (!utilities.isValidEmail(payment.email)) return false;
            if (!utilities.isValidPhone(payment.phone)) return false;
            if (!payment.number) return false;
            if (!payment.type) return false;
            if (!payment.expiration) return false;
            if (!payment.expiration.month) return false;
            if (!payment.expiration.year) return false;
            if (!utilities.isValidCVV(payment.cvv)) return false;

            return true;
        }

        //detect validation changes for proactive messaging
        function detectValidationChanges() {
            var intervalFunc = function() {
                //if user hasn't clicked the "book" button, then we are not ready to show validation messagnig
                if (!vm.showValidations) return;

                //validate
                vm.validate();
            };
            $interval(intervalFunc, 1000, 0, true);
        }

        
        //-- AUTHORIZATION --//
        // vm.login = login;
        // function login() {
        //     loginModalService();
        // }
        // vm.join = join;
        // function join() {
        //     joinModalService();
        // }

        //-- UI HELPERS --//
        vm.formatDuration = formatDuration;
        function formatDuration(duration) {
            if (!duration) return '';
            var sp = duration.split(':');
            var hours = sp[1];
            if (hours.startsWith('0')) hours=hours.substring(1);
            var minutes = sp[2];
            return hours + 'h ' + minutes + 'm';
        }

        vm.countryChanged = countryChanged;
        function countryChanged() {
            //clear out state object
            delete vm.bookRequestParams.payment.state;
        }

        vm.getDate = getDate;
        function getDate(dateString) {
            return dateFns.format(dateString, 'M-DD-YYYY');
        }

        //-- MODALS --//
        vm.openModal = openModal;
        function openModal(template, controller, content) {
            var instance = $uibModal.open({
                template: template,
                controller: controller,
                controllerAs: 'vm',
                bindToController: true,
                animation: false,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                backdrop: 'static',
                keyboard: true,
                size: 'lg',
                resolve: {
                    items: function () {
                        return content;
                    }
                }
            });
            if (content.callbackFunc) return instance.result.then(content.callbackFunc);
            return instance.result.then(vm.notyetsure);
        }

        vm.openBaggageFeesModal = openBaggageFeesModal;
        function openBaggageFeesModal() {
            vm.setupModal(vm.policy_baggage_fees);
        }

        vm.openWhatIsSuffixModal = openWhatIsSuffixModal;
        function openWhatIsSuffixModal(){

            var text = '';
            text+='<p>A suffix follows a person\'s full name and provides additional information about the person.</p>';
            text+='<p>For example: John Smith <strong>Junior</strong>.</p>';
            text+='<p>Please only include a suffix as it appears on the passenger\'s passport or government issued ID they plan to travel with.</p>';

            var template = require("../../modal/modal.html");
            vm.openModal(template, 'modalController', {
                title: 'Suffix',
                text: text,
                closeOnTop: 'y'
            });
        }

        vm.openWhyAskGenderModal = openWhyAskGenderModal;
        function openWhyAskGenderModal() {

            var text = '';
            text+='<p>Secure Flight is a program developed and mandated by the Department of Homeland Security in response to a key 9/11 Commission recommendation: uniform watch list matching by the Transportation Security Administration. The mission of the Secure Flight program is to enhance the security of domestic and international commercial air travel by requiring airlines to provide the TSA with a passenger\'s <strong>name</strong> as it appears on the government issued ID they plan to travel with, <strong>date of birth</strong>, and <strong>gender</strong>. Because airlines are now required to transmit Secure Flight Passenger Data (SFPD) to the TSA at time of booking, providing this information is required in order to complete your purchase. It is expected that collecting SFPD will improve the travel experience for all airline passengers, including those who have been misidentified in the past.</p>';
            text+='<p>Please note that airlines do not provide travel agencies with authorization to process name changes and/or corrections to tickets. As long as your ID matches your airline ticket, you should not encounter any difficulties boarding your plane. For more information on <strong>Secure Flight</strong>, please visit the <a href=\'http://www.tsa.gov\' target=\'_blank\'>TSA Website</a>."</p>';

            var template = require("../../modal/modal.html");
            vm.openModal(template, 'modalController', {
                title: 'Secure Flight Information',
                text: text,
                closeOnTop: 'y'
            });
        }

        vm.openFareRulesModal = openFareRulesModal;
        function openFareRulesModal() {
            vm.setupModal(vm.policy_fare_rules);
        }

        vm.openTravelWithInfantModal = openTravelWithInfantModal;
        function openTravelWithInfantModal() {
            vm.setupModal(vm.policy_under_15);
        }

        vm.openValidPassportModal = openValidPassportModal;
        function openValidPassportModal() {
            vm.setupModal(vm.policy_valid_passport);
        }

        vm.openAirlineBaggageFeesModal = openAirlineBaggageFeesModal;
        function openAirlineBaggageFeesModal() {
            var template = require("../../modal/modal.html");
            vm.openModal(template, 'modalController', {
                title: vm.airlineBaggageInfo.title,
                text: vm.airlineBaggageInfo.description,
                closeOnTop: 'y'
            });
        }

        vm.openTaxesAndFeesModal = openTaxesAndFeesModal;
        function openTaxesAndFeesModal() {
            flightUtilities.setupModal(vm.policy_taxes_and_fees);

            //vm.setupModal(vm.policy_taxes_and_fees);
            // var successFunc = function(response) {

            //     var text = '';
            //     var paragraphs = response.data['getSharedFAQ.Air'].results.result.categories.making_a_reservation.items.taxes_and_fees.answer.paragraph_data;
            //     $.each(paragraphs, function(idx,val) {
            //         text += '<p>'+vm.substitutions(val)+'</p>';
            //     });

            //     var template = require("../../modal/modal.html");
            //     vm.openModal(template, 'modalController', {
            //         title: 'Taxes and Fees',
            //         text: text,
            //         closeOnTop: 'y'
            //     });
            // }
            // var errFunc = function(response) {

            // }
            // dataFactory.getFlightFAQ().then(successFunc,errFunc);
        }

        vm.openTermsAndConditionsModal = openTermsAndConditionsModal;
        function openTermsAndConditionsModal() {
            var text = '';

            // //intro
            // text+='<h4>'+vm.policy_termsAndConditions.introduction.title+'<h4>';
            // $.each(vm.policy_termsAndConditions.introduction.paragraph_data, function(idx,val) {
            //     text += '<h5>'+val+'</h5>';
            // });

            // //table of contents
            // text+='<h4>'+vm.policy_termsAndConditions.table_of_contents.title+'</h4>';
            // $.each(vm.policy_termsAndConditions.table_of_contents.paragraph_data, function(idx,val) {
            //     text += '<h5>'+val+'</h5>';
            // });

            var appendParts = function(heading) {
                text+='<br/><h4>'+vm.policy_termsAndConditions[heading].title+'</h4>';
                $.each(vm.policy_termsAndConditions[heading].paragraph_data, function(idx,val) {
                    text += '<h5>'+val+'</h5>';
                });    
            };

            appendParts('introduction');
            appendParts('table_of_contents');
            appendParts('part1');
            appendParts('part2');
            appendParts('part3');
            appendParts('part4');
            appendParts('part4a');
            appendParts('part4b');
            appendParts('part4c');
            appendParts('part4d');
            appendParts('part4e');
            appendParts('part4f');
            appendParts('part5');

            var template = require("../../modal/modal.html");
            vm.openModal(template, 'modalController', {
                title: 'Terms and Conditions',
                text: text,
                closeOnTop: 'y'
            });
        }

        vm.openPrivacyPolicyModal = openPrivacyPolicyModal;
        function openPrivacyPolicyModal() {
            var text = '';

            var appendParts = function(heading) {
                text+='<h4>'+vm.privacy_policy[heading].title+'</h4>';
                $.each(vm.privacy_policy[heading].paragraph_data, function(idx,val) {
                    text += '<h5>'+val+'</h5>';
                });    
            };

            appendParts('introduction');
            appendParts('summary_of_policy');
            appendParts('collection');
            appendParts('protection');
            appendParts('use');
            appendParts('marketing');
            appendParts('sharing');
            appendParts('cookies');
            appendParts('how_to_access');
            appendParts('data_transfer');
            appendParts('children');
            appendParts('changes');
            appendParts('contact_us');

            //intro
            // text+=vm.privacy_policy.introduction.title;
            // $.each(vm.privacy_policy.introduction.paragraph_data, function(idx,val) {
            //     text += '<p>'+val+'</p>';
            // });

            // //summary
            // text+=vm.privacy_policy.summary_of_policy.title;
            // $.each(vm.privacy_policy.summary_of_policy.paragraph_data, function(idx,val) {
            //     text += val;
            // });
            

            var template = require("../../modal/modal.html");
            vm.openModal(template, 'modalController', {
                title: 'Privacy Policy',
                text: text,
                closeOnTop: 'y'
            });
        }

        vm.openCVVModal = openCVVModal;
        function openCVVModal() {
            var template = require("../../modal/modal.html");
            vm.openModal(template,'modalController',{
                title: 'Credit Card Security',
                text: require("../../policies/cvv/cvv.html")
            });
        }


        //helper function for opening modal with policy data
        vm.setupModal = setupModal;
        function setupModal(obj) {

            //extract policy title
            var title = obj.title;

            //extract policy text
            var text = '';
            $.each(obj.paragraph_data, function(idx,val) {
                text += '<p>'+val+'</p>';
            });

            //display in modal
            var template = require("../../modal/modal.html");
            vm.openModal(template, 'modalController', {
                title: title,
                text: text,
                closeOnTop: 'y'
            });
        }

        //do we still need this????
        vm.substitutions = substitutions;
        function substitutions(text) {
            var page = 'reserve';

            var r = text;
            r = utilities.replaceAll(r,'[[strong]]','<strong>');
            r = utilities.replaceAll(r,'[[/strong]]','</strong>');
            r = utilities.replaceAll(r,'[[breakline]]','<br /><br />');
            r = utilities.replaceAll(r,'[[underline]]','<u>');
            r = utilities.replaceAll(r,'[[/underline]]','</u>');
            r = utilities.replaceAll(r,'[[link','<a');
            r = utilities.replaceAll(r,'target=\'_blank\']]','target=\'_blank\'>');
            r = utilities.replaceAll(r,'[[/link]]','</a>');

            //fare rules
            r = utilities.replaceAll(r,'#fare_rules_START#','<a href="javascript:angular.element(document.getElementById(\'oReserveFlightController\')).scope().'+page+'.openFareRulesModal()" class="teal">');
            r = utilities.replaceAll(r,'#fare_rules_END#','</a>');

            //identification
            r = utilities.replaceAll(r,'#valid_passport_START#','<a href="javascript:angular.element(document.getElementById(\'oReserveFlightController\')).scope().'+page+'.openValidPassportModal()" class="teal">');
            r = utilities.replaceAll(r,'#valid_passport_END#','</a>');

            return $sce.trustAsHtml(r);
        }

    };

    reserveFlightController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'dataFactory', '$uibModal', '$uibModalStack', 'utilities', '$sce', 'loginModalService', 'joinModalService', '$document', 'localStorageService', '$interval', 'guid', 'userPersistenceService', 'flightUtilities'];
    app.controller('reserveFlightController', reserveFlightController);
};
