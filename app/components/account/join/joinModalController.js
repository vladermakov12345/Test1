module.exports = function(app) {
    var joinModalController = function ($rootScope,$scope,$state,authService,AUTH_EVENTS,localStorageService,jwtHelper,$window,$stateParams,guid,loginModalService,travelersClubModalService,environmentService,syncService,dataFactory,utilities, text) {
  		var vm = this;
      vm.env = environmentService();
      vm.text = text;

      vm.errs = [];
      vm.firstName = '';
      vm.username = '';
      vm.password = '';
      vm.showNonSocialRegForm = false;
      vm.cbTermsOfUse = false;

        //--disable join button
        vm.isButtonDisable = false;

        vm.embedded = $scope.embedded || false;
        vm.IsEmbedded = IsEmbedded;

      //-- social registration
      //vm.socialRegisterCB = socialRegisterCB;
      vm.registerFacebook = registerFacebook;
      vm.registerGoogle = registerGoogle;
      //vm.setUserData = setUserData;

      //-- non-social registration
      vm.register = register;
      vm.registerFailure = registerFailure;
      vm.registerSuccess = registerSuccess;
      vm.fetchUserinfo = fetchUserinfo;
      vm.localPersistUserInfo = localPersistUserInfo;

      //common functions
      vm.partnerCheckAndEnroll = partnerCheckAndEnroll;

      //sync profile with azure
      vm.syncProfile = syncProfile;

      //-- navigation
      vm.closeModal = closeModal;
      //vm.redir = redir;
      vm.goToLogin = goToLogin;
      vm.openTravelersClubModalService = openTravelersClubModalService;

      vm.init = init;

      vm.init();

      function init() {

      }

//TODO: combine this with socialloginredir and localPersistUserInfo of logincontroller
//called after non-social login
      function localPersistUserInfo(user,b,c) {
            console.log(user);

            //broadcast event
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

            //set current user
            //$rootScope.setCurrentUser(user);
            //$rootScope.currentUser = { userId: user.data.userId, firstName: user.data.firstName, email: user.data.email};
            
            localStorageService.setUserProfile(user);   //$rootScope.currentUser = user;
            localStorageService.setAuthenticationState(true);   //$rootScope.isAuthenticated = true;
            localStorageService.resetSetupTimestamp();
            localStorageService.resetRootScope();

            authService.setSentryUserContext();
            authService.setSessionStackUserContext();

            vm.syncProfile();
            //$rootScope.userRoles = USER_ROLES;    //We're using angular's run function, which does not have access to MainController, so currentUser has to be in $rootScope

            //do something with session???
            //sessionService.create(res.data.id, res.data.user.id);

            //not sure if we need this b/c we are handling the setting of currentUser above
            //$rootScope.setCurrentUser = function (user) {
            //    $scope.currentUser = user;
            //};

            //accountService.setAuthentication(true);

            vm.partnerCheckAndEnroll(user.email);
            
            //vm.openTravelersClubModalService();
            //vm.redir();

            //$window.location.href = $stateParams.r;
        
        }

        //if not from partner, or email missing, or partnerid missing
            // proceed with default register process if
            // a. not from partner
            // b. email missing
            // c. partnerid missing
            // d. email from partner differs with email on account
        function partnerCheckAndEnroll(userEmail) {
            if (!$rootScope.fromPartner || !$rootScope.fromPartner.email || !$rootScope.fromPartner.partnerId || userEmail !== $rootScope.fromPartner.email) {
              vm.openTravelersClubModalService();
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
              vm.openTravelersClubModalService();
              return;
            };

            var errFunc = function(errObj) {
              console.log(errObj);

              //continue with default register process
              vm.openTravelersClubModalService();
              return;
            };

            dataFactory.checkAndEnroll($rootScope.fromPartner).then(successFunc, errFunc);
      }

      //-- NON-SOCIAL REGISTER
      function registerFailure(err) {
        if (err.code === 'invalid_password') {
          var m = utilities.replaceAll(err.policy,'*','<br />');
          vm.errs.push('Password is not strong enough - must be: <br />' + m);
          return;
        }

        if (err.code === 'user_exists' || err.code === 'username_exists') {
          vm.errs.push(err.description);
          return;
        }

        vm.errs.push(err.description);
        console.log(err);
      }

      function registerSuccess(authResult) {

        //decode
        var tokenPayload = jwtHelper.decodeToken(authResult.accessToken);

        //validate claims
        //-- token expiration
        var isTokenExpired = jwtHelper.isTokenExpired(authResult.accessToken);
        if (isTokenExpired) {
            console.log('token expired on: ' + jwtHelper.getTokenExpirationDate(authResult.accessToken));
            //user must sign in again
            $state.go('signin');
            return;
        }
        //-- token issuer
        if (tokenPayload.iss !== 'https://'+vm.env.auth0_spa_domain+'/') {
            $state.go('signin');
            return;
        }
        //-- token audience
        if (tokenPayload.aud.indexOf(vm.env.auth0_spa_audience) === -1) {
            $state.go('signin');
        }

        localStorageService.clearUserData();

        //persist id token for user profile information
        localStorageService.setIdToken(authResult.idToken);

        //persist access token for subsequent API calls
        localStorageService.setAccessToken(authResult.accessToken);
        
        
        
        //do we need a nonce?
        //var nonce = localStorageService.getNonce();
        //console.log(nonce);

        vm.fetchUserinfo();


        if ($scope.$close) {
            $scope.$close(authResult);
        }

        //-- is this already done?
        // $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        // $rootScope.currentUser = user.accessToken;
        // $rootScope.isAuthenticated = true;

//TODO: checkout WebAuth.prototype.validateToken in auth0.js
      }

      function fetchUserinfo() {
          $.ajax({
              cache: false,
              url: 'https://'+vm.env.auth0_spa_domain+'/userinfo',
              headers: { "Authorization": "Bearer " + localStorageService.getAccessToken() },
              success: vm.localPersistUserInfo
          });
      }

        function registerCallback(err, authResult) {
            if (err) {
                vm.isButtonDisable=false;
                vm.registerFailure(err);
                return;
          }

          vm.registerSuccess(authResult);
      }

  		function register() {
        
        //reset errors
        vm.errs = [];
            vm.isButtonDisable=true;

        //check name
        if (vm.firstName==='') {
            vm.errs.push('Please enter your first name');
        }
        // if (vm.firstAndLastName.split(' ').length<2) {
        //     vm.errs.push('Please enter your last name');
        // }

        //check username
        if (vm.username==='') {
            vm.errs.push('Please specify your email address');
        }

        //check password
        if (vm.password==='') {
            vm.errs.push('Please specify a password');
        }

        //check ToS/PP
        if (!vm.cbTermsOfUse) {
            vm.errs.push('Please read and agree to the terms of service');
        }

        //stop here if there is a problem
        if (vm.errs.length > 0)
        {
            vm.isButtonDisable=false;
            return;
        }
                

        //var firstName = vm.firstAndLastName.split(' ')[0];
        //var lastName = vm.firstAndLastName.split(' ')[1];
        authService.register(vm.username, vm.password, vm.firstName, '', registerCallback);
      }

      //-- SOCIAL REGISTER
      
      function registerFacebook() {
        //authService.login_fb(vm.socialRegisterCB(),true);
        authService.login_fb(true);
      }
      function registerGoogle() {
        //authService.login_google(vm.socialRegisterCB(),true);
        authService.login_google(true);
      }


      function syncProfile() {
        //syncService.upsertCustomer();
      }

      function IsEmbedded() {
          return vm.embedded; 
      }


      //-- NAVIGATION --//
      function closeModal() {
          if ($scope.$close) {
              $scope.$close();
          }
      }

      function goToLogin() {
          var params = {
              text: text
          };
          loginModalService(params);
          vm.closeModal();
      }

      function openTravelersClubModalService() {
        travelersClubModalService();
      }

      //is there a case for redirection?
      // function redir() {
      //   //TODO: create redirection service (this is copied in loginController)
      //     if ($stateParams.r) {
      //         var rep = $stateParams.r.replace('/','');
      //         $state.go(rep);
      //         return;
      //     }

      //     if ($rootScope.state_redirect) {

      //         //TODO: create a redirection service (so we have a singleton managing this intead of on $rootScope)
      //         $state.go($rootScope.state_redirect.to, $rootScope.state_redirect.params);
              
      //         //state_redirect should only be used once!
      //         $rootScope.state_redirect = undefined;

      //         return;
      //     }

      //     $state.go('start');
      // }
      
    };

    joinModalController.$inject = ['$rootScope','$scope','$state','authService','AUTH_EVENTS','localStorageService','jwtHelper','$window','$stateParams','guid','loginModalService','travelersClubModalService','environmentService','syncService','dataFactory','utilities', 'text'];
    app.controller('joinModalController', joinModalController);
};
