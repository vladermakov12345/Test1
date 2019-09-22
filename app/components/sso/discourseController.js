/*
    dicourse admin has sso url set to: http://localhost:3000/sso/discourse

*/
module.exports = function(app) {
    var discourseController = function ($stateParams,$rootScope,$state,localStorageService,$window,discourseDataService) {

        var vm = this;

        vm.sso = '';
        vm.sig = '';

        vm.init = init;

        vm.init();

        function init() {

            //retrieve user's auth0 profile
            var profile = localStorageService.getUserProfile();

            //todo: check for existence of profile AND email; redirect to error page if not exists!!!

            vm.sso = $stateParams.sso;  // Base64 encoded string comprising of a nonce
            vm.sig = $stateParams.sig;

            //decode base64 string
            var decoded = atob(vm.sso);
            var keyVals = decoded.split('&');

            //determine return sso url
            var inputReturnSSOUrl = keyVals[1].split('=')[1];


            //1. Validate the signature, ensure that HMAC-SHA256 of sso_secret, PAYLOAD is equal to the sig


            //2. Perform whatever authentication it has to


            //3. Create a new payload with nonce, email, external_id and optionally (username, name)
            var payload = '';

            //nonce should be copied from the input payload
            var inputNonce = keyVals[0].split('=')[1];
            payload+='nonce='+inputNonce;

            //email must be a verified email address.
            payload+='&email='+profile.email;
            
            //if the email address has not been verified, set require_activation to “true”.
            var requireActivation = (profile.email_verified!==true)?'true':'false';
            payload+='&require_activation='+requireActivation;

            //external_id is any string unique to the user that will never change, even if their email, name, etc change. The suggested value is your database’s ‘id’ row number.
            payload+='&external_id='+profile.customerId;

            //username will become the username on Discourse if the user is new or SiteSetting.sso_overrides_username is set.
            //sso overrides username is checked

            //name will become the full name on Discourse if the user is new or SiteSetting.sso_overrides_name is set.
            //sso overrides name is checked

            //avatar_url will be downloaded and set as the user’s avatar if the user is new or SiteSetting.sso_overrides_avatar is set.
            payload+='&avatar_url='+encodeURIComponent(profile.picture);
            //sso overrides avatar is checked

            //avatar_force_update is a boolean field. If set to true, it will force Discourse to update the user’s avatar, whether avatar_url has changed or not.
            payload+='&avatar_force_update=true';

            //bio will become the contents of the user’s bio if the user is new, their bio is empty or SiteSetting.sso_overrides_bio is set.
            //tbd

            //Additional boolean (“true” or “false”) fields are: admin, moderator, suppress_welcome_message
            payload+='&suppress_welcome_message=true';

            //4. sign the payload
            var base64EncodedPayload = btoa(payload);   //base64 encode
            

            //5. sign the Base64 encoded Payload :: calculate a HMAC-SHA256 hash of the payload using sso_secret as the key and Base64 encoded payload as text
            //6. Redirect back to http://discourse_site/session/sso_login?sso=payload&sig=sig
            var successFunc = function(response) {
                
                //determine redirect url                
                var ret = decodeURIComponent(inputReturnSSOUrl);

                //determine sso
                var urlEncodedPayload = encodeURIComponent(base64EncodedPayload);   //url encode
                console.log('url Encoded Payload (sso): '+urlEncodedPayload);

                //determine sig
                var HMAC_SHA256 = response.data.data;
                console.log('sig: '+HMAC_SHA256);

//todo: not the best place to set this
localStorageService.setDiscourseSession(true);
                //redirect
                var url = ret+'?sso='+urlEncodedPayload+'&sig='+HMAC_SHA256;
                $window.open(url, '_self');
            };
            var errFunc = function(response) {
                console.log(response);
            };

            console.log('nonce: '+inputNonce);
            console.log('payload: '+payload);
            console.log('base64 Encoded Payload: '+base64EncodedPayload);
            
            discourseDataService.getDiscoursePayload(base64EncodedPayload).then(successFunc,errFunc);
        }

        //handle if logged in and action to take is to login
        // function userIsLoggedIn() {
        //     if (localStorageService.getAuthenticationState()) {
        //         currentlyLoggedInModalService();
        //         return true;
        //     }
        //     return false;
        // }
    };

    discourseController.$inject = ['$stateParams','$rootScope','$state','localStorageService','$window','discourseDataService'];
    app.controller('discourseController', discourseController);
};
