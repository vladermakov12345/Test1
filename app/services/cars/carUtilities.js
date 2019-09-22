module.exports = function(mod){
	var carUtilities = function($filter,$sce) {
        
        this.getAddress = function(hotelAddress) {
            if (!hotelAddress) return;
            var a = hotelAddress.address_line_one;
            if (hotelAddress.city_name) a = a+', '+hotelAddress.city_name;
            if (hotelAddress.state_name) a = a+', '+hotelAddress.state_name;
            if (hotelAddress.zip) a = a+', '+hotelAddress.zip;
            if (hotelAddress.country_name) a = a+', '+hotelAddress.country_name;
            return a;
        };

        this.getCheckDateTime = function(checkOutDate, checkOutTime) {
            var r = '';
            if (checkOutDate) {
                r+=$filter('date')(checkOutDate, 'fullDate');
            }
            if (checkOutTime) {
                r+=' '+ checkOutTime;
            }
            return r;
        };

        //policy substitutes
        this.setSubstitutes = function(p, page) {
            var partnerPaymentOptionsModal = '<a href="javascript:angular.element(document.getElementById(\'oReserveCarController\')).scope().'+page+'.openPartnerPaymentOptionsModal()">';
            var termsAndConditionsModal = '<a href="javascript:angular.element(document.getElementById(\'oReserveCarController\')).scope().'+page+'.openTermsAndConditionsModal()">';
            var privacyPolicyModal = '<a href="javascript:angular.element(document.getElementById(\'oReserveCarController\')).scope().'+page+'.openPrivacyPolicyModal()">';



            p = p.replace('#START_ANCHOR_PARTNERPAYMENTOPTIONS#',partnerPaymentOptionsModal);
            p = p.replace('#END_ANCHOR_PARTNERPAYMENTOPTIONS#','</a>');

            p = p.replace('#START_ANCHOR_RENTALPOLICYANDRULES#',partnerPaymentOptionsModal);
            p = p.replace('#END_ANCHOR_RENTALPOLICYANDRULES#','</a>');

            p = p.replace('#START_ANCHOR_TERMSANDCONDITIONS#',termsAndConditionsModal);
            p = p.replace('#END_ANCHOR_TERMSANDCONDITIONS#','</a>');

            p = p.replace('#START_ANCHOR_PRIVACYPOLICY#',privacyPolicyModal);
            p = p.replace('#END_ANCHOR_PRIVACYPOLICY#','</a>');

            // p = p.replace(/#br#/g, '<br />');
            // p = p.replace('#startFaqLink#Frequently Asked Questions#endFaqLink#','');
            // p = p.replace('#FAQ_START#charges#FAQ_END#','charges');
            // p = p.replace('These #START_PHOTO#charges#END_PHOTO# may be mandatory (e.g., resort fees) or optional (parking, phone calls or minibar charges) and are not included in the room rate.','These charges may be mandatory (e.g., resort fees) or optional (parking, phone calls or minibar charges) and are not included in the room rate. Depending on the property you stay at you may also be charged (i) certain per person, per room or percentage based mandatory hotel specific service fees, for example, resort fees (which typically apply to resort type destinations and, if applicable, may range from $10 to $40 per day), energy surcharges, newspaper delivery fees, in-room safe fees, tourism fees, or housekeeping fees and/or (ii) certain optional incidental fees, for example, parking charges, minibar charges, phone calls, room service and movie rentals, etc. These charges, if applicable, will be payable by you to the hotel directly at checkout and are not included in your room rate. Please contact the hotel directly as to whether and which charges or service fees apply.');
            // p = p.replace('#START_OCCUPANCY#','');
            // p = p.replace('#END_OCCUPANCY#','');
            // p = p.replace('+1 212 444 0917','877-477-7441');
            return $sce.trustAsHtml(p);
        };
        
	};

    carUtilities.$inject = ['$filter','$sce'];
    mod.service('carUtilities', carUtilities);
};