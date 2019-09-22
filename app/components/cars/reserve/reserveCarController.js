module.exports = function (app) {
    var reserveCarController = function ($rootScope, $scope, $stateParams, $state, $filter, $window, $uibModal, dataFactory, carBookService, carUtilities, $uibModalStack, userPersistenceService, utilities, carSearchService, $sce, guid, localStorageService, loginModalService, joinModalService, environmentService) {

        var vm = this;
        vm.env = environmentService();

        vm.carUtilities = carUtilities;
        vm.errs = [];
        vm.contract = {};
        vm.cdw = {};
        vm.countries = [];
        vm.init = init;
        vm.getContract = getContract;
        vm.getTaxesAndFees = getTaxesAndFees;
        vm.getTotalCharges = getTotalCharges;

        //NAVIGATION
        vm.goBackToSearchResults = goBackToSearchResults;
        vm.login = login;
        vm.join = join;

        //-- contract
        vm.isWaitingContract = true;
        vm.contractLookupErrs = [];
        vm.openCDWTerms = openCDWTerms;
        //vm.getCountryData = getCountryData;
        //vm.getCityData = getCityData;
        vm.stateOptions = [];

        //-- policy
        vm.setSubstitutes = setSubstitutes;

        //-- book
        vm.book = book;
        vm.isWaitingBooking = true;
        vm.bookRequestParams = {};
        vm.bookRequestHelper = {};
        vm.states_data = [];

        //-- authorization
        vm.initAuth0 = initAuth0;

        //-- page states
        vm.pageState = 'part1edit';

        require("./reserveCar.less");

        vm.init();

        function init() {

            //clearing tracking cookie here b/c
            //1. we want to chance for back/resubmission
            //2. we have to clear before user makes a new legitimate booking
            userPersistenceService.clearPPNTrackingId('car');

            //clear out previously entered customer & cc info
            carBookService.resetParams();
            vm.bookRequestParams = carBookService.params;
            vm.bookRequestHelper = carBookService.helper;   //used for country/state code/names

            //logged in? populate email field
            $rootScope.$watch('userProfile', function (newVal,oldVal) {
                if ($rootScope.userProfile) {
                    vm.bookRequestParams.email = $rootScope.userProfile.email;
                }
            });

            vm.getContract();

            //fetch data for cdw select lists
            //vm.getCountryData();
            //vm.getCityData();

            //vm.initAuth0();
        }

        function getContract() {

            //identify ppn bundle
            if (!$stateParams.car_reference_id || $stateParams.car_reference_id === '') {
                vm.contractLookupErrs.push({ message: "Car reference id not found." });
                return;
            }

            vm.isWaitingContract = true;

            var successFunc = function (response) {
                if (!response || !response.data) {
                    vm.contractLookupErrs.push({ message: "No response from server." });
                    return;
                }

                //errors
                if (response.data.errors && response.data.errors.length > 0) {
                    console.log(response.data.errors);
                    vm.contractLookupErrs.push({ message: "Unable to retrieve contract" });
                    return;
                }
                if (!response.data.data || !response.data.data.results) {
                    vm.contractLookupErrs.push({ message: "Unable to retrieve contract results" });
                    return;
                }

                vm.contract = response.data.data.results;
                console.log(vm.contract);

                if (vm.contract.cdw && vm.contract.cdw.text_block) {
                    vm.cdw = JSON.parse(vm.contract.cdw.text_block);
                    console.log(vm.cdw);
                }

                vm.isWaitingContract = false;
            };

            var errFunc = function (response) {
                vm.isWaitingContract = false;
            };

            var params = {
                car_reference_id: $stateParams.car_reference_id
            };
            dataFactory.getCarContract(params).then(successFunc, errFunc);
        }

        // function goToPart1() {
        //     vm.pageState = 'part1edit';
        // }
        // function goToPart2() {
        //     //validate
        //     vm.errs = [];
        //     carBookService.validatePart1();
        //     if (!carBookService.hasValidParams()) {
        //         vm.errs = carBookService.errs;
        //         return;
        //     }

        //     //then go
        //     vm.pageState = 'part2edit';
        // }
        // function isPageState1() {
        //     return vm.pageState === 'part1edit';
        // }
        // function isPageState2() {
        //     return vm.pageState === 'part2edit';
        // }



        //all scenarios: property taxes + processing fees
        function getTaxesAndFees(room_info) {
            var taf = 0.00;
            if (!room_info) {
                return taf;
            }

            if (room_info.price_details.display_taxes) {
                taf = taf + parseFloat(room_info.price_details.display_taxes);
            }

            if (room_info.price_details.display_processing_fee) {
                taf = taf + parseFloat(room_info.price_details.display_processing_fee);
            }

            return taf;
        }

        //all scenarios: display total + property fee (if any)
        function getTotalCharges(room_info) {
            var total = 0.00;
            if (!room_info) {
                return total;
            }

            //due now
            if (room_info.price_details.display_total) {
                total = total + parseFloat(room_info.price_details.display_total);
            }

            //due at hotel
            if (room_info.price_details.display_property_fee) {
                total = total + parseFloat(room_info.price_details.display_property_fee);
            }

            return total;
        }

        //-- MODALS
        vm.openTaxesAndFeesModal = function () {
            var html = '<p>Here is a breakdown of the estimated taxes, fees, and surcharges that apply to your reservation when you pick-up your rental car:</p>';
            html += '<table class="table table-striped table-responsive light16">';
            for (var i = 0; i < vm.contract.pricing.taxes_and_fees.breakdown_data.length; i++) {
                var t = vm.contract.pricing.taxes_and_fees.breakdown_data[i].title;
                var p = vm.contract.pricing.taxes_and_fees.breakdown_data[i].display_price;
                html += '<tr><td><span xclass="col-xs-12">' + t + '</span></td><td>' + p + '</td></tr>';
            }
            html += '</table><br/><p>Note: Prices are in ' + vm.contract.pricing.display_currency + '</p>';

            var template = require("../../modal/modal.html");
            vm.openModal(template, 'modalController', {
                title: 'Taxes and Fees',
                text: html
            });
        };

        vm.openShuttleDetailsModal = function () {
            var template = require("../../modal/modal.html");
            vm.openModal(template, 'modalController', {
                title: 'Shuttle',
                text: vm.contract.shuttle_text.replaceAll('<br><br>', '<br>'),
                closeOnTop: 'y'
            });
        };

        //please put this in a common utilities!!!!
        String.prototype.replaceAll = function (search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };

        //specific for cars (needs reactoring copied in bookingCarController)
        vm.openPartnerPaymentOptionsModal = function () {
            var template = require("../../modal/modal.html");

            var txt = '<ul>';

            //table of contents
            $.each(vm.contract.car_policy_data, function (key, val) {
                txt += '<li><a href=\'#policy' + key + '\'>' + val.title + '</a></li>';
            });
            txt += '</ul>';

            //descriptions
            $.each(vm.contract.car_policy_data, function (key, val) {
                txt += '<a name=\'policy' + key + '\'>' + val.title + '</a>';
                txt += '<p>' + val.description + '</p>';
            });

            vm.openModal(template, 'modalController', {
                title: 'Rental Policies and Rules',
                text: '<span class="light14">' + txt + '</span>',
                closeOnTop: 'y'
            });
        };


        //copied from reserve controller
        vm.openTermsAndConditionsModal = function () {
            var template = require("../../modal/policyModal.html");
            vm.openModal(template, 'termsAndConditionsModalController', {
                title: 'Terms & Conditions',
                closeOnTop: 'y'
            });
        };

        //copied from reserve controller
        vm.openPrivacyPolicyModal = function () {
            var template = require("../../modal/policyModal.html");
            vm.openModal(template, 'privacyPolicyModalController', {
                title: 'Privacy Policy',
                closeOnTop: 'y'
            });
        };

        vm.openCVVModal = function () {
            var template = require("../../modal/modal.html");
            vm.openModal(template, 'modalController', {
                title: 'Credit Card Security',
                text: require("../../policies/cvv/cvv.html")
            });
        };

        //-- MODALS: COMMON
        vm.openModal = openModal;
        function openModal(template, controller, content) {
            var instance = $uibModal.open({
                template: template, //require("../modal/modal.html"),
                controller: controller, //'modalController',
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
        vm.notyetsure = notyetsure;
        function notyetsure() {
        }

        //-- country/state
        vm.countryChanged = countryChanged;
        function countryChanged() {
            //clear out state object
            carBookService.resetStateObj();
        }

        vm.getArray = getArray;
        function getArray(num) {
            if (!num) return new Array(0);
            return new Array(parseInt(num));
        }

        Date.prototype.addDays = function (days) {
            var dat = new Date(this.valueOf());
            dat.setDate(dat.getDate() + days);
            return dat;
        };

        //-- room rate breakdown modal
        vm.openRatesModal = openRatesModal;
        function openRatesModal() {
            var instance = $uibModal.open({
                template: require("../../hotel/rates.html"), //'/web/dist/login.html',   //'/Template/RenderLoginTemplate'
                controller: 'ratesController',
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                backdrop: 'static',
                controllerAs: 'vm',
                keyboard: true,
                size: 'lg',
                resolve: {
                    items: function () {

                        //determine checkin w/o timezone offset
                        var checkinDateTime = new Date(vm.contract.check_in);
                        var checkinDateTimeAdj = new Date(checkinDateTime.getTime() + (checkinDateTime.getTimezoneOffset() * 60000));

                        //determine checkout w/o timezone offset
                        var checkoutDateTime = new Date(vm.contract.check_out);
                        var checkoutDateTimeAdj = new Date(checkoutDateTime.getTime() + (checkoutDateTime.getTimezoneOffset() * 60000));

                        return {
                            rate: vm.contract.room_info,
                            checkin: checkinDateTimeAdj,
                            checkout: checkoutDateTimeAdj
                        };
                    }
                }
            });
            return instance.result.then(vm.notyetsure);
        }


        //====== BOOK! ======//
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

        function book() {

            //start with 0 errors
            vm.errs = [];



            //-- DETERMINE CUSTOMER ID --//
            //var customerId;

            //existing customerId?
            // var userProfile = JSON.parse(localStorage.getItem('profile')) || null;
            // if (userProfile && userProfile !== null && userProfile.app_metadata) {
            //     customerId = userProfile.app_metadata.customerId;
            //     localStorage.removeItem('unregistered_profile');
            // }

            //do we have a new customerId?
            // if (customerId === undefined) {
            //     var unregisteredProfile = JSON.parse(localStorage.getItem('unregistered_profile')) || null;
            //     if (unregisteredProfile && unregisteredProfile !== null) {
            //         customerId = unregisteredProfile.customerId;
            //     }
            // }

            //not reg and first attempt?
            // if (customerId === undefined) {
            //     var ncid = guid.get();
            //     localStorage.setItem('unregistered_profile', JSON.stringify({customerId:ncid}));
            //     customerId = ncid;
            // }       

            carBookService.params.customer_id = localStorageService.getCustomerId();

            //-- DETERMINE TRACKING ID --//
            var ppntrackingid = userPersistenceService.getPPNTrackingId('car');
            if (ppntrackingid === undefined) {
                ppntrackingid = guid.get();
                userPersistenceService.setPPNTrackingId('car', ppntrackingid);
            }
            carBookService.params.tracking_id = ppntrackingid;



            //set car bundle
            carBookService.setCarBookBundle(vm.contract.car_book_bundle);

            //set cdw initials
            vm.bookRequestParams.cdw_initials = undefined;
            if (vm.bookRequestParams.cdw_selected) {
                vm.bookRequestParams.cdw_initials = vm.bookRequestParams.contract_initials;
            }

            //set reservation details
            carBookService.setReservationDetails(vm.contract);

            //-- LOCAL VALIDATION --//
            carBookService.validate();
            if (!carBookService.hasValidParams()) {
                vm.errs = carBookService.errs;
                return;
            }


            //-- BOOK IT! --//
            var successBookFunc = function (response) {

                //-- handle UNSUCCESSFUL case --//

                //todo: make sure we distinguish between our success message and ppn
                if (response.data.status !== "success") {

                    //assign errors
                    for (var i = 0; i < response.data.errors.length; i++) {

                        var errMsg = '';
                        var err = response.data.errors[i];

                        //error you noticed
                        if (err.message !== null) errMsg = err.message;

                        //error PPN detailed
                        if (err.status !== null) errMsg = '(' + err.code + ') ' + err.status;

                        //just in case
                        if (!errMsg || errMsg === null) errMsg = 'System Error.';

                        vm.errs.push(errMsg);
                    }

                    //show errors & close button
                    var modalScope = $uibModalStack.getTop().value.modalScope;
                    modalScope.vm.showHeader = true;
                    modalScope.vm.title = "Unable to book";

                    var text = "Hmm... we're unable to book your car.";

                    if (vm.errs) {
                        text = text + "<ul>";
                        for (var ie = vm.errs.length - 1; ie >= 0; ie--) {
                            text = text + "<li>" + vm.errs[ie] + "</li>";
                        }
                        text = text + "</ul>";
                    }
                    modalScope.vm.text = text;

                    modalScope.vm.showFooter = true;

                    return;
                }

                //-- HANDLE SUCCESS CASE --//

                //close modal
                $uibModalStack.dismissAll();

                //grab ppn data
                var ppnResultObj = response.data.data.results;
                var bookingId = ppnResultObj.booking_id;
                var bookingStatus = ppnResultObj.status;
                var bookingEmail = ppnResultObj.email;

                console.log(response);
                console.log('car booking complete!');

                //clear tracking id
                //tracking id should live only for lifetime of user's attempt to book (on this reserve page).
                userPersistenceService.clearPPNTrackingId('car');

                //show confirmation page & send email
                $state.go('booking_car', {
                    bid: bookingId,
                    e: ppnResultObj.email,
                    c: 'CONFIRM',    //sends confirmation email
                });
            };

            //when booking is failed
            var errBookFunc = function (response) {
                vm.errs.push('Hmm... looks like a problem occurred while booking... Please try again.  We apologize for the inconvenience.');
                $uibModalStack.dismissAll();
                return;
            };

            vm.openBookingInProgressModal();

            //ensure user sees that booking in progress
            setTimeout(function () {
                dataFactory.bookCar(carBookService.params).then(successBookFunc, errBookFunc);
            }, 2000);

        }

        function setSubstitutes(p) {
            var s = carUtilities.setSubstitutes(p,'reserve');
            return s;
        }

        function initAuth0() {
            $(function () {
                var webAuth = new auth0.WebAuth({
                    domain: vm.env.auth0_spa_domain,
                    clientID: vm.env.auth0_spa_clientId,
                    redirectUri: vm.env.redirectUri
                });

                // sign-in with social provider with plain redirect
                // $('.signin-google').on('click', function() {
                //     webAuth.authorize({
                //     connection: 'google-oauth2' // use connection identifier
                //     });
                // });
                // sign-in with social provider using a popup (window.open)
                // $('.signin-google-popup').on('click', function() {
                //     webAuth.popup.authorize({
                //       connection: 'google-oauth2'
                //     });
                // });

                $('.signin-db').on('click', function () {
                    webAuth.redirect.loginWithCredentials({
                        connection: 'Username-Password-Authentication',
                        username: 'testuser',
                        password: 'testpass',
                        scope: 'openid'
                    });
                });

                // Parse the authentication result
                webAuth.parseHash = function (err, authResult) {
                    if (authResult) {
                        // Save the tokens from the authResult in local storage or a cookie
                        localStorage.setItem('access_token', authResult.accessToken);
                        localStorage.setItem('id_token', authResult.idToken);
                    } else if (err) {
                        // Handle errors
                        console.log(err);
                    }
                };
            });
        }

        //-- NAVIGATION --//
        function goBackToSearchResults() {
            $state.go('cars', carSearchService.getUrlSafeParams());
        }

        //-- CDW --//
        function openCDWTerms(url) {
            var attributes = 'width=600,height=600,resizable=yes,menubar=no,status=no,scrollbars=yes,toolbar=no,directories=no,location=no';
            $window.open(vm.cdw.terms_popup.url, 'cdwTerms', attributes);
        }

        //-- COUNTRIES --//
        // function getCountryData() {

        //     var successFunc = function(response) {
        //         var hackfunc = function(c) {
        //             return { name: c.country, code: c.country_code_ppn };
        //         };
        //         vm.countries = response.data.map(hackfunc);
        //         //TODO: CACHE LOCALLY
        //     };
        //     var errFunc = function(response) {
        //       console.log('unable to fetch country data');
        //     };

        //     //fetch countries 
        //     dataFactory.getCountries().then(successFunc,errFunc);
        // }

        //-- CITIES --//
        // function getCityData() {

        //     var successFunc = function(response) {
        //         var hackfunc = function(c) {
        //             return { name: c.country, code: c.country_code_ppn };
        //         };
        //         vm.countries = response.data.map(hackfunc);
        //         //TODO: CACHE LOCALLY
        //     };
        //     var errFunc = function(response) {
        //       console.log('unable to fetch country data');
        //     };

        //     //fetch countries 
        //     dataFactory.getCountries().then(successFunc,errFunc);
        // }

        //-- NAVIGATION --//
        function login() {
            //$rootScope.state_redirect = { to: 'reserve', params: $stateParams };
            loginModalService();
        }
        function join() {
            //$rootScope.state_redirect = { to: 'reserve', params: $stateParams };
            joinModalService();
        }


    };

    reserveCarController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$filter', '$window', '$uibModal', 'dataFactory', 'carBookService', 'carUtilities', '$uibModalStack', 'userPersistenceService', 'utilities', 'carSearchService', '$sce','guid','localStorageService','loginModalService','joinModalService','environmentService'];
    app.controller('reserveCarController', reserveCarController);
};
