module.exports = function(mod){
    var authService = function ($q, $state, authManager,$location,$window,angularAuth0,localStorageService, guid,$rootScope,AUTH_EVENTS,dataFactory,environmentService) {
    	var vm = this;
    	vm.env = environmentService();

    	vm.options = {};
    	//vm.setupOptions = setupOptions;
    	vm.init = init;
    	//vm.getOptions = getOptions;

    	//-- angularAuth0 interface
		vm.register = register;
    	vm.login = login;
		vm.get_avatar_from_service = get_avatar_from_service;
    	//vm.logout = logout;
		vm.changePassword = changePassword;

		//-- user profile (?)
    	var userProfile = localStorageService.getUserProfile() || null;	// JSON.parse(localStorage.getItem('profile')) || null;
		var deferredProfile = $q.defer();

	    if (userProfile) {
	      deferredProfile.resolve(userProfile);
	    }

      	//vm.image_logoSM = require("../../resources/img/common/logos/transparent_wide.png");   //logo_sm.jpg");

    	vm.init();

		function init() {
			//vm.setupOptions(true,true);
		}

		function register(username, password, firstName, lastName, cb) {
			//Popup.prototype.signupAndLogin

			//LEFT OFF HERE - something is causing us not to get the correct ACCESS TOKEN after regisistration
			//so we cannot pass AUTHENTICATION BEARER
			angularAuth0.signupAndAuthorize({
				email: username,
				password: password,
				connection: 'Username-Password-Authentication',
				user_metadata: { 'given_name': firstName, 'family_name': lastName },
				audience: vm.env.auth0_spa_audience,
				responseType: 'token id_token',
				scope: 'openid profile email',
			}, cb);
		}




	  	// function getOptions() {
	  	// 	return vm.options;
	  	// }

	  	function registerAuthenticationListener(auth0lock) {

	  	}

	  	function resolveProfile(profile) {
	  		deferredProfile.resolve(profile);
	  	}

	  	//-- LOGIN --//
	  	function login(username,password, cb) {
	  		angularAuth0.client.login({
	        	realm: 'Username-Password-Authentication',
				username: username,
				password: password,
				audience: vm.env.auth0_spa_audience,
				scope: 'openid profile email',
				//responseType: 'id_token token',
				//todo: state
				//todo: nonce
				//connection: 'Username-Password-Authentication'
			}, cb);
	    }

	    function getLoggedinUserInfo(accessToken,cb) {
	    	angularAuth0.client.userInfo(accessToken,cb);
	    }

		var base64 = require('base64-js');

        /*	to mitigate CSRF attachks, define state here and in socialLoginRedirController
        	make sure the response belongs to the request */
        function setupAuthState() {
            var state = guid.get();
//TODO: var stateEncoded = base64.fromByteArray(state);
            localStorageService.setAuthState(state);
            return state;
        }

		/*	auth0 SOCIAL LOGINS:
			client_id=
			https://ccessiblego.auth0.com/authorize?
			response_type=token&	//code for server, token for app side flows
			connection=facebook&	//google-oauth2 or facebook
			prompt=consent&
			redirect_uri=https://manage.auth0.com/tester/callback?connection=facebook&scope=openid%20profile
*/
	    function login_fb(isReg) {

	    	var state = setupAuthState();

	    	var nonce = guid.get();
    		localStorageService.setNonce(nonce);
    		
    		var redirectUri = vm.env.auth0_redir_base+'/social_login_redir'+(isReg===true?'?s=r':'?s=l');
            
	    	angularAuth0.authorize({
				audience: vm.env.auth0_spa_audience,
				connection: 'facebook',
				responseType: 'token code id_token', //code for server, token for app side flows
				redirectUri: redirectUri,
				//redirectUri: 'https://manage.auth0.com/tester/callback?connection=facebook&scope=openid%20profile',
				state: state,
				nonce: nonce,
			  	scope: 'openid name email picture profile edit:favorite'
			  	//consent can't be skipped on localhost!!! 
			  	//prompt: 'none'	//forRegistration===true?'consent':'none'
			});

	    	//$window.location.url = url;
	    }

	    function login_google(isReg) {

	    	var state = setupAuthState();

	    	var nonce = guid.get();
    		localStorageService.setNonce(nonce);

			var redirectUri = vm.env.auth0_redir_base+'/social_login_redir'+(isReg===true?'?s=r':'?s=l');

	    	angularAuth0.authorize({
				audience: vm.env.auth0_spa_audience,
				connection: 'google-oauth2',
				responseType: 'token code id_token', //code for server, token for app side flows
				redirectUri: redirectUri,
				//redirectUri: 'https://manage.auth0.com/tester/callback?connection=facebook&scope=openid%20profile',
				state: state,
				nonce: nonce,
			  	scope: 'openid name email picture profile edit:favorite'
			  	//prompt: 'consent'
			});
	    }

	    function reauthorize(cb) {
	    	var state = setupAuthState();

	    	var nonce = guid.get();
    		localStorageService.setNonce(nonce);

    		var redirectUri = vm.env.auth0_redir_base+'/social_login_redir?s=l';

	    	var options = {
				audience: vm.env.auth0_spa_audience,
				responseType: 'token code id_token', //code for server, token for app side flows
				redirectUri: redirectUri,
				state: state,
				nonce: nonce,
				scope: 'openid name email picture profile edit:favorite',
				domain: vm.env.auth0_spa_domain,
				timeout: 10000,		//milliseconds used to timeout when the `/authorize` call is failing as part of the silent authentication with postmessage enabled due to a configuration.
	    	};
	    	angularAuth0.checkSession(options, cb);
	    }

	    function setSession(authResult) {
		  // Set the time that the Access Token will expire at
		  var expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());

		  localStorageService.setAccessToken(authResult.accessToken);
		  localStorageService.setIdToken(authResult.idToken);
		  localStorageService.setExpiresAt(expiresAt);
		}

		function changePassword(username, cb) {
			angularAuth0.changePassword({
				email: username,
				connection: 'Username-Password-Authentication'
			}, cb);
		}


	    function login_fbDirect(successFunc,errFunc) {
            var nonce = guid.get();

            FB.login(function(response) {
              if (response.status === 'connected') {

             	localStorageService.setAccessToken(response.authResponse.accessToken);
             	//userid

                FB.api('/me', function(response) {
                  	console.log('Successful login for: ' + response.name);
             		
             		localStorageService.setUserProfile(response);
             		localStorageService.setAuthConnection('FB');
             		localStorageService.setAuthenticationState(true);

                 	successFunc();
                });

              } else {
                console.log('The person is not logged into this app or we are unable to tell.');
                errFunc();
              }
            },
            {
                auth_type: 'https', //optionally include ,reauthenticate
                auth_nonce: nonce 
            });
	    }


	    //-- SIGN USER OUT --//
	    // function logout() {
	    // 	$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
	    // 	$state.go('signout');
	    //  	//authManager.unauthenticate();
	    // }
	    function logoutFB() {
	    	FB.logout(function(response) {
	    		console.log('logging out of FB');
			   // Person is now logged out
			});
	    }

	    //-- FACEBOOK: CB when user clicks on "Log in with Facebook" --//
	    function statusChangeCallback(authResponse) {
	    	//if (!FB) return;
			// if (localStorageService.getAuthConnection() === 'FB') {
			//     	localStorageService.clearUserData();
			//     }
	    	
	    }

	    //-- FACEBOOK: is user connected (logged into FB && accessiblego), not_authorized (logged into FB, not accessiblego), or unknown (not logged into FB, ? accessiblego)
	    //*** keep this around so we can do a check, even though we are not using the FB login methods
	    function isUserConnectedToFB(cb) {
	    	if (typeof(FB) === "undefined") return;	

	    	FB.getLoginStatus(function(response) {
			    if (response.status === 'connected') {
			    	cb(true);
			    	return;
			    }
			    cb(false);
	        });
	    }

		function getProfileDeferred() {
	      return deferredProfile.promise;
	    }

		//get FB user's personal info
		function getUserInfo() {

		  var _self = this;

		  FB.api('/me', function(res) {
		    $rootScope.$apply(function() {
		      $rootScope.user = _self.user = res;
		    });
		  });

		}

		//-- helper methods
		function get_avatar_from_service(service, userid, size) {
		    // this return the url that redirects to the according user image/avatar/profile picture
		    // implemented services: google profiles, facebook, gravatar, twitter, tumblr, default fallback
		    // for google   use get_avatar_from_service('google', profile-name or user-id , size-in-px )
		    // for facebook use get_avatar_from_service('facebook', vanity url or user-id , size-in-px or size-as-word )
		    // for gravatar use get_avatar_from_service('gravatar', md5 hash email@adress, size-in-px )
		    // for twitter  use get_avatar_from_service('twitter', username, size-in-px or size-as-word )
		    // for tumblr   use get_avatar_from_service('tumblr', blog-url, size-in-px )
		    // everything else will go to the fallback
		    // google and gravatar scale the avatar to any site, others will guided to the next best version
		    var url = '';
		    var sizeparam = '';

		    switch (service) {

			    case "google":
			        // see http://googlesystem.blogspot.com/2011/03/unedited-google-profile-pictures.html (couldn't find a better link)
			        // available sizes: all, google rescales for you
			        url = "http://profiles.google.com/s2/photos/profile/" + userid + "?sz=" + size;
			        break;

		    	case "facebook":
		        // see https://developers.facebook.com/docs/reference/api/
		        // available sizes: square (50x50), small (50xH) , normal (100xH), large (200xH)
		        sizeparam = '';
		        if (isNumber(size)) {
		            if (size >= 200) {
		                sizeparam = 'large';
		            }
		            if (size >= 100 && size < 200) {
		                sizeparam = 'normal';
		            }
		            if (size >= 50 && size < 100) {
		                sizeparam = 'small';
		            }
		            if (size < 50) {
		                sizeparam = 'square';
		            }
		        } else {
		            sizeparam = size;
		        }
		        url = "https://graph.facebook.com/" + userid + "/picture?type=" + sizeparam;
		        break;

		    	case "gravatar":
		        // see http://en.gravatar.com/site/implement/images/
		        // available sizes: all, gravatar rescales for you
		        url = "http://www.gravatar.com/avatar/" + userid + "?s=" + size;
		        break;

		    	case "twitter":
		        // see https://dev.twitter.com/docs/api/1/get/users/profile_image/%3Ascreen_name
		        // available sizes: bigger (73x73), normal (48x48), mini (24x24), no param will give you full size
		        sizeparam = '';
		        if (isNumber(size)) {
		            if (size >= 73) {
		                sizeparam = 'bigger';
		            }
		            if (size >= 48 && size < 73) {
		                sizeparam = 'normal';
		            }
		            if (size < 48) {
		                sizeparam = 'mini';
		            }
		        } else {
		            sizeparam = size;
		        }

		        url = "http://api.twitter.com/1/users/profile_image?screen_name=" + userid + "&size=" + sizeparam;
		        break;

		    	case "tumblr":
		        // see http://www.tumblr.com/docs/en/api/v2#blog-avatar
		        //TODO do something smarter with the ranges
		        // available sizes: 16, 24, 30, 40, 48, 64, 96, 128, 512
		        sizeparam = '';
		        if (size >= 512) {
		            sizeparam = 512;
		        }
		        if (size >= 128 && size < 512) {
		            sizeparam = 128;
		        }
		        if (size >= 96 && size < 128) {
		            sizeparam = 96;
		        }
		        if (size >= 64 && size < 96) {
		            sizeparam = 64;
		        }
		        if (size >= 48 && size < 64) {
		            sizeparam = 48;
		        }
		        if (size >= 40 && size < 48) {
		            sizeparam = 40;
		        }
		        if (size >= 30 && size < 40) {
		            sizeparam = 30;
		        }
		        if (size >= 24 && size < 30) {
		            sizeparam = 24;
		        }
		        if (size < 24) {
		            sizeparam = 16;
		        }

		        url = "http://api.tumblr.com/v2/blog/" + userid + "/avatar/" + sizeparam;
		        break;

		    	default:
		        // http://www.iconfinder.com/icondetails/23741/128/avatar_devil_evil_green_monster_vampire_icon
		        // find your own
		        url = "http://www.gravatar.com/avatar/?d=identicon"; // 48x48
		    }
	    	return url;
		}
		function isNumber(n) {
			// see http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
    		return !isNaN(parseFloat(n)) && isFinite(n);
		}

		// function setupOptions(showLoginIn,showSignUp) {
  //   		vm.options = {
  //               //container: 'authroot',
		// 		//_idTokenVerification: true,	//not sure if we need this, does it default to true?
		// 		allowLogin: showLoginIn,
		// 		allowForgotPassword: true,
		// 		allowSignUp: showSignUp,	//to fully prevent new users from signing up, you must use the Disable Sign Ups option in the dashboard, in the connection settings
		// 		loginAfterSignUp: true,
		// 		auth: {
		// 			redirectUrl: $location.protocol() + '://' + $location.host() + ':' + $location.port() + '/sl',	//http://localhost:9090/sl',
		// 			responseType: 'token',	//spa should be token
		// 			redirect: true,	//popup mode is buggy, avoid for now
		// 			sso: false,	//should be true for multifactor authenticaton to work correctly
		// 			params: {
		// 				scope: 'openid name email picture profile' // Learn about scopes: https://auth0.com/docs/scopes
		// 			},
		// 			//tbd - see connectionscopes under https://auth0.com/docs/libraries/lock/v10/customization
		// 			// connectionScopes: {
		// 			//    	'facebook': ['scope1', 'scope2']
		// 			//    }
		// 		},
		// 		usernameStyle: 'email',
		// 		avatar: null
		// 	};
  // 		}

  		//-- helpers for setting local storage --//
        function setUserCUGDetails() {
            var successCB = function(cugDetails) {
                if (cugDetails.data.status === 'success') {
                    localStorageService.setUserCUGDetails(cugDetails.data.data);
                    return;
                }
                //ok (user doesn't yet have cug details)
            };
            var errorCB = function(errObj) {
                console.log(errObj);
            };
            dataFactory.getCustomerCugDetails().then(successCB,errorCB);
        }

        function setUserLocation() {
            var successCB = function(response) {
                if (response.data.status === 'success') {
                    localStorageService.setUserLocation(response.data.data);
                    return;
                }
                //ok (user doesn't yet have location)
            };
            var errorCB = function(errObj) {
                console.log(errObj);
            };
            dataFactory.getUserLocation().then(successCB,errorCB);
        }

        function setUserFavorites() {
        	var successCB = function(response) {
                if (response.data.status === 'success') {
                    localStorageService.setUserFavorites(response.data.data);
                    return;
                }
                //ok (user doesn't yet have favorites)
            };
            var errorCB = function(errObj) {
                console.log(errObj);
            };
            dataFactory.getUserFavorites().then(successCB,errorCB);
        }

        function setUserReviews() {
        	var successCB = function(response) {
                if (response.data.status === 'success') {
                    localStorageService.setUserReviews(response.data.data);
                    return;
                }
                //ok (user doesn't yet have reviews)
            };
            var errorCB = function(errObj) {
                console.log(errObj);
            };
            dataFactory.getUserReviews().then(successCB,errorCB);
        }

        function setUserPreferences() {
            var successCB = function(response) {
                if (response.data.status === 'success') {
                    localStorageService.setUserPreferences(response.data.data);
                    return;
                }
                //ok (user doesn't yet have preferences)
            };
            var errorCB = function(errObj) {
                console.log(errObj);
            };
            dataFactory.getUserPreferences().then(successCB,errorCB);
        }

        function setUserBio() {
            var successCB = function(response) {
                if (response.data.status === 'success') {
                    localStorageService.setUserBio(response.data.data);
                    return;
                }
                //ok (user doesn't yet have bio)
            };
            var errorCB = function(errObj) {
                console.log(errObj);
            };
            dataFactory.getUserBio().then(successCB,errorCB);
        }

        function setUserBookings() {
            var successCB = function(response) {
                if (response.data.status === 'success') {
                    localStorageService.setUserBookings(response.data.data);
                    return;
                }
                //ok (user doesn't yet have bookings)
            };
            var errorCB = function(errObj) {
                console.log(errObj);
            };
            dataFactory.getUserBookings().then(successCB,errorCB);
        }

		function setSentryUserContext() {
            if (vm.env.name !== 'staging' && vm.env.name !== 'production') return;

            var userProfile = localStorageService.getUserProfile();
            // $raven.setUserContext({
            //     id: userProfile.customerId,
            //     username: userProfile.email,
            //     email: userProfile.email,
            //     firstName: userProfile.given_name,
            //     lastName: userProfile.family_name
            // });
        }

        function setSessionStackUserContext() {
            if (vm.env.name !== 'production') return;

            var userProfile = localStorageService.getUserProfile();

            // var name = userProfile.given_name;
            // if (userProfile.family_name) {
            //     name+=' '+userProfile.family_name;
            // }

            //sessionstack
            angular.element(document).ready(function() {
	            $window.SessionStack.start({
	                sensitiveInputFields: false
	            });
	            $window.SessionStack.identify({
	                userId: userProfile.customerId,
	                //email: userProfile.email,
	                displayName: userProfile.given_name
	                //u can add custom fields
	            });
	        });
        }

		return {
			getProfileDeferred: getProfileDeferred,
			registerAuthenticationListener: registerAuthenticationListener,
			resolveProfile: resolveProfile,
			getLoggedinUserInfo: getLoggedinUserInfo,
			login: login,
			login_fb: login_fb,
			login_google: login_google,
			reauthorize: reauthorize,
			setSession: setSession,
			//logout: logout,
			logoutFB:logoutFB,
			statusChangeCallback:statusChangeCallback,
			isUserConnectedToFB: isUserConnectedToFB,
			register: register,
			changePassword: changePassword,
			getUserInfo: getUserInfo,
			get_avatar_from_service: get_avatar_from_service,

			setUserCUGDetails: setUserCUGDetails,
			setUserLocation: setUserLocation,
			setUserFavorites: setUserFavorites,
			setUserReviews: setUserReviews,
			setUserPreferences: setUserPreferences,
			setUserBio: setUserBio,
			setUserBookings: setUserBookings,
			setSentryUserContext: setSentryUserContext,
			setSessionStackUserContext: setSessionStackUserContext
	    };
    };

    authService.$inject = ['$q','$state','authManager','$location','$window','angularAuth0','localStorageService', 'guid','$rootScope','AUTH_EVENTS','dataFactory','environmentService'];
    mod.service('authService', authService);
};