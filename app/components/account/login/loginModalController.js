module.exports = function(app) {
    require("./login.less"); 
    var loginModalController = function ($rootScope,$scope,$state,authService,AUTH_EVENTS,localStorageService,jwtHelper,$window,$stateParams,guid,joinModalService,resetPassModalService,$location,dataFactory,redirectionService,environmentService, syncService, currentlyLoggedInModalService, text, dataLayerService) { //$raven
		var vm = this;

        vm.env = environmentService();
        vm.text = text;

        vm.init = init;
        vm.userConnectedToFB = false;
        
        vm.isButtonDisable=false;
        
        vm.username = '';
        vm.password = '';
        vm.rememberMe = false;
		vm.login = login;
        vm.errs = [];
        vm.embedded = $scope.embedded || false;
        vm.redirect = undefined;
        vm.isUserLoggedIntoFacebook = false;
        vm.showEmailNotExist = false;

        vm.loginSuccess = loginSuccess;
        vm.loginFailure = loginFailure;
        vm.IsEmbedded = IsEmbedded;
        vm.IsUserAuthenticated = IsUserAuthenticated;
        vm.localPersistUserInfo = localPersistUserInfo;

        vm.setUserData = setUserData;

        //social login
        vm.socialLoginCB = socialLoginCB;
        vm.loginFacebook = loginFacebook;
        vm.loginGoogle = loginGoogle;

        //-- navigation
        vm.closeModal = closeModal;
        vm.goToSignUp = goToSignUp;
        vm.goToResetPassword = goToResetPassword;

        vm.init();

        function init() {

            //already logged in?
            if (localStorageService.getAuthenticationState()) {

                //need to wait until login modal is up before closing it
                setTimeout(function () {
                    vm.closeModal();
                }, 100);

                currentlyLoggedInModalService();

                return;
            }

            //TODO: do we need this?
            //determine if user is connected to FB
            authService.isUserConnectedToFB(function(isUserConnected) {
                 vm.isUserLoggedIntoFacebook = isUserConnected;
            });

            // ezfb.getLoginStatus(function (res) {
            //     $scope.loginStatus = res;
            //     //(more || angular.noop)();

            //     ezfb.api('/me', function (res) {
            //         $scope.apiMe = res;
            //     });
            // });

            /** 
            * Origin: FB.api
            */


            // $scope.$on('fbLoginCB', function(args) {
            //     FB.getLoginStatus(function(response) {
            //       authService.statusChangeCallback(response);
            //     });
            //     //vm.FBLogin();
            //     //authService.checkLoginStatusFB();
            // });

            // var _self = this;
          // FB.Event.subscribe('auth.statusChange', function(res) {
          //    if (res.status === 'connected') {
          //       console.log('user LOGGED in');

          //     //     /*
          //     //      The user is already logged,
          //     //      is possible retrieve his personal info
          //     //     */
          //     //     _self.getUserInfo();

                  
          //     //      This is also the point where you should create a
          //     //      session for the current user.
          //     //      For this purpose you can use the data inside the
          //     //      res.authResponse object.
                  
          //     }
          //     else {
          //     //     /*
          //     //      The user is not logged to the app, or into Facebook:
          //     //      destroy the session on the server.
          //     //     */
          //     console.log('user not logged in');
          //       }
          //     });
            
        }
               


        //--- LOGIN :: EMAIL --//
        function login(){

            //reset errors
            vm.errs = [];
            vm.showEmailNotExist = false;
            vm.isButtonDisable=true;

            //check username
            if (vm.username==='') {
                vm.errs.push('Please specify a username');
            }

            //check password
            if (vm.password==='') {
                vm.errs.push('Please specify a password');
            }

            //stop here if there is a problem
            if (vm.errs.length>0)
            {
                vm.isButtonDisable=false;
                return;
            }
             

            //email exist?
            var thenFunc = function(result) {
                
                //email does not exist
                if (result.data.data === false) {
                    vm.showEmailNotExist = true;
                    vm.isButtonDisable=false;
                    return;
                }

                //define state (to mitigate CSRF attachks, make sure the response belongs to request initiated by the same user
                var state = guid.get();
                //localStorageService.setAuthState(state);

                dataLayerService.userLoginSubmit('email');

                authService.login(vm.username,vm.password, function(err, authResult) {
                    if (err) {
                        vm.isButtonDisable=false;
                        vm.loginFailure(err);
                    }
                    else
                        vm.loginSuccess(authResult);
                });
            };
            dataFactory.isUserExist(vm.username).then(thenFunc,thenFunc);
        }

        // email login :: success
        function loginSuccess(authResult) {

            //decode
            var tokenPayload = jwtHelper.decodeToken(authResult.idToken);

            //TODO: verify signature

            //validate claims
            //-- token expiration
            var isTokenExpired = jwtHelper.isTokenExpired(authResult.idToken);
            if (isTokenExpired) {
                console.log('token expired on: ' + jwtHelper.getTokenExpirationDate(authResult.idToken));
                //user must sign in again
                $state.go('signin');
                return;
            }

            //-- token issuer
            if (tokenPayload.iss !== 'https://'+vm.env.auth0_spa_domain+'/') {
                $state.go('hmmmController',{ message: 'hacking our site is not cool. We\'ve recorded your IP and will disable your permissions should you try this again.' });
                return;
            }

            //-- token audience
            if (tokenPayload.aud !== vm.env.auth0_spa_clientId) {
                $state.go('hmmmController',{ message: 'invalid client id'});
                return;
            }

            //reset
            //localStorageService.clearUserData();

            //persist id token for user profile information
            localStorageService.setIdToken(authResult.idToken);

            //persist access token for subsequent API calls
            localStorageService.setAccessToken(authResult.accessToken);
            
            //do we need a nonce?
            //var nonce = localStorageService.getNonce();
            //console.log(nonce);

            var accessToken = localStorageService.getAccessToken();
            authService.getLoggedinUserInfo(accessToken, vm.localPersistUserInfo);

            //close (if modal)
            if ($scope.$close) {
                $scope.$close(authResult);
            }
        }

        //TODO: combnine this with logic in success of socialloginredir controller
        function localPersistUserInfo(unsure, user) {

            //$rootScope.userRoles = USER_ROLES;    //We're using angular's run function, which does not have access to MainController, so currentUser has to be in $rootScope

            //setup local storage
            localStorageService.setUserProfile(user);   //$rootScope.currentUser = user;
            localStorageService.setAuthenticationState(true);   //$rootScope.isAuthenticated = true;
            localStorageService.resetSetupTimestamp();
            localStorageService.resetRootScope();

            dataLayerService.updateGALoginSuccess();

            //TODO: be specific about events - ie should this go after local storage is updated?
            //TODO: does not appear to be in use!
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

            vm.setUserData();

            //gtag
            // gtag('config', 'GA_TRACKING_ID', {
            //   'user_id': 'USER_ID'
            // });

            //redirect user
            redirectionService.afterLoginSuccess(false);
        }

        // email login :: failure
        function loginFailure(err) {
            vm.errs.push(err.description);
            $scope.$apply();
            //$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            dataLayerService.updateGALoginFailure('email');
        }




        //-- LOGIN :: SOCIAL  --//
        //callback after social login is complete
        //4/30 - this no longer appears to be called?!?
        function socialLoginCB() {
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
                    
                    vm.closeModal();
                    return;
                }

                localStorageService.resetRootScope(true);
                
                vm.setUserData();

                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

                vm.closeModal();
                redirectionService.afterLoginSuccess(true);
            };
        }

        function loginFacebook() {
            dataLayerService.userLoginSubmit('facebook');
            authService.login_fb(vm.socialLoginCB());
        }
        
        function loginGoogle() {
            dataLayerService.userLoginSubmit('google');
            authService.login_google(vm.socialLoginCB());
        }



        //-- HELPER FUNCTIONS --//
        function setUserData() {
            authService.setUserCUGDetails();
            authService.setUserLocation();
            authService.setUserPreferences();
            authService.setUserBio();
            authService.setUserBookings();
            authService.setUserFavorites();
            authService.setUserReviews();
            authService.setSentryUserContext();
            authService.setSessionStackUserContext();

            //syncService.upsertCustomer();
        }

        function closeModal() {
            if ($scope.$close) {
                $scope.$close();
            }
        }

        function goToSignUp() {
            var params = {
                text: text
            };
            joinModalService(params);
            vm.closeModal();
        }

        function goToResetPassword() {
            resetPassModalService();
            vm.closeModal();
        }

        function IsUserAuthenticated() {
            return localStorageService.isAuthenticated || false;
        }

        function IsEmbedded() {
            return vm.embedded; 
        }




        //-- DEPRECATE???--//
        vm.FBLogin = FBLogin;
        function FBLogin() {
            console.warn('obsolete call from FBLOGIN()');

            // var successFunc = function() {
            //     //vm.redir();   if we still need, call redirectionService.afterLoginSuccess(true);
            // };

            // var errFunc = function() {
            //     $state.go('signin');
            // };

            // vm.loginFacebook();

            //authService.login_fb(successFunc,errFunc);
        }

        //not clear that we need this functionality:
        // vm.logoutFB = logoutFB;
        // function logoutFB() {
        //     FB.logout(function(response) {
        //        console.log('person now logged out of FB');
        //     });
        // }


        //-- easy fb implementation --
        // ezfb.getLoginStatus(function (res) {
        //     $scope.loginStatus = res;

        //     //(more || angular.noop)();
        // });

        // ezfb.api('/me', function (res) {
        //     $scope.apiMe = res;
        // });

        // function updateLoginStatus (more) {
        //     ezfb.getLoginStatus(function (res) {
        //       $scope.loginStatus = res;

        //       (more || angular.noop)();
        //     });
        // }

        // function updateApiMe () {
        //     ezfb.api('/me', function (res) {
        //       $scope.apiMe = res;
        //     });
        // }

        // updateLoginStatus(updateApiMe);

        // $scope.login = function () {
        //     /**
        //      * Calling FB.login with required permissions specified
        //      * https://developers.facebook.com/docs/reference/javascript/FB.login/v2.0
        //      */
        //     ezfb.login(function (res) {
        //       /**
        //        * no manual $scope.$apply, I got that handled
        //        */
        //       if (res.authResponse) {
        //         updateLoginStatus(updateApiMe);
        //       }
        //     }, {scope: 'email'});
        // };

    };

    loginModalController.$inject = ['$rootScope','$scope','$state','authService','AUTH_EVENTS','localStorageService','jwtHelper','$window','$stateParams','guid','joinModalService','resetPassModalService','$location','dataFactory','redirectionService','environmentService','syncService','currentlyLoggedInModalService', 'text', 'dataLayerService'];  //$raven
    app.controller('loginModalController', loginModalController);
};
