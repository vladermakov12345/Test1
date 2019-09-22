module.exports = function(app) {

    var socialLoginRedirController = function ($rootScope,$stateParams,$state,$document,localStorageService,angularAuth0,utilities,dataFactory,AUTH_EVENTS,environmentService,redirectionService,travelersClubModalService,authService,dataLayerService) {
		var vm = this;
        vm.env = environmentService();
        vm.init = init;
        vm.callAuthParseHash = callAuthParseHash;
        vm.goToPreLoginState = goToPreLoginState;

        vm.inProgress = true;
        
        vm.getAccessToken = getAccessToken;
        vm.getIdToken = getIdToken;
        vm.getError = getError;
        vm.getErrorDescription = getErrorDescription;
        vm.getState = getState;
        vm.getIsReg = getIsReg;
        vm.socialRegisterCB = socialRegisterCB;
        vm.setUserData = setUserData;
        //vm.closeModal
        vm.partnerCheckAndEnroll = partnerCheckAndEnroll;

    	vm.access_token = vm.getAccessToken();
    	vm.id_token = vm.getIdToken();
    	vm.error = vm.getError();
    	vm.errorDescription = vm.getErrorDescription();
        vm.state = vm.getState();
        vm.isReg = vm.getIsReg();

        var base64 = require('base64-js');

        vm.init();

	//example success response: http://localhost:8080/social_login_redir#access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik16a3dSa1JCTkRKRk1rUTFORGM1UXpFNVFqSTRNRGxDUlRFMlFVWTJSa0pCTkVSRlJEY3pPQSJ9.eyJpc3MiOiJodHRwczovL2FjY2Vzc2libGVnby5hdXRoMC5jb20vIiwic3ViIjoiZmFjZWJvb2t8MTAxNTgzNjg0NjI2ODU1NzQiLCJhdWQiOlsiaHR0cHM6Ly9hY2Nlc3NpYmxlZ28uY29tL2FwaS8iLCJodHRwczovL2FjY2Vzc2libGVnby5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNTI2NDQzOTAwLCJleHAiOjE1MjY0NTExMDAsImF6cCI6InNER0NEY0xjOUt5ZUpYSlJMbnUzT2lyajg2OG56bkNuIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCJ9.X5oC1AFLeULevB5NjfFK30RWeF2Wrbenwqtqo6zToz5z_CXVhaF2ZqWUSm74eymLPm7Z6sRwEnE3S2WMZAguA_wNoQi3Mfro6_potjuIayPYxPMHRGY8dQuO2EMS3LII1I3pp8_DNFNTavNOSnM2vwnGaD8MFa9XxCwOBT4oWNRu-bx3Nd_VoZl3JPCbKKAhTs0EvjRScovnwUBHLvWNO8H_NEQTIEE4K9rOpUoG1xhi1obexqHDiU8XAFs_D0XOx0fhBik0h2F8of9WIcBgVOIxnPJgFkMA9ZEgf8mooydzxquVrRUH4-xfaaNZ6Vp7zHbmLzpZzYtdBySc7hF4mw&scope=openid%20profile%20email&expires_in=7200&token_type=Bearer&state=g00wyvls~LnXRk4sHoN6No6e7VTHIr_T
	//example error response: http://localhost:8080/social_login_redir#error=access_denied&error_description=User%20did%20not%20authorize%20the%20request&state=kBipuui.TeS9p36SOcSol7d-k1MOXMrv

        //helper function
        function setUserData() {
        //TODO: for non-social logins - userService is handling this - not a current issue b/c there is no data for these right after reg, but needs to be consistent!
            authService.setUserCUGDetails();
            authService.setUserLocation();
            authService.setUserPreferences();
            authService.setUserBio();
            authService.setUserBookings();
            authService.setUserFavorites();
            authService.setUserReviews();
            authService.setSentryUserContext();
            authService.setSessionStackUserContext();

          //was a noop copied from register controller: vm.syncProfile();
        }


        function goToPreLoginState(res) {

            //NO EMAIL?  DO NOT PROCEED!
            if ($rootScope.promptForEmail()) {
                $state.go('missing_email_address');
                return;
            }
            
            //return to where user started
            redirectionService.afterLoginSuccess();

            //launch rest of registration modals
            //vm.socialRegisterCB();

            vm.setUserData();

            if (vm.isReg) {
                var userEmail = localStorageService.getUserProfile().email;
                vm.partnerCheckAndEnroll(userEmail);
            }
        }
        function callAuthParseHash() {
            var nonce = localStorageService.getNonce();
            //angularAuth0.popup.callback({
            angularAuth0.parseHash({
                state: vm.state,
                nonce: nonce,
            }, goToPreLoginState);
        }
        function init() {

            //meta tags
            $rootScope.metaTagService.setup({
                googleBotIndex: 'noindex'
            });

            //we're in a modal, so remove the header and footer
            //$rootScope.isVanilla = true;
            //check state (xsrf mitigation)
            var state = localStorageService.getAuthState();
//TODO: var decodedState = base64.toByteArray(state);
            if (state !== vm.state) {
                vm.error = 'auth state does not match - potential xsrf attack in progress.  If you believe you have reached this message in error, please contact us.';
                vm.callAuthParseHash();
                vm.inProgress = false;
                return;
            }

        	//errors from auth0
        	if (vm.error && vm.error!=='') {
                vm.callAuthParseHash();
                vm.inProgress = false;
			    return;
        	}
            

        	//get and persist userinfo and self-close
            $.ajax({
                cache: false,
                url: 'https://'+vm.env.auth0_spa_domain+'/userinfo',
                headers: { "Authorization": "Bearer " + vm.access_token },
                success: function(user) {
                	localStorageService.clearUserData();
                    localStorageService.setIdToken(vm.id_token);
                    localStorageService.setAccessToken(vm.access_token);

		            localStorageService.setUserProfile(user);
		            localStorageService.setAuthenticationState(true);
                    localStorageService.resetSetupTimestamp();
                    localStorageService.resetRootScope();

                    vm.error = undefined;

                    vm.callAuthParseHash();

                    dataLayerService.updateGALoginSuccess();

                    vm.inProgress = false;
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    vm.error = textStatus;
                    vm.errorDescription = errorThrown;

                    vm.callAuthParseHash();

                    dataLayerService.updateGALoginFailure();

                    vm.inProgress = false;
                }
            });
        }       

		function getAccessToken() {
		  return utilities.getParameterByName('access_token');
		}

		function getIdToken() {
		  return utilities.getParameterByName('id_token');
		}

		function getError() {
		  return utilities.getParameterByName('error');
		}

		function getErrorDescription() {
		  return utilities.getParameterByName('error_description');
		}

        function getState() {
          return utilities.getParameterByName('state');
        }

        function getIsReg() {
            //var sParam = utilities.getParameterByName('s');
            var sParam = $document[0].location.search;
            return (sParam === '?s=r');
        }

        function socialRegisterCB() {
            /*
            return function(err, payload) {
                if (err) {
                    //-- FB ERRORS --//
                    if (err.code) {
                        console.log('code: '+err.code);
                    }
                    if (err.description) {
                        console.log('description: '+err.description);
                    }
                    if (err.original) {
                        console.log('original: '+err.original);
                    }
                    
                    //vm.closeModal();
                    return;
                }

                localStorageService.resetRootScope(true);

                vm.setUserData();

                //vm.closeModal();

                var userEmail = localStorageService.getUserProfile().email;
                vm.partnerCheckAndEnroll(userEmail);
            };
            */
        }

        //-- copied from register controller
        function partnerCheckAndEnroll(userEmail) {
            if (!$rootScope.fromPartner || !$rootScope.fromPartner.email || !$rootScope.fromPartner.partnerId || userEmail !== $rootScope.fromPartner.email) {
              travelersClubModalService();
              return;
            }

            //handle if from partner
            var successFunc = function(result) {

              //handle successful auto enroll
              if (!result.data.errors) {
                $state.go('start');   //TODO: consider a more customized welcome page
                return;
              }

              //invalid partner id, email does not match, or auto enroll failed --> continue with default register process
              travelersClubModalService();
              return;
            };

            var errFunc = function(errObj) {
              console.log(errObj);

              //continue with default register process
              travelersClubModalService();
              return;
            };

            dataFactory.checkAndEnroll($rootScope.fromPartner).then(successFunc, errFunc);
        }
    };

    socialLoginRedirController.$inject = ['$rootScope','$stateParams','$state','$document','localStorageService','angularAuth0','utilities','dataFactory','AUTH_EVENTS','environmentService','redirectionService','travelersClubModalService','authService','dataLayerService'];
    app.controller('socialLoginRedirController', socialLoginRedirController);
};
