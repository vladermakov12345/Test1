module.exports = function(app) {
    var travelersClubController = function ($rootScope,$scope,$state,authService,AUTH_EVENTS,localStorageService,jwtHelper,$window,$stateParams,guid,loginModalService,travelersClubModalService, dataFactory, dataLayerService,redirectionService) {
  		var vm = this;
      vm.init = init;
      vm.errs = [];

      vm.userProfile = localStorageService.getUserProfile();
      $scope.firstName = vm.userProfile.given_name;
      $scope.lastName = vm.userProfile.family_name;

      //-- view/process
      vm.showFirstChoice = false;//true;
      vm.showVerificationOptions = true;  //false;
      vm.showVerificationOptionParkingId = false;
      vm.showVerificationOptionOrgMember = false;
      vm.showApplicationReceived = false;


      //-- navigation
      vm.closeModal = closeModal;
      vm.redir = redir;
      vm.optionGetDiscounts = optionGetDiscounts;
      vm.optionMaybeLater = optionMaybeLater;
      vm.verifyByParkingPermit = verifyByParkingPermit;
      vm.verifyByOrganizationMembership = verifyByOrganizationMembership;

      //-- submission
      vm.permitTypes = [];
      vm.submitParkingId = submitParkingId;

      //-- cug organizations
      vm.getCugOrganizations = getCugOrganizations;
      vm.participating_organizations=[];


      //-- resources
      //vm.cugExample = require("../../../../resources/img/clubGO/cugExample.png");

      vm.signupEnjoyBannerMob = require("../../../../resources/img/cug/signup-enjoy-banner-mob.png");

      $scope.countries_data = [];
      //require("file-loader?name=comments.png!../../../../resources/img/join/comments.png");

      vm.init();

      function init() {
        //set permit types
        //vm.permitTypes.push({title:'', value: ''});
        vm.permitTypes.push({title:'Parking Permit Number', value: 'permit'});
        vm.permitTypes.push({title:'License Plate', value: 'plate'});
        //vm.permitTypePlaceholderText = 
        //vm.selectedPermitType.value?'Enter '+vm.selectedPermitType.title : ''

        //populate country/state dropdowns
        var getCountriesSuccessCB = function(response) {
            $scope.countries_data = response.data;
        };
        var getCountriesErrCB = function(errObj) {
        };
        dataFactory.getCountriesAndStates().then(getCountriesSuccessCB,getCountriesErrCB);

        vm.getCugOrganizations();
      }

      function getCugOrganizations() {
          var successFunc = function (result) {
              if (result.data.status === 'fail') {
                  return;
              }
              vm.participating_organizations=result.data.data;
          };

          var errorFunc = function (errObj) {
              console.log(errObj);
          };
          dataFactory.getParticipatingCUGOrganizations().then(successFunc, errorFunc);
      }

      //-- NAVIGATION --//
      function closeModal() {
          if ($scope.$close) {
              $scope.$close();
          }
      }

      function optionGetDiscounts() {
        vm.showFirstChoice = false;
        vm.showVerificationOptions = true;
        vm.showApplicationReceived = false;
      }

      function optionMaybeLater() {
        vm.closeModal();
        vm.redir();
      }

      function verifyByParkingPermit() {
        vm.showVerificationOptionParkingId = true;
        vm.showVerificationOptionOrgMember = false;
        dataLayerService.push('cug_verify', 'join_modal');
      }

      function verifyByOrganizationMembership() {
        vm.showVerificationOptionParkingId = false;
        vm.showVerificationOptionOrgMember = true;
        dataLayerService.push('cug_verify', 'join_modal');
      }

      //-- SUBMISSION --//
      function submitParkingId() {

        vm.errs = [];
        
        var successFunc = function(response) {

          if (response.data.status==='fail') {
            vm.errs = response.data.errors;
            return;
          }

          vm.showFirstChoice = false;
          vm.showVerificationOptions = false;
          vm.showApplicationReceived = true;

          vm.showVerificationOptionParkingId = false;
          vm.showVerificationOptionOrgMember = false;

          authService.setUserCUGDetails();

          dataFactory.updateActiveCampaign();

          dataLayerService.push('enroll_cug', 'join_modal');
        };

        var errFunc = function(errObj) {
          console.log('errors while submitting cug parking id (travelersClubController)');
          console.log(errObj);
        };

        var params = {
          customerId: localStorageService.getCustomerId(),
          permitType: (vm.selectedPermitType && vm.selectedPermitType.value!=='undefined'?vm.selectedPermitType.value:undefined),
          ownerType: (vm.ownerType?vm.ownerType:undefined),
          parkingPermitId: vm.parkingID,
          country: vm.country?vm.country.name:null,
          stateProv: vm.stateProv?vm.stateProv.name:null
        };
        dataFactory.submitCugParkingId(params).then(successFunc,errFunc);
      }

      vm.submitOrgMembership = submitOrgMembership;
      function submitOrgMembership() {

        $scope.submitOrgMembershipErrs = [];
        
        var successFunc = function(response) {

          if (response.data.status==='fail') {
            $scope.submitOrgMembershipErrs = response.data.errors;
            return;
          }

          vm.showFirstChoice = false;
          vm.showVerificationOptions = false;
          vm.showApplicationReceived = true;

          vm.showVerificationOptionParkingId = false;
          vm.showVerificationOptionOrgMember = false;

          authService.setUserCUGDetails();

          //active campaign
          dataFactory.updateActiveCampaign();

          dataLayerService.push('enroll_cug','join_modal');
        };

        var errFunc = function(errObj) {
          console.log('errors while submitting cug organization id');
          console.log(errObj);
        };

        var params = {
          customerId: localStorageService.getCustomerId(),
          cugOrganizationId: vm.cugOrganizationId?vm.cugOrganizationId.cugOrganizationId:'',
          firstName: $scope.firstName,
          lastName: $scope.lastName
        };
        dataFactory.submitCugOrganizationId(params).then(successFunc,errFunc);
      }

      //"return to what I was doing"
      function redir() {

        if (redirectionService.hasRedirPending()) {
            redirectionService.afterLoginSuccess();
            return;
        }


        var preloginstate = localStorageService.getPreLoginState();

        //TODO: create redirection service (this is copied in loginController)
          if ($stateParams.r) {
              var rep = $stateParams.r.replace('/','');
              $state.go(rep);
              return;
          }

        //if from home page, show welcome after registration
        if (preloginstate.path === 'home') {
            $state.go('start');
            return;
        }

          //TODO: do we still need this if we have getPreLoginState() below?
          if ($rootScope.state_redirect) {

              //TODO: create a redirection service (so we have a singleton managing this intead of on $rootScope)
              $state.go($rootScope.state_redirect.to, $rootScope.state_redirect.params);
              
              //state_redirect should only be used once!
              $rootScope.state_redirect = undefined;

              return;
          }

          if (preloginstate) {
              $state.go(preloginstate.path, preloginstate.params);
              return;
          }

          $state.go('start');
      }
      
    };

    travelersClubController.$inject = ['$rootScope','$scope','$state','authService','AUTH_EVENTS','localStorageService','jwtHelper','$window','$stateParams','guid','loginModalService','travelersClubModalService','dataFactory', 'dataLayerService','redirectionService'];
    app.controller('travelersClubController', travelersClubController);
};
