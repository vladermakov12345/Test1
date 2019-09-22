module.exports = function(app) {
    var reserveController = function ($rootScope,$scope,$stateParams,$state,$filter,$window,$uibModal,dataFactory,hotelBookService, hotelUtilities,$uibModalStack,userPersistenceService,utilities,hotelSearchService,hotelLookupService,$location,localStorageService,loginModalService,joinModalService,environmentService, dataLayerService, errorService) {

        var vm = this;
        vm.env = environmentService();

        vm.hotelUtilities = hotelUtilities;
        vm.isBundleFound = true;
        vm.step1errs = [];
        vm.errs = [];
        vm.contract = {};
        vm.init = init;
        vm.getContract = getContract;
        vm.getTaxes = getTaxes;
        vm.getFees = getFees;
        vm.getTotalCharges = getTotalCharges;
        
        //NAVIGATION
        vm.goBackToRoomOptions = goBackToRoomOptions;
        vm.goBackToSearchResults = goBackToSearchResults;

        vm.login = login;
        vm.join = join;

        //-- contract
        vm.isWaitingContract = true;

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
        vm.goToPart1 = goToPart1;
        vm.goToPart2 = goToPart2;
        vm.isPageState1 = isPageState1;
        vm.isPageState2 = isPageState2;

        //-- tracking
        vm.notifyGoogle = notifyGoogle;
        vm.pushToGAInitiate = pushToGAInitiate;
        vm.pushToGAPurchase = pushToGAPurchase;

        require("./reserve.less");

        vm.init();

//todos:
//1. make sure tracking_id is cleared out along with everything else when user gets to the reserve page

        function init() {

            //clearing tracking cookie here b/c
            //1. we want to chance for back/resubmission
            //2. we have to clear before user makes a new legitimate booking
            userPersistenceService.clearPPNTrackingId('hotel');


            //clear out previously entered customer & cc info
            hotelBookService.resetParams();
            vm.bookRequestParams = hotelBookService.params;
            vm.bookRequestHelper = hotelBookService.helper;

            //logged in? populate & disable email field
            $rootScope.$watch('userProfile', function (newVal,oldVal) {
                if ($rootScope.userProfile) {
                    //TODO: apply other fields from $rootScope
                    vm.bookRequestParams.name_first = $rootScope.userProfile.given_name;
                    vm.bookRequestParams.name_last = $rootScope.userProfile.family_name;
                    vm.bookRequestParams.email = $rootScope.userProfile.email;
                }
            });

            vm.getContract();

            //vm.initAuth0();
        }

        function getContract() {

            //identify ppn bundle
            if (!$stateParams.ppn_bundle || $stateParams.ppn_bundle ==="true" || $stateParams.ppn_bundle==='') {
                vm.isBundleFound = false;
                console.log('state param \'ppn_bundle\' not determined');
                //todo: are we handling this case in code?
                return;
            }

            vm.isWaitingContract = true;

            var successFunc = function (response) {
                if (!response.data.data || !response.data.data.results || !response.data.data.results.result) {
                    //TODO: gracefully show error message to user
                    console.log(response.data.errors);
                    vm.isWaitingContract = false;
                    return;
                }
                vm.contract = response.data.data.results.result;
            //todo: does our strategy consider refreshes? - you may need to update the
            //tracking_id only when not refreshed

                //grab the booking ppn bundle
                //hotelBookService.params.ppn_bundle = vm.contract.ppn_bundle;

                //do we have a tracking id in cookies?
                var ppntrackingid = userPersistenceService.getPPNTrackingId('hotel');

                if (ppntrackingid === undefined) {
                    //use tracking id that tags along with our call to contract
                    hotelBookService.params.tracking_id = response.data.data.trackingId;

                    //update cookies
                    userPersistenceService.setPPNTrackingId('hotel',hotelBookService.params.tracking_id);
                } else {
                    hotelBookService.params.tracking_id = ppntrackingid;
                }

                //need hotel ppn id when booking
                hotelBookService.params.HotelPPNId = vm.contract.hotel.hotel_id;
                
                vm.isWaitingContract = false;

                vm.pushToGAInitiate();

                //test
                if ($stateParams.testConversion==='2295') {
                    vm.pushToGAPurchase();
                }
            };

            var errFunc = function (response) {
                console.log(response);
                //TODO: gracefully show error message to user
                vm.isWaitingContract = false;
            };

            var params = {
                ppn_bundle: $stateParams.ppn_bundle
            };

            dataFactory.getContract(params).then(successFunc,errFunc);
        }

        function pushToGAInitiate() {
            if (!vm.contract) return;

            var eventData = {
                content_type: 'hotel',  //must be set to initiatecheckout for hotel ads
                content_ids: vm.contract.hotel.hotel_id,
                city: vm.contract.hotel.address.city_name,
                region: vm.contract.hotel.address.state_code,
                country: vm.contract.hotel.address.country_code,
                checkin_date: dateFns.format(vm.contract.check_in, 'YYYY-MM-DD'),
                checkout_date: dateFns.format(vm.contract.check_out, 'YYYY-MM-DD')
            }
            dataLayerService.pushEvent({event: 'InitiateCheckout', data: eventData});
        }

        function pushToGAPurchase() {
            try {
                if (!vm.contract) return;
                var eventData = {
                    content_type: 'hotel',  //must be set to initiatecheckout for hotel ads
                    content_ids: vm.contract.hotel.hotel_id,
                    city: vm.contract.hotel.address.city_name,
                    region: vm.contract.hotel.address.state_code,
                    country: vm.contract.hotel.address.country_code,
                    checkin_date: dateFns.format(vm.contract.check_in, 'YYYY-MM-DD'),
                    checkout_date: dateFns.format(vm.contract.check_out, 'YYYY-MM-DD'),
                    value: vm.contract.room_info.price_details.display_price
                };
                dataLayerService.pushEvent({event: 'Purchase', data: eventData});
            } catch(err) {
                console.error('Problem running pushToGAPurchase()',err);
            }
        }

        function goToPart1() {
            vm.pageState = 'part1edit';
        }
        function goToPart2() {
            vm.step1errs = [];
            hotelBookService.validatePart1();
            if (!hotelBookService.hasValidParams()) {
                vm.step1errs = hotelBookService.errs;
                return;
            }

            //then go
            vm.pageState = 'part2edit';
        }
        function isPageState1() {
            return vm.pageState === 'part1edit';
        }
        function isPageState2() {
            return vm.pageState === 'part2edit';
        }

        

        //all scenarios: property taxes
        function getTaxes(room_info) {
            var taxes = 0.00;
            if (!room_info) {
                return taxes;
            }

            if (room_info.price_details.display_taxes) {
                taxes = taxes + parseFloat(room_info.price_details.display_taxes);
            }

            return taxes;
        }

        //all scenarios: processing fee only
        function getFees(room_info) {
            var fees = 0.00;
            if (!room_info) {
                return fees;
            }

            //processing fee
            if (room_info.price_details.display_processing_fee) {
                fees = fees + parseFloat(room_info.price_details.display_processing_fee);
            }

            //property fee
            // if (room_info.price_details.display_property_fee) {
            //     fees = fees + parseFloat(room_info.price_details.display_property_fee);
            // }

            return fees;
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
        vm.openTaxesAndFeesModal = function() {
            var html = '';
            for (var i=0;i<vm.contract.taxes_and_fees_policy.policy_data.length;i++) {
                if (vm.contract.taxes_and_fees_policy.policy_data[i].title.startsWith('Taxes and Fees')) {
                    var p = vm.contract.taxes_and_fees_policy.policy_data[i].paragraph_data;
                    for(var d=0;d<p.length;d++) {
                        html += '<div class="col-xs-12 light16" style="margin:.5em 0;">'+p[d]+'</div>';
                    }
                }
            }
            
            var title = 'Taxes and Fees';
            if (vm.contract.rate_type==='PRF') {
                title+=' May Apply';
            }

            var template = require("../modal/modal.html");
            vm.openModal(template,'modalController',{
                title: title,
                text: html
            });
        };

        vm.openCVVModal = function() {
            var template = require("../modal/modal.html");
            vm.openModal(template,'modalController',{
                title: 'Credit Card Security',
                text: require("../policies/cvv/cvv.html")
            });
        };

        vm.openTermsAndConditionsModal = function() {
            var template = require("../modal/policyModal.html");
            vm.openModal(template,'termsAndConditionsModalController',{
                title: 'Terms & Conditions',
                closeOnTop: 'y'
            });
        };

        vm.openPrivacyPolicyModal = function() {
            var template = require("../modal/policyModal.html");
            vm.openModal(template,'privacyPolicyModalController',{
                title: 'Privacy Policy',
                closeOnTop: 'y'
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
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            backdrop:'static',
            keyboard: true,
            size: 'lg',
            resolve: {
                items: function() {
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
            hotelBookService.resetStateObj();
        }

        vm.getArray = getArray;
        function getArray(num) {
          if (!num) return new Array(0);
          return new Array(parseInt(num));   
        }

        Date.prototype.addDays = function(days) {
          var dat = new Date(this.valueOf());
          dat.setDate(dat.getDate() + days);
          return dat;
        };

        //-- room rate breakdown modal
        vm.openRatesModal = openRatesModal;
        function openRatesModal() {
          var instance = $uibModal.open({
            template: require("../hotel/rates.html"), //'/web/dist/login.html',   //'/Template/RenderLoginTemplate'
            controller: 'ratesController',
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            backdrop:'static',
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
                template: require("../modal/modal.html"),
                controller: 'modalController',
                controllerAs: 'vm',
                bindToController: true,
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                backdrop:'static',
                keyboard: true,
                size: 'lg',
                resolve: {
                    items: function() {
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

            vm.isButtonDisable=true;

            //setup comments field
            hotelBookService.setComments();

            //get profile
            //var userProfile = JSON.parse(localStorage.getItem('profile')) || null;

            //set customer id
            hotelBookService.params.customer_id = localStorageService.getCustomerId();  // userProfile.app_metadata.customerId;

            //include ppn bundle
            hotelBookService.setPPNBundle(vm.contract.ppn_bundle);  //$stateParams.ppn_bundle);
            //hotelBookService.setTrackingId()

            //explicitly NOT CUG
            hotelBookService.setCUG(false);

            var numGuests = vm.contract.num_adults + vm.contract.num_children;
            var numRooms = vm.contract.num_rooms;
            var checkIn = vm.contract.check_in;
            var checkOut = vm.contract.check_out;
            hotelBookService.setSearchCriteria(numGuests,numRooms,checkIn,checkOut);
            
            //validate
            hotelBookService.validatePart2();
            if (!hotelBookService.hasValidParams()) {
                vm.errs = hotelBookService.errs;
                if(vm.errs.length>0)
                {
                    vm.isButtonDisable=false;
                }
                return;
            }

            //when booking is success:
            var successBookFunc = function (response) {
                vm.isButtonDisable=false;
                //todo: make sure we distinguish between our success message and ppn
                if (response.data.status !== "success") {

                    //start with 0 errors
                    vm.errs = [];

                    //assign errors
                    for (var i=0;i<response.data.errors.length;i++) {

                        var errMsg = '';
                        var err = response.data.errors[i];
                        
                        //error you noticed
                        if (err.message !== null) errMsg = err.message;

                        //error PPN detailed
                        if (err.status !== null) errMsg = '('+err.code+') '+err.status;

                        //just in case
                        if (!errMsg || errMsg === null) errMsg = 'System Error.';
                        
                        vm.errs.push(errMsg);
                        console.log('pushing err msg...');
                        console.log(errMsg);
                        console.log('... done');
                    }
                      
                    //show errors & close button
                    var modalScope = $uibModalStack.getTop().value.modalScope;
                    modalScope.vm.showHeader = true;
                    modalScope.vm.title = "Unable to book";

                    var text = "Hmm... we're unable to book your hotel.";

                    if (vm.errs) {
                      text=text+"<ul>";
                      for (var ie = vm.errs.length - 1; ie>= 0; ie--) {
                          text=text+"<li>" + vm.errs[ie] + "</li>";
                      }
                      text=text+"</ul>";
                    }
                    modalScope.vm.text = text;

                    modalScope.vm.showFooter = true;

                    return;
                }

                //close modal
                $uibModalStack.dismissAll();

                //grab ppn data
                var ppnResultObj = response.data.data.results.result;
                var bookingId = ppnResultObj.itinerary.id;
                var bookingStatus = ppnResultObj.itinerary.status;

                //notify google
                //vm.notifyGoogle();
                vm.pushToGAPurchase();

                //show confirmation page
                $state.go('booking_hotel', {
                    bid: bookingId,
                    e: vm.bookRequestParams.email,
                    c: 'CONFIRM',    //sends confirmation email
                });
            };

            //when booking is failed
            var errBookFunc = function (response) {
                //todo: create a way for user to indicate that they wish to be notified when the error is resolved.
                
                var msg = errorService.handle({
                    httpResponse: response,
                    message: 'A problem occurred while booking.  We have recorded this error and are looking into it.  Please <a href="contact">contact us</a> if you would like to be notified when this error is resolved. We apologize for the inconvenience.'
                });

                //todo: should be through an error directive (on a panel) so it is clearer
                vm.errs.push(msg);

                vm.isButtonDisable=false;
                $uibModalStack.dismissAll();
                
                return;
            };

            vm.openBookingInProgressModal();

            //ensure user sees that booking in progress
            setTimeout(function(){
                dataFactory.bookHotel(hotelBookService.params).then(successBookFunc,errBookFunc);
            }, 2000);

        }

        function notifyGoogle() {
            var path = $location.path();

            if (vm.env.name === 'production') {
                //removing as per Daniel
                //$window.ga('event', 'code_hotel_booking_success', path);
            }

            dataLayerService.push('code_hotel_booking_success','reserve');

            // var dataLayer = $window.dataLayer = $window.dataLayer || [];
            // dataLayer.push({
            //     'event': 'code_hotel_booking_success',
            //     'attributes': {
            //       'route': path
            //     }
            // });
            // console.log('fired notifyGoogle()');
            
            // $window.google_trackConversion({
            //   google_conversion_id: 821724373, 
            //   google_conversion_language: "en",
            //   google_conversion_format: "3",
            //   google_conversion_color: "060116",
            //   google_conversion_label: 'JnwiCM3S6X0Q1YnqhwM',  // if provided, remove this line if not provided
            //   google_conversion_value: 30,  // or the dollar value of this conversion, e.g. 100 etc.
            //   google_remarketing_only: false
            // });
        }

        function setSubstitutes(p) {
            return hotelUtilities.setSubstitutes(p);
        }

        function initAuth0() {
            $(function() {
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

                $('.signin-db').on('click', function() {
                    webAuth.redirect.loginWithCredentials({
                      connection: 'Username-Password-Authentication',
                      username: 'testuser',
                      password: 'testpass',
                      scope: 'openid'
                    });
                });

                // Parse the authentication result
                webAuth.parseHash = function(err, authResult) {
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
            $state.go('hotels', hotelSearchService.getUrlSafeParams());
        }
        function goBackToRoomOptions() {
            $window.history.back();
            //$state.go('hotel', hotelLookupService.getUrlSafeParams());
        }

        function login() {
            $rootScope.state_redirect = { to: 'reserve', params: $stateParams };
            loginModalService(getParams());
        }
        function join() {
            $rootScope.state_redirect = { to: 'reserve', params: $stateParams };
            joinModalService(getParams());
        }
        function getParams() {
            return {
                text: {
                    heading: 'You\'re almost done!',
                    subHeadingJoin: 'Create an account to complete your booking',
                    subHeadingLogin: 'Log in to complete your booking'
                }
            };
        }
    };

    reserveController.$inject = ['$rootScope','$scope','$stateParams','$state','$filter','$window','$uibModal','dataFactory','hotelBookService','hotelUtilities','$uibModalStack','userPersistenceService','utilities','hotelSearchService','hotelLookupService','$location','localStorageService','loginModalService','joinModalService','environmentService', 'dataLayerService', 'errorService'];
    app.controller('reserveController', reserveController);
};
