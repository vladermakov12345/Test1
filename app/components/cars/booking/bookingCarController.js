module.exports = function(app) {
    var bookingCarController = function ($state,$stateParams,dataFactory,$uibModal,carUtilities) {

        var vm = this;
        vm.bookingId = undefined;
        vm.isValidSearchCriteria = undefined;
        vm.errs = [];
        vm.details = {};

        vm.init = init;
        vm.carUtilities = carUtilities;

        //-- policy
        vm.setSubstitutes = setSubstitutes;

        //-- modals
        vm.openModal = openModal;
        vm.openTermsAndConditionsModal = openTermsAndConditionsModal;

        vm.init();

        function init() {

            //booking id?
            vm.bookingId = $stateParams.bid;
            if (vm.bookingId === undefined) {
                vm.isValidSearchCriteria = false;
                vm.errs.push("No booking id found");
                return;
            }

            //email?
            vm.email = $stateParams.e;
            if (vm.email === undefined) {
                vm.isValidSearchCriteria = false;
                vm.errs.push("No email address found");
                return;
            }

            //concern?
            vm.concern = $stateParams.c;
            if (vm.concern === undefined) {
                vm.concern = 'view';
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
                vm.details = response.data.data.results;
                console.log(vm.details);
                vm.isValidSearchCriteria = true; 
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
                c: vm.concern
            };
            dataFactory.getCarBooking(params).then(successFunc,errFunc);

            //was there an email requested too?
            // if ($stateParams.c === undefined) {
            //     console.log('no email');
            // } else {
            //     console.log($stateParams.c);
            //     if ($stateParams.c === 'CONFIRM') console.log('send confirmation email');
            //     if ($stateParams.c === 'CANCEL') console.log('send cancel email');
            // }
            
        }

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

        //-- MODAL (GENERIC)
        vm.openTaxesAndFeesModal = function() {
            var html = '';
            for (var i=0;i<vm.details.car_policy_data.length;i++) {
                if (vm.details.car_policy_data[i].title === 'Taxes and Fees') {
                    var p = vm.details.car_policy_data[i].text;
                    for(var d=0;d<p.length;d++) {
                        html += '<p class="col-xs-12 light16">'+p[d]+'</p>';
                    }
                }
            }
            
            var title = 'Taxes and Fees';
            // if (vm.details.rate_type==='PRF') {
            //     title+=' May Apply';
            // }

            var template = require('../../modal/modal.html');
            vm.openModal('modalController',template,{
                title: title,
                text: html                
            });
        };

        

        vm.notyetsure = notyetsure;
        function notyetsure() {
        }

        //-- MODAL (CANCEL BOOKING)
        vm.openCancelBookingModal = function() {
            var html = '';
            var title = 'Are you sure you wish to cancel this booking?';

            var template = require('../../modal/cancelBookingModal.html');
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
            return carUtilities.setSubstitutes(p,'booking');
        }

        vm.openPartnerPaymentOptionsModal = function () {
            var template = require("../../modal/modal.html");

            var txt = '<ul>';

            //table of contents
            $.each(vm.details.car_policy_data, function (key, val) {
                txt += '<li><a href=\'#policy' + key + '\'>' + val.title + '</a></li>';
            });
            txt += '</ul>';

            //descriptions
            $.each(vm.details.car_policy_data, function (key, val) {
                txt += '<a name=\'policy' + key + '\'>' + val.title + '</a>';
                txt += '<p>' + val.description + '</p>';
            });

            vm.openModal('modalController', template, {
                title: 'Rental Policies and Rules',
                text: '<span class="light14">' + txt + '</span>',
                closeOnTop: 'y'
            });
        };

        //copied from reserve controller
        function openTermsAndConditionsModal() {
            var template = require("../../modal/policyModal.html");
            vm.openModal('termsAndConditionsModalController', template, {
                title: 'Terms & Conditions',
                closeOnTop: 'y'
            });
        }

        //copied from reserve controller
        vm.openPrivacyPolicyModal = function () {
            var template = require("../../modal/policyModal.html");
            vm.openModal('privacyPolicyModalController', template, {
                title: 'Privacy Policy',
                closeOnTop: 'y'
            });
        };

        vm.openTaxesAndFeesModal = function () {
            var html = '<p>Here is a breakdown of the estimated taxes, fees, and surcharges that apply to your reservation when you pick-up your rental car:</p>';
            html += '<table class="table table-striped table-responsive light16">';
            for (var i = 0; i < vm.details.pricing.taxes_and_fees.breakdown_data.length; i++) {
                var t = vm.details.pricing.taxes_and_fees.breakdown_data[i].title;
                var p = vm.details.pricing.taxes_and_fees.breakdown_data[i].display_price;
                html += '<tr><td><span xclass="col-xs-12">' + t + '</span></td><td>' + p + '</td></tr>';
            }
            html += '</table><br/><p>Note: Prices are in ' + vm.details.pricing.display_currency + '</p>';

            var template = require("../../modal/modal.html");
            vm.openModal('modalController', template, {
                title: 'Taxes and Fees',
                text: html
            });
        };
    };

    bookingCarController.$inject = ['$state','$stateParams','dataFactory','$uibModal','carUtilities'];
    app.controller('bookingCarController', bookingCarController);
};
