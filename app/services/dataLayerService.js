/*
    datalayer reference:
    https://www.charlesfarina.com/login-and-signup-naming-conventions-for-google-analytics/
*/

module.exports = function(mod){
    var dataLayerService = function (localStorageService, $window, $location) {

        var vm = this;

        vm.getDataLayerReference = getDataLayerReference;

        function getDataLayerReference() {
            return $window.dataLayer = $window.dataLayer || [];
        }


        return {
            pushEvent: function(event) {
                if (!event) return;
                
                //get dataLayer reference
                var dataLayer = vm.getDataLayerReference();

                //push to GA
                dataLayer.push(event);
            },
            userLoginSubmit: function(method) {

                //create event
                var dataLayerEvent = {
                    page: $location.path(),
                    event: 'user-login-submit',
                    connection: method
                };

                //get dataLayer reference
                var dataLayer = vm.getDataLayerReference();

                //push to GA
                dataLayer.push(dataLayerEvent);
            },
            updateGALoginSuccess: function() {
                this.push('user-login-success');
            },
            updateGALoginFailure: function(method) {

                //create event
                var dataLayerEvent = {
                    page: $location.path(),
                    event: 'user-login-fail',
                    connection: method
                };

                //get dataLayer reference
                var dataLayer = vm.getDataLayerReference();

                //push to GA
                dataLayer.push(dataLayerEvent);
            },
            push: function(event, formLocation) {

                //checks
                // if (!location || location==='') {
                //     console.log('no location provided to dataLayer');
                //     return;
                // }
                if (!event || event==='') {
                    console.log('no event provided to dataLayer');
                    return;
                }

                //determine connection
                var connection = 'none';
                var userProfile = localStorageService.getUserProfile();
                if (userProfile) {
                    connection = userProfile.sub.split('|')[0];
                    if (connection ==='auth0') connection='email';
                }

                //determine path
                // var preloginstate = localStorageService.getPreLoginState();
                // var path = '/' + preloginstate.path || $location.path();

                //create event
                var dataLayerEvent = {
                    'page': $location.path(),
                    'formLocation': formLocation,
                    'event': event,
                    'connection': connection
                };

                //if logged in, send non PII customer id
                if (localStorageService.getAuthenticationState()) {
                    var profile = localStorageService.getUserProfile();
                    if (profile.customerId) {
                        dataLayerEvent['user-id'] = profile.customerId;
                    }
                }

                //dataLayer reference
                var dataLayer = $window.dataLayer = $window.dataLayer || [];

                //push to GA
                dataLayer.push(dataLayerEvent);
            }
        };
	};

    dataLayerService.$inject = ['localStorageService', '$window', '$location'];
    mod.factory('dataLayerService', dataLayerService);
};