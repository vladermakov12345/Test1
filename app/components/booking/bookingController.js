module.exports = function(app) {
    var bookingHotelController = function ($state,$stateParams,dataFactory,$uibModal,hotelUtilities,dataLayerService,environmentService) {

        var vm = this;
        vm.env = environmentService();
        vm.bookingId = undefined;
        vm.isValidSearchCriteria = undefined;
        vm.errs = [];
        vm.details = {};

        vm.init = init;
        vm.getTaxesAndFees = getTaxesAndFees;
        vm.hotelUtilities = hotelUtilities;
        vm.setSubstitutes = setSubstitutes;
        vm.pushToGAPurchase = pushToGAPurchase;
        //vm.getReviewLink = getReviewLink;

        vm.init();

        function init() {

            //do we have a booking id?
            vm.bookingId = $stateParams.bid;
            vm.email = $stateParams.e;

            if (vm.bookingId === undefined) {
                vm.isValidSearchCriteria = false;
                vm.errs.push("No booking id found");
                return;
            }

            if (vm.email === undefined) {
                vm.isValidSearchCriteria = false;
                vm.errs.push("No email address found");
                return;
            }

            //lookup booking
            var successFunc = function (response) {

                //errors?
                if (response.data.status !== 'success') {
                    vm.isValidSearchCriteria = false;

                    var errMsg = '';
                    var err = response.data.errors[0];
                    
                    //error you noticed
                    if (err.message !== null) errMsg = err.message;

                    //error PPN detailed
                    if (err.status !== null) errMsg = '('+err.code+') '+err.status;

                    //just in case
                    if (!errMsg || errMsg === null) errMsg = 'System Error.';
                    
                    vm.errs.push(errMsg);
                    
                    return;
                }

                //good!
                vm.details = response.data.data.results.result;
                vm.isValidSearchCriteria = true; 

                //hack
                if ($stateParams.c === 'CONFIRM') {
                    vm.pushToGAPurchase();
                }

                //review link
                vm.reviewLink = vm.env.SPA_URL + '/reviewHotel?hid='+vm.details.hotel.hotel_id;
            };

            var errFunc = function (response) {
              //todo: vm.isWaitingContract = false;
              //todo: this is a system error and there may not be anything that comes back from ppn
              vm.isValidSearchCriteria = false;

              if (response.data.errors && response.data.errors.length>0) {
                  vm.errs.push(response.data.errors[0].message);
              }
              return;
            };

            var params = {
                bookingId: vm.bookingId,
                email: vm.email,
                c: $stateParams.c
            };
            dataFactory.getHotelBooking(params).then(successFunc,errFunc);

            //was there an email requested too?
            // if ($stateParams.c === undefined) {
            //     console.log('no email');
            // } else {
            //     console.log($stateParams.c);
            //     if ($stateParams.c === 'CONFIRM') console.log('send confirmation email');
            //     if ($stateParams.c === 'CANCEL') console.log('send cancel email');
            // }
            
        }

        function pushToGAPurchase() {
            if (!vm.details) return;

            var eventData = {
                content_type: 'hotel',  //must be set to initiatecheckout for hotel ads
                content_ids: vm.details.hotel.hotel_id,
                city: vm.details.hotel.address.city_name,
                region: vm.details.hotel.address.state_code,
                country: vm.details.hotel.address.country_code,
                checkin_date: dateFns.format(vm.details.itinerary.check_in, 'YYYY-MM-DD'),
                checkout_date: dateFns.format(vm.details.itinerary.check_out, 'YYYY-MM-DD'),
                value: vm.details.price_details.display_price
            }
            dataLayerService.pushEvent({event: 'Purchase', data: eventData});
        }

        //all scenarios: property taxes + processing fees
        function getTaxesAndFees(room_info) {
            var taf = 0.00;
            if (!room_info || !room_info.price_details) {
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

        //-- MODAL (GENERIC)
        vm.openTaxesAndFeesModal = function() {
            var html = '';
            for (var i=0;i<vm.details.taxes_and_fees.policy_data.length;i++) {
                if (vm.details.taxes_and_fees.policy_data[i].title === 'Taxes and Fees') {
                    var p = vm.details.taxes_and_fees.policy_data[i].paragraph_data;
                    for(var d=0;d<p.length;d++) {
                        html += '<p class="col-xs-12 light16">'+p[d]+'</p>';
                    }
                }
            }
            
            var title = 'Taxes and Fees';
            // if (vm.details.rate_type==='PRF') {
            //     title+=' May Apply';
            // }

            var template = require('../modal/modal.html');
            vm.openModal('modalController',template,{
                title: title,
                text: html                
            });
        };

        vm.openModal = openModal;
        function openModal(controller, template, content) {
            var instance = $uibModal.open({
            template: template,
            controller: controller,
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

        //-- MODAL (CANCEL BOOKING)
        vm.openCancelBookingModal = function() {
            var html = '';
            var title = 'Are you sure you wish to cancel this booking?';

            var template = require('../modal/cancelBookingModal.html');
            vm.openModal('cancelBookingModalController',template,{
                title: title,
                text: html,
                ppnBundle: vm.details.actions.cancel,
                cancelBookingSuccessFunc: vm.refreshToShowCancelState
            });
        };
        vm.refreshToShowCancelState = refreshToShowCancelState;
        function refreshToShowCancelState() {
            //refresh this view page to see that it is now cancelled
            $state.reload();
        }


        vm.getArray = getArray;
        function getArray(num) {
          if (!num) return new Array(0);
          return new Array(parseInt(num));   
        }

        vm.openHotelPage = openHotelPage;
        function openHotelPage() {
            var params = { hid: vm.details.hotel.hotel_id, checkin: '3.22.2017', checkout:'3.23.2017', rooms:1, guests:1 };
            var url = $state.href('hotel', params);
            window.open(url,'_blank');
        }

        vm.print = print;
        function print(){
            window.print();

            // var divName = 'bookingDetailsSection';
            // var printContents = document.getElementById(divName).innerHTML;
            // var popupWin = window.open('', '_blank', 'width=400,height=400');
            // popupWin.document.open();
            // popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
            // popupWin.document.close();
            // popupWin.onbeforeunload = function (event) {
            //     popupWin.document.close();
            //     popupWin.close();
            // };
        }

        function setSubstitutes(p) {
            return hotelUtilities.setSubstitutes(p);
        }

        // function getReviewLink() {
        //     return $state.href('reviewHotel', { hid: vm.details.hotel.hotel_id }, {absolute: true});
        // }
    };

    bookingHotelController.$inject = ['$state','$stateParams','dataFactory','$uibModal','hotelUtilities','dataLayerService','environmentService'];
    app.controller('bookingHotelController', bookingHotelController);
};
