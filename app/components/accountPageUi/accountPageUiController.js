module.exports = function (app) {
    var accountPageUiController = function ($scope, $rootScope, $state, $stateParams, $interval, $filter, dataFactory, localStorageService, authService, userService, resetPassModalService, $document, $anchorScroll, $location, utilities, redirectionService, environmentService, clubgoService) {
        require("./accountPageUi.less");
        var vm = this;
        vm.env = environmentService();

        var sideMenuIsVisible = false;
        vm.verificationMode = verificationMode;
        vm.isDisableParking = false;
        vm.isMembershipOrg = false;
        vm.isScroll = false;
        vm.goToHotel = goToHotel;
        vm.userParkingPermitUploaded = false;

        vm.init = init;
        vm.userProfile = localStorageService.getUserProfile();
        $scope.firstName = vm.userProfile.given_name;
        $scope.lastName = vm.userProfile.family_name;

        vm.userService = userService;
        vm.requirements = {};
        $scope.countries_data = [];
        vm.generalSuccessCB = generalSuccessCB;

        //vm.userCUGProfile = localStorageService.getUserCUGDetails();
        vm.identityService = localStorageService.getIdentityService();

        vm.sideMenuClick = sideMenuClick;
        vm.changesMade = false;
        
        //permit type
        $scope.permitTypes = [];
        $scope.ownerTypes = [];
 
        //-- user's reviews
        vm.reviews = [];
        vm.loadUserReviews = loadUserReviews;
        vm.reviewsMode = '';

        //-- user favorites
        vm.favoritesMode = '';

        //-- clubgo
        vm.clubgoService = clubgoService;
        vm.getCugOrganizations = getCugOrganizations;
        vm.participating_organizations=[];
        vm.clubgo={};
        vm.getNextScreen = getNextScreen;
        vm.submitOrgMembership = submitOrgMembership;
        vm.submitPlate = submitPlate;
        vm.submitPermit = submitPermit;
        vm.postSuccessHelper = postSuccessHelper;
        vm.commonErrorFunc = commonErrorFunc;
        

        //vm.showApplicationReceived = false;

        vm.image_heart_grey = require("../../../resources/img/accountui/heart_grey.png");
        //vm.image_hotel = require("../../../resources/img/accountui/hotel.jpg");
        vm.image_attention = require("../../../resources/img/accountui/attention.png");
        vm.image_heart_red = require("../../../resources/img/accountui/heart-red.png");

        vm.image_attractions = require("../../../resources/img/planner/attractions.png");
        vm.image_caregivers = require("../../../resources/img/planner/caregivers.png");
        vm.image_transportation = require("../../../resources/img/planner/transportation.png");
        vm.image_tourCompanies = require("../../../resources/img/planner/tour_companies.png");
        vm.image_equipmentRental = require("../../../resources/img/planner/equipment_rental.png");

        vm.image_article = require("../../../resources/img/accountui/article.png");
        vm.image_arrow = require("../../../resources/img/accountui/arrow-right-white.png");
        vm.image_arrow_left = require("../../../resources/img/accountui/arrow-left-white.png");
        vm.image_check_black = require("../../../resources/img/accountui/check_black.png");
        vm.image_check_icon = require("../../../resources/img/accountui/check_icon.jpg");
        vm.image_loder = require("../../../resources/img/accountui/loder.jpg");

        vm.image_loder = require("../../../resources/img/accountui/loder.jpg");

        vm.getArray = getArray;

        //navigation
        //vm.redirectionService = redirectionService;
        vm.hasReturnRedirPending = false;


        function getArray(num) {
            if (!num) return new Array(0);
            return new Array(parseInt(num));
        }

        vm.init();

        vm.unlock_deals = require("../../../resources/img/accountui/unlock_deals.png");
        vm.enjoy_deals = require("../../../resources/img/accountui/enjoy_deals.png");
       
        function init() {
            sideMenuIsVisible = false;

            $scope.permitTypes.push({title:'Parking Permit Number', value: 'permit'});
            $scope.permitTypes.push({title:'License Plate', value: 'plate'});

            if (redirectionService.hasRedirPending()) {
                vm.hasReturnRedirPending = true;
            }

            //user profile
            var userid = localStorageService.getUserId();
            var userProfile = localStorageService.getUserProfile();

            //avatar
            vm.avatar = userProfile.picture;
            if (vm.identityService !== 'auth0') {
                vm.avatar = authService.get_avatar_from_service(vm.identityService, userid, 115);
            }

            //if userService.userBio.givenName & familyName is empty, populate with auth0 identity
            // if (userService.userBio.givenName === null) {
            //     var name = userService.getName();
            //     userService.userBio.givenName = name.first;
            //     userService.userBio.familyName = name.last;
            // }
            //vm.name = vm.userProfile.given_name +' '+ vm.userProfile.family_name;

            //don't show verification forms if user already has cug application
            $rootScope.$watch('userCUGDetails', function (newVal, oldVal) {
                //change to pull from service
                vm.userCUGProfile = localStorageService.getUserCUGDetails();
            });

            // if (vm.userCUGProfile) {
            //     vm.showApplicationReceived = true;
            // }

            //populate country/state dropdowns
            var getCountriesSuccessCB = function (response) {
                $scope.countries_data = response.data;
            };
            var getCountriesErrCB = function (errObj) {
            };
            dataFactory.getCountriesAndStates().then(getCountriesSuccessCB, getCountriesErrCB);

            //detect anchor hash
            // if (window.location.hash) {
            //     var hash = window.location.hash.substring(1);

            //detect tab to show
            if ($stateParams.t) {
                var tab = $stateParams.t;
                setTimeout(function () {
                    angular.element('#_' + tab).find('a').click();
                    $anchorScroll.yOffset = 150;
                    //vm.sideMenuClick();
                }, 200);
            }

            //detect if user parking permit has been uploaded
            //vm.clubgoService.setPhotoPersistence();

            //vm.bioText = vm.userService.getProfile().bio.bio;

            //-- reviews --//
            vm.loadUserReviews();

            //-- favorites --//
            vm.favorites = localStorageService.getUserFavorites();
            $rootScope.$on('userFavorites:updated', function (event, data) {
                vm.favorites = localStorageService.getUserFavorites();
            });

            //-- reviews --//
            vm.reviews = localStorageService.getUserReviews();
            $rootScope.$on('userReviews:updated', function (event, data) {
                vm.reviews = localStorageService.getUserReviews();
            });
          
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
    

         function loadUserReviews() {
        //     vm.reviews = [];
        //     var successFunc = function (response) {
        //         if (response.data.status === 'fail') {
        //             return;
        //         }

        //         vm.reviews = response.data.data;
        //     };

        //     var errFunc = function (errObj) {
        //         console.log('errors while retrieving user\'s reviews');
        //         console.log(errObj);
        //     };

        //     dataFactory.getUserReviews().then(successFunc, errFunc);
         }

        var count = 0;
        $(window).on('scroll', function () {
            var scrollposition = window.pageYOffset;
            var getValue = localStorage.getItem('setScroll');
            if (count == 0 && vm.isScroll) {
                $(window).scrollTop(getValue);
                // vm.isScroll = false;
                // localStorage.removeItem('setScroll');
                count++;
            }
            else {
                if (vm.isScroll) {
                    $(window).scrollTop(getValue);
                    vm.isScroll = false;
                    localStorage.removeItem('setScroll');
                }
            }
        });




        function verificationMode(mode, event) {
            if (mode == 'disabilityParkingPermit') {
                vm.isDisableParking = true;
                vm.isMembershipOrg = false;

            }
            else if (mode == 'organisationMembership') {
                vm.isDisableParking = false;
                vm.isMembershipOrg = true;
            }

            vm.isScroll = true;
            var scrollposition = window.pageYOffset;
            localStorage.setItem('setScroll', scrollposition);

        }

        function sideMenuClick() {
            return;
            // if (!sideMenuIsVisible) {
            //     sideMenuIsVisible = !sideMenuIsVisible;
            //     document.getElementById("sideBarUl").className = "side_nav";
            // }
            // else {
            //     document.getElementById("sideBarUl").className = "";
            //     sideMenuIsVisible = !sideMenuIsVisible;
            // }
        }

        // $scope.uploader.onAfterAddingFile = function (fileItem) {
        //     document.getElementById("uploaderFile").value = ""; // input file field
        // };

        // $scope.setPermitType = function(permitType) {
        //     $scope.selectedPermitType = permitType;
        // };
        // $scope.setOwnerType = function(ownerType) {
        //     $scope.selectedOwnerType = ownerType;
        // };


        //-- CLUB GO

        function commonErrorFunc(errObj) {
            //TODO: show user something!

            console.log('errors while submitting cug parking id (accountPageUiController): ' + errObj);
        }

        function submitOrgMembership() {

            //clear out errors
            vm.clubgoService.params.application.org.clearErrors();

            var successFunc = function (response) {
                if (response.data.status === 'fail') {
                    clubgoService.params.application.org.errors = response.data.errors;
                    return false;
                }
                vm.postSuccessHelper();
                return true;
            };

            vm.clubgoService.submitOrgMembership(successFunc,commonErrorFunc);
        }

        function submitPermit() {
            
            vm.clubgoService.params.application.permit.clearErrors();

            var successFunc = function (response) {
                if (response.data.status === 'fail') {
                    clubgoService.params.application.permit.errors = response.data.errors
                    return false;
                }
                vm.postSuccessHelper();
                return true;
            };

            vm.clubgoService.submitPermit(successFunc,commonErrorFunc);
        }

        function submitPlate() {
            
            vm.clubgoService.params.application.plate.clearErrors();

            var successFunc = function (response) {
                if (response.data.status === 'fail') {
                    clubgoService.params.application.plate.errors = response.data.errors
                    return false;
                }
                vm.postSuccessHelper();
                return true;
            };

            vm.clubgoService.submitPlate(successFunc,commonErrorFunc);
        }

        function postSuccessHelper() {
            authService.setUserCUGDetails();

            //todo: move this to server
            dataFactory.updateActiveCampaign();

            $anchorScroll();
        }







        //--- EDIT USER DATA ---//
        vm.mode = '';
        function generalSuccessCB(response) {
            vm.mode = '';
            vm.changesMade = true;
            setTimeout(function () {
                vm.changesMade = false;
                $scope.$apply();
            }, 5000);
        }

        //--- userName ---//
        vm.saveNameErrors = [];
        vm.editName = editName;
        vm.saveName = saveName;
        vm.cancelSaveName = cancelSaveName;

        function editName() {
            vm.mode = 'editName';
        }
        function saveName() {
            vm.saveBio();

            // vm.saveNameErrors = [];
            // userService
            // .saveName(vm.userService.userName.given_name, vm.userService.userBio.family_name)
            // .then(function(response) {
            //     vm.generalSuccessCB();
            // },
            // function(results) {
            //     vm.saveNameErrors = results.errors;
            // });
        }
        function cancelSaveName() {
            vm.mode = '';
        }

        //--- userLocation ---//
        vm.saveLocationErrors = [];
        vm.editLocation = editLocation;
        vm.saveLocation = saveLocation;
        vm.cancelSaveLocation = cancelSaveLocation;

        function editLocation() {
            vm.mode = 'editLocation';
        }
        function saveLocation() {
            vm.saveLocationErrors = [];

            var successCB = function (response) {
                if (response.data.status === 'fail') {
                    vm.saveLocationErrors = response.data.errors;
                    return;
                }

                vm.userService.userLocation = response.data;
                vm.generalSuccessCB();
            };

            var errorCB = function (results) {
                vm.saveLocationErrors = results.errors;
            };

            userService
                .saveLocation(userService.userLocation)
                .then(successCB, errorCB);
        }
        function cancelSaveLocation() {
            vm.mode = '';
        }

        //--- userPreferences ---//
        vm.savePreferenceErrors = [];
        vm.togglePreference = togglePreference;
        function togglePreference(category, type) {
            vm.savePreferenceErrors = [];

            var prefObj = { category: category, type: type };
            var key = category + '_' + type;

            //remove?
            if (userService.userPreferenceExists(key)) {
                userService
                    .removePreference(prefObj)
                    .then(function (response) {
                        vm.generalSuccessCB();
                        vm.userService = userService;
                    },
                    function (results) {
                        vm.savePreferenceErrors = results.errors;
                    });
                return;
            }

            //add
            userService
                .savePreference(prefObj)
                .then(function (response) {
                    vm.generalSuccessCB();
                    vm.userService = userService;
                },
                function (results) {
                    vm.savePreferenceErrors = results.errors;
                });
        }
        $scope.$on('userPreferences:updated', function (event, data) {
            vm.userService.userPreferences = data;
        });

        //-- TODO FAVORITES
        $scope.$on('userFavorites:updated', function (event, data) {
            //TODO: vm.userService.userPreferences = data;
        });

        //-- bio --//
        vm.saveBio = saveBio;
        function saveBio() {
            vm.saveBioErrors = [];

            var successCB = function (response) {
                if (response.data.status === 'fail') {
                    vm.saveBioErrors = response.data.errors;
                    return;
                }
                vm.userService.userBio = response.data;
                vm.mode = '';
            };

            var errCB = function (results) {
                vm.saveBioErrors = results.errors;
            };

            //hack for bio text
            userService.userBio.travelFrequency = vm.userService.getProfile().bio.travelFrequency;
            userService.userBio.gender = vm.userService.getProfile().bio.gender;
            userService.userBio.ageRange = vm.userService.getProfile().bio.ageRange;
            //userService.userBio.bio = vm.userService.getProfile().bio.bio;

            userService
                .saveBio(userService.userBio)
                .then(successCB, errCB);
        }
        $scope.$on('userBio:updated', function (event, data) {
            vm.userService.userBio = data;
        });

        //travel purpose
        vm.saveTravelPurpose = saveTravelPurpose;
        function saveTravelPurpose(purpose) {
            if (!vm.userService.userBio) {
                vm.userService.userBio = {};
            }
            vm.userService.userBio.travelPurpose = purpose;
            vm.saveBio();
        }

        //bio
        vm.editBio = editBio;
        function editBio() {
            vm.mode = 'editBio';
        }

        vm.cancelSaveBio = cancelSaveBio;
        function cancelSaveBio() {
            vm.mode = '';
        }


        //-- reset password --//
        vm.openResetPassModal = openResetPassModal;
        function openResetPassModal() {
            resetPassModalService();
        }

        //-- navigation --//
        function goToHotel(reservation) {
            var params = {
                hid: reservation.hotel.hotelid_ppnId,
                checkin: utilities.getUrlSafeDate(new Date(reservation.CheckinDate)),
                checkout: utilities.getUrlSafeDate(new Date(reservation.CheckoutDate)),
                rooms: reservation.Rooms,
                guests: reservation.Guests,
                destination: reservation.hotel.hotel_name
            };
            $state.go('hotel', params);
        }

        //-- reviews
        vm.getReviewType = getReviewType;
        function getReviewType() {
            if (vm.reviewsMode === 'hotel') return 'h';
            if (vm.reviewsMode === 'business') return 'd';
            return '';
        }

        vm.sortCreated = sortCreated;
        function sortCreated(favorite) {
            var date = new Date(favorite.created);
            return date;
        }


        //respond to clubgo service change in step
        $rootScope.$watch('vm.clubgoService.currentStep', function (newVal, oldVal) {
            //vm.clubgo.screen = newVal;
        });

        //TOODO: //deprecate
        function getNextScreen() {

            vm.clubgo.screen = vm.clubgoService.getNextStep();
            vm.clubgoService.resetStatus();

            return;


            //owner type?
            if (!vm.clubgoService.params.application.ownerType) {
               vm.clubgo.screen = 'screen_chooseOwnershipType';
               return;
            }

            //verification type?
            if (!vm.clubgoService.params.application.verificationType) {
               vm.clubgo.screen = 'screen_chooseVerificationType';
               return;
            }

            //
            if (vm.clubgoService.params.application.verificationType === 'permit' && (!vm.clubgoService.params.application.permit.number || !vm.clubgoService.params.application.permit.country)) {
                vm.clubgo.screen = 'screen_permit';
                return;
            }





            //path A :: no existing clubgo application

            // if (!vm.userCUGProfile) {
            //     if (vm.clubgo.application.verificationType) {
            //         switch (vm.clubgo.application.verificationType) {
            //             case 'specify_permit': vm.clubgo.application.screen = 'screen_permit'; return;
            //             case 'specify_license': vm.clubgo.application.screen = 'screen_license'; return;
            //             case 'specify_org': vm.clubgo.application.screen = 'screen_org'; return;
            //             case 'specify_other': vm.clubgo.application.screen = 'screen_other'; return;
            //         }
            //     }

            //     if (vm.clubgo.application.ownerType) {
            //        vm.clubgo.application.screen = 'chooseVerificationType' 
            //        return;
            //     }
            //     //default
            //     //if (!vm.userCUGProfile) {
            //         vm.clubgo.application.screen = 'init';
            //         return;
            //     //}
            // }

            //path B :: existing app, no photo
            //TODO:
        }

    };

    accountPageUiController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', '$interval', '$filter', 'dataFactory', 'localStorageService', 'authService', 'userService', 'resetPassModalService', '$document', '$anchorScroll', '$location', 'utilities', 'redirectionService', 'environmentService','clubgoService'];
    app.controller('accountPageUiController', accountPageUiController);
};
