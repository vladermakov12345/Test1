/* jshint node: true */
'use strict';

require('./services/app.services.js');


//-- from vendors :: start
// require('jquery');
// require('jquery-ui');
// require('jquery-easing');
// require('angular');
// require('bootstrap/dist/css/bootstrap.min.css');
// require('bootstrap/dist/js/bootstrap.min.js');
// require("font-awesome-webpack!../node_modules/font-awesome-webpack/font-awesome.config.js");   //require('font-awesome-webpack');
// require('../resources/vendors/animate/js/animate.js');  //min?
// require('../resources/vendors/animate/css/animate.css');  //min?
// require('angular-ui-router');       //https://github.com/angular-ui/ui-router
// require('selection-model');         //https://www.npmjs.com/package/selection-model
// require('angular-ui-bootstrap');    //https://www.npmjs.com/package/angular-ui-bootstrap
// require('angular-animate');
// require('angular-aria');
// require('angular-messages');
// require('slick-carousel');
// require('angular-sanitize');
// require('angular-modal-service');   //http://www.dwmkerr.com/the-only-angularjs-modal-service-youll-ever-need/
// require('angular-cookies');
// require('ui-select');   //select2 adopted for angular
// require('ngmap');
var EXIF = require('exif-js'); //vendors/exif-js/exif-js
//-- from vendors :: end

//require('../resources/vendors/artificialreason/css/preload.css');
//require('../resources/css/style.css');
//require('../resources/css/glow.css');
//require('../resources/css/app.less');
//require('../resources/apis/googleapis_lato.less');

//initialize angular app
//var angular = require('angular');



//enables plugins
//require('angulartics');

var Raven = require('raven-js');

//prerequisite template modules
angular.module("uib/template/datepicker/datepicker.html", []).run(["$templateCache","$http", function($templateCache,$http) {
    $templateCache.put('uib/template/datepicker/datepicker.html', require('./directives/datePicker/templates/datePickerTemplate.html'));
}]);

angular.module("uib/template/datepicker/day.html", []).run(["$templateCache","$http", function($templateCache,$http) {
    $templateCache.put('uib/template/datepicker/day.html', require('./directives/datePicker/templates/dayTemplate.html'));
}]);

angular.module("uib/template/datepicker/month.html", []).run(["$templateCache","$http", function($templateCache,$http) {
    $templateCache.put('uib/template/datepicker/month.html', require('./directives/datePicker/templates/monthTemplate.html'));
}]);

angular.module("uib/template/datepicker/year.html", []).run(["$templateCache","$http", function($templateCache,$http) {
    $templateCache.put('uib/template/datepicker/year.html', require('./directives/datePicker/templates/yearTemplate.html'));
}]);

angular.module("uib/template/datepickerPopup/popup.html", []).run(["$templateCache","$http", function($templateCache,$http) {
    $templateCache.put('uib/template/datepickerPopup/popup.html', require('./directives/datePicker/templates/popupTemplate.html'));
}]);
angular.module("uib/template/timepicker/timepicker.html", []).run(["$templateCache","$http", function($templateCache,$http) {
    $templateCache.put('uib/template/timepicker/timepicker.html', require('./directives/timepicker/templates/timePickerTemplate.html'));
}]);


//load custom providers
var mod = angular.module('app',
    ['agoServices','ui.router','ngAria','selectionModel','ngAnimate','angularModalService',
    'ui.select','ngSanitize','ngMap','ngCookies','auth0.auth0', 'angular-jwt', 'ui.router',
    'ui.bootstrap',
    'uib/template/datepicker/datepicker.html','uib/template/datepicker/day.html','uib/template/datepicker/month.html','uib/template/datepicker/year.html','uib/template/datepickerPopup/popup.html',
    'uib/template/timepicker/timepicker.html','noUiSlider']);

//configuration
require('../constants.js')(mod);

//load routes
require('./app.routes.js');

//load filters
require('./filters/parseUrl.js')(mod);
require('./filters/startFrom.js')(mod);
require('./filters/capitalize.js')(mod);
require('./filters/rangeToRepeat.js')(mod);
require('./filters/unique.js')(mod);

//custom css
require('../resources/css/shared.less');
require('../resources/style/global.font.less');
require('../resources/style/global.header.less');
require('../resources/style/global.main.less');
require('../resources/style/global.navigation.less');
require('../resources/style/global.button.less');
require('../resources/style/global.sections.less');

require('../resources/style_new/style.less');

//error/message
require('./components/hmmm/hmmm.js');

//load directives
require('./directives/breadcrumbs/breadcrumbs.js')(mod);
require('./directives/checkUserAuth/checkUserAuth.js');
require('./directives/articlebox/articlebox.js');
require('./directives/articleCarousel/articleCarousel.js');
require('./directives/bookbox/bookbox.js');
require('./directives/searchBar/searchBarController.js')(mod);
require('./directives/blogSearch/blogSearch.js');
require('./directives/citybox/citybox.js');
require('./directives/oneMomentPlease/oneMomentPlease.js');
//require('./directives/comingsoon/comingSoon.js');
require('./directives/planner/planner.js');
require('./directives/eatClickIf.js');
require('./directives/goback.js');
require('./directives/reqVerificationToken.js');
require('./directives/inputDetection.js');
require('./directives/travelIdeaSearchBar/travelIdeaSearchBar.js')(mod);
require('./directives/citySearchBar/citySearchBar.js')(mod);
require('./directives/popularCities/popularCities.js')(mod);
require('./directives/ideaSearchBox/ideaSearchBox.js'); //still neeed???
//require('./directives/hotel/hotelSearchRooms/hotelSearchRooms.js');
require('./directives/hotel/hotelSearchGuests/hotelSearchGuests.js');
require('./directives/hotel/hotelReview/hotelReview.js');
require('./directives/air/airSelectPersons/airSelectPersons.js');
require('./directives/air/airCabinClass/airSelectCabin.js');
require('./directives/air/flightSliceDetails/flightSliceDetailsController.js')(mod);
require('./directives/hideUntilGood/hideUntilGood.js')(mod);
require('./directives/lazyLoadImage.js')(mod);
require('./directives/datePicker/datePicker.js');
require('./directives/wherePicker/wherePicker.js');
require('./directives/LPWherePicker/LPWherePicker.js');
require('./directives/countryPicker/countryPicker.js');
//require('./directives/muut/muut.js');
require('./directives/fbLogin/fbLogin.js');
require('./directives/starRating/starRating.js');
require('./directives/metaTags/metaTags.js');
require('./directives/socialIcon/socialIcon.js');
require('./directives/fbpixel/fbpixel.js');
require('./directives/timePicker/timePicker.js');
require('./directives/businessListing/businessListing.js');
require('./directives/userReview/userReview.js');
require('./directives/photos/photos.js');
require('./directives/photosCarousel/photosCarousel.js');
require('./directives/fileUpload/fileupload.js');
require('./directives/fileUpload/ngFileModel.js');
require('./directives/sliderImg/sliderImg.js');
require('./directives/favoriteDirective/favoriteDirective.js');
//require('./directives/imageOrientation/imageOrientation.js');
//require('./directives/imageOrientation/fixImageOrientation.js');
require('./directives/imageOrientation/imageOnLoad.js')(mod,EXIF);
require('./directives/radioToggle/radioToggle.js');
require('./directives/formLabelQ/formLabelQ.js');

//--- DIRECTIVES :: CONTENT ---//
require('./directives/content/travelInspirationArticles/travelInspirationArticlesController.js')(mod);




//todo: not yet used/proven but if so put this in its own file
// mod.directive('clickEnter', function () {
//     return function (scope, element, attrs) {
//         element.bind("keydown keypress", function (event) {
//             if(event.which === 13) {
//                 scope.$apply(function (){
//                     scope.$eval(attrs.myEnter);
//                 });

//                 event.preventDefault();
//             }
//         });
//     };
// });

require('./mainController.js');

//datepicker javascript experiment
require("./shared/datePickerObj.js");

//tests
//require('./tests/index.js');
require('./tests/tests.js')(mod);

//custom js
//require('../resources/js/mycustomjs.js');
require("./components/modal/modalController.js")(mod);
require("./components/modal/cancelBookingModalController.js")(mod);

//load functional components (public)
//== COMPANY ==
require('./components/sitemap/sitemap.js')(mod);
require('./components/about/about.js')(mod);
require('./components/team/team.js')(mod);
require('./components/contact/contact.js')(mod);
require('./components/support/support.js')(mod);
require('./components/accessibility/accessibility.js')(mod);
require('./components/supportedBrowsers/supportedBrowsers.js')(mod);
require('./components/partners/partners.js')(mod);
require('./components/press/press.js')(mod);
require('./components/clubgo/qualifiedOrganizations.js')(mod);


require('./components/home/home.js')(mod);
require('./components/reserve/reserve.js')(mod);
require('./components/booking/booking.js')(mod);

require('./components/cars/booking/bookingCar.js')(mod);
require('./components/cars/cars.js')(mod);
require('./components/cars/reserve/reserveCar.js')(mod);

require('./components/airlineReview/main/airlineReviewMainPage.js')(mod);
require('./components/airlineReview/detail/airlineReviewDetailPage.js')(mod);
require('./components/flights/booking/bookingFlight.js')(mod);
require('./components/flights/search/flightSearch.js')(mod);
require('./components/flights/reserve/reserveFlight.js')(mod);

require('./components/confirmation/confirmation.js')(mod);

require('./components/blogs/blog.js')(mod);
require('./components/blogDetail/blogDetailController.js')(mod);
require('./components/blogAuthor/blogAuthorController.js')(mod);

require('./components/review/review.js')(mod);

require('./components/hotels/hotels.js')(mod);
require('./components/hotel/hotel.js')(mod);
require('./components/hotel/review/reviewHotel.js')(mod);

require('./components/tripPlanner/review/reviewEntry.js')(mod);
require('./components/tripPlanner/businessIndividual/businessIndividual.js')(mod);
require('./components/tripPlanner/businessList/businessList.js')(mod);

//marketing landing page
require('./components/m/m.js')(mod);
require('./components/data/data.js')(mod);

//discourse
require('./components/sso/sso.js')(mod);

//ppn policies
require('./components/booking/policies.js')(mod);

////READY FOR DELETING require('./components/hotelscomingsoon/hotelscomingsoon.js')(mod);

require('./components/searchResult/searchResult.js')(mod);
require('./components/cruises/cruises.js')(mod);
require('./components/insurance/insurance.js')(mod);

//PLAN
require('./components/plan/plan.js')(mod);


require('./components/tripPlanner/tripPlanner.js')(mod);
require('./components/articles/articles.js')(mod);
require('./components/ideas/ideas.js')(mod);
require('./components/ideaSearch/ideaSearch.js')(mod);
require('./components/city/city.js')(mod);
require('./components/policies/terms/terms.js')(mod);   //sitewide
require('./components/policies/privacy/privacy.js')(mod);   //sitewide
require('./components/policies/cvv/cvvController.js')(mod);
require('./components/modal/termsAndConditionsModalController.js')(mod);
require('./components/modal/privacyPolicyModalController.js')(mod);
require('./components/travelKitLandingPage/travelKitController.js')(mod);
require('./components/forum/forum.js')(mod);

//service providers
require('./components/providers/provider.js')(mod);

//load functional components (requiring login)
require('./components/account/slController.js')(mod);
require('./components/account/alreadyRegisteredController.js')(mod);
require('./components/account/currentlyLoggedInController.js')(mod);
require('./components/account/trips/mytrips.js')(mod);
require('./components/account/passchanged/passchanged.js')(mod);
require('./components/account/setemailaddress/setemailaddress.js')(mod);
require('./components/account/resetpass/resetpass.js')(mod);
require('./components/account/login/login.js')(mod);
require('./components/account/signout/signout.js')(mod);
require('./components/account/unsubscribe/unsubscribe.js')(mod);
require('./components/account/join/join.js')(mod);
require('./components/account/confirm/confirm.js')(mod);
require('./components/account/verified/verified.js')(mod);
require('./components/account/photos/addPhotoModal.js')(mod);

//lookup (for internal admin)
require('./components/lp/lp.js')(mod);
require('./components/flags/flags.js')(mod);

//load functional components: account
require('./components/start/start.js')(mod);
require('./directives/embeddedModal/embeddedModal.js');
// require('./components/account/embedded/embedded.js')(mod);

//load functional components: accountPageUi
require('./components/accountPageUi/accountPageUi.js')(mod);

//entry (marketing)
require('./components/entry/entry.js')(mod);

//vendor css - this is the only way you've found to adds a <style> tag to the DOM before your custom css
require("!style!css!../node_modules/ui-select/dist/select.css");

//for google search results
require("file-loader?name=logo.jpg!../resources/img/common/logo.jpg");

// new header component
//require('./components/header-new/header.js')(mod);

//(2) called after app.config, before directive's compile functions
//purpose of run block is to prevent further system configuration during app runtime
var runFunc = function ($rootScope, $state, $document, loginModalService,$window,$location,dataFactory, authService, authManager, guid, localStorageService, environmentService, dataLayerService, jwtHelper, $interval, $timeout, $templateCache, $cacheFactory, $http) {

    //x-sref-token
    //$http.defaults.headers.common['X-XSRF-Token'] = angular.element('input[name="__RequestVerificationToken"]').attr('value');

    //cache bust $http
    $cacheFactory.get('$http').removeAll() 

    var env = environmentService();

    //for sentry.io
    if (env.name === 'production') {
        if (Raven) {    //$window.Raven) {
            Raven
              .config('https://a2afafaded404f5a97e006fa9cba4557@sentry.io/1241653')
              .addPlugin(require('raven-js/plugins/angular'), angular)
              .install();
            Raven
                .setTagsContext({
                    environment: env.name
                });
        }
    }

    /***  CACHE COMMONLY REFERENCED DATA  ***/
    // Partner Logos
    //dataFactory.getPartnerData().then(angular.noop);
    // airports
    //dataFactory.getAllAirports().then(angular.noop);
    // amenity data
    //dataFactory.getCustomAmenityData().then(angular.noop);


    // if ($window.Raven) {
    //     $window.Raven
    //         .config('https://a2afafaded404f5a97e006fa9cba4557@sentry.io/1241653')
    //         .addPlugin(require('raven-js/plugins/angular'), angular)
    //         .install();
    //     $window.Raven.setTagsContext({
    //         environment: env.name
    //     });
    //     //$window.Raven.context(function () {
    //          //init?
    //     //});
    //     //ex to push an exception --> 
    //     //Raven.captureException('hello world!', {tags: { locale: 'en-us' }});
    // }


    // -- CACHE COMMONLY REFERENCED DATA --//
    //1. custom accessible amenity data
    //todo: use technique of calling the dataFactory method with null func args, then accessibleAmenityData does not have to exist
    // dataFactory.getCustomAmenityData().then(
    //     function(response) {
    //         if (!response || !response.data.Data) {
    //             console.error('dataFactory.getCustomAmenityData() :: did not complete successfully.');
    //         }
    //     },
    //     function (response) {
    //         console.error('dataFactory.getCustomAmenityData() :: error :: ' + response);
    //     }
    // );

    //2. airport data
    // dataFactory.getAllAirports().then(
    //     function(response) {
    //         if (!response || !response.data || !response.data.results) {
    //             console.error('dataFactory.getAllAirports() :: did not complete successfully.');
    //         }
    //     },
    //     function(response) {
    //         console.error('dataFactory.getAllAirports() :: error :: ' + response);
    //     }
    // );

    //3. review data
    // dataFactory.getAllHotelReviewData().then(
    //     function(response) {
    //         if (!response) {
    //             console.error('dataFactory.getAllHotelReviewData() :: did not complete successfully.');
    //         }
    //     },
    //     function (response) {
    //         console.error('dataFactory.getAllHotelReviewData() :: error :: ' + response);
    //     }
    // );


    //cache autosuggest options
    //dataFactory.autosuggestAll().then(null,null);

    //=== auth0 ===
    // Put the authService on $rootScope so its methods can be accessed from the nav bar
    //DO WE REALLY NEED THIS???
    $rootScope.authService = authService;


    //-- MANAGE TOKEN EXPIRATION --//

    //auth token expiration :: handle an expiration
    $rootScope.$on('tokenHasExpired', function(event, token) {

        var cb = function(err, authResult) {
            if (err) {
                localStorageService.clearUserData();
                if (err.error === 'login_required') {
                    loginModalService()
                        .then(function (res) {
                            //go to requested state
                            //? return $state.go(toState.name, toParams);
                        })
                        .catch(function (e) {
                            //some sort of dismissal was triggered
                            $state.go('signout');
                        });

                }
            } else {
                authService.setSession(authResult);
            }
        };
        authService.reauthorize(cb);

        /* previous
            localStorageService.clearUserData();
            //delay to ensure clearUserData() complete and to see if this resolves Safari issue
            $timeout(function() {
                $window.location.href = 'https://'+ env.auth0_spa_domain + '/v2/logout?returnTo=' + env.auth0_redir_base + '/signout?c=i&client_id=' + env.auth0_spa_clientId;
            },250);
        */
    });

    // auth token expiration check :: every 15 min (note: page refresh check is done automatically by angular-jwt)
    // max is 15 min (https://auth0.com/docs/api-auth/tutorials/silent-authentication)
    var vm = {};
    vm.astronaut = env.authCheckSessionMilliseconds;
    $interval(function() {

        //ignore if user is not logged in
        if (!localStorageService.getAuthenticationState()) return;

        //do we have an access token?
        var token = localStorageService.getAccessToken();
        //todo: handle case that the localstorage may get wiped out
        if (!token) return;

        //check expiration, broadcast if expired
        var isTokenExpired = jwtHelper.isTokenExpired(token);
        if (isTokenExpired) {
            $rootScope.$broadcast('tokenHasExpired');
        }
    }, vm.astronaut);

/*
    localStorageService.setUserCUGDetails(
        {
            "cugMembershipId":0,
            "customerid":"test",
            "statusCode":"p",
            "statusReason":null,
            "permitType":"permit",
            "ownerType":"owner",
            "parkingID":"test",
            "country":"American Samoa",
            "stateProv":null,
            "cugOrganizationId":"00000000-0000-0000-0000-000000000000",
            "nameFirst":null,
            "nameLast":null,
            "created":"2019-01-10T08:57:09.15",
            "lmod":"2019-01-10T08:57:09.15",
            "accepted":"0001-01-01T00:00:00",
            "declined":"0001-01-01T00:00:00",
            "inactivated":"0001-01-01T00:00:00"
        }
    );
    */


    //fb (?)
    $window.rootScopeBroadcast = function () {
        var args = Array.prototype.slice.call(arguments);
        console.log('$window.rootScopeBroadcast called, but what for? args to follow...')
        console.log(args);
        return $rootScope.$broadcast.apply($rootScope, args);
    };

    //ensure we have a explicit value for isAuthenticated
    // if ($rootScope.isAuthenticated === undefined) {

    //     //get the user token if we've saved it in localStorage before
    //     var idToken = localStorage.getItem('userToken');
    //     if (idToken) {
    //         //user is logged in
    //         $rootScope.isAuthenticated = true;
    //         //goToHomepage(getQueryParameter('targetUrl'), idToken);
    //     } else {
    //         //user is not logged in, but check whether there is an SSO session
    //         //left off here
    //         auth0.getSSOData(function (err, data) {
    //               if (!isAuthCallback && !err && data.sso) {
    //                 // there is! redirect to Auth0 for SSO
    //                 auth0.signin({
    //                   connection: data.lastUsedConnection.name,
    //                   scope: 'openid name picture',
    //                   state: getQueryParameter('targetUrl')
    //                 });
    //               } else {
    //                 // regular login
    //                 document.body.style.display = 'inline';
    //               }
    //             });
    //         $rootScope.isAuthenticated = false;
    //     }
    // }

    // register the synchronous hash parser when using UI Router
    //lock.interceptHash();

    var history; // stores uri of last page viewed - Used to track if we should set focus to main H1

    $rootScope.$on('$stateChangeError', function(info,toState,toParams,fromState, fromParams, err) {
        console.log("$stateChangeError " + fromState.name + JSON.stringify(fromParams) + " -> " + toState.name + JSON.stringify(toParams));
    });

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

        //TODO: put all this in a function (in authService?)
        //route requires authentication?

        if (toState.access && !toState.access.anonymous) {

            //authenticated? --> pass through
            if (localStorageService.getAuthenticationState()) {
                
                //email exist?
                if ($rootScope.promptForEmail()) {
                    event.preventDefault();
                    $state.go('missing_email_address');
                }

                return;
            }

            //not authenticated? --> sign in
            if (!localStorageService.getAuthenticationState()) {
                event.preventDefault();
                $state.go('signin',{r: toState.name});  //$location.url()
                return;
            }

            //page authorization escalated? --> use prelogin path
            var preloginstate = localStorageService.getPreLoginState();
            if (preloginstate) {
                event.preventDefault();
                $state.go(preloginstate.path, preloginstate.params);
                return;
            }

            //authenticated --> default path
            $state.go('start');
            return;
        }
        
        //commenting out until we are ready to implement signin
        // if ($rootScope.checkedForCurrentUser === undefined) {
        //     //checks server state (sets default for initial run, updates state after browser refresh)
        //     authService.getCurrentUser()
        //         .then(function (response) {
        //             var isAuth = response.data.authenticated;
        //             if (isAuth) {
        //                 $rootScope.currentUser = {
        //                     userId: response.data.userId,
        //                     firstName: response.data.firstName,
        //                     email: response.data.email
        //                 };
        //             }
        //             $rootScope.isAuthenticated = isAuth;

        //             promptForLogin(event, toState, toParams);
        //         })
        //         .catch(function (e) {
        //             //TODO: log
        //             console.log(e);
        //             return $state.go('home');
        //         });
        //     $rootScope.checkedForCurrentUser = "checked";
        // } else {
        //     promptForLogin(event, toState, toParams);
        // }
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

        angular.element(document).ready(function() {

            //scroll to top on route change
            $document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;

            //3rd party site tracking events - need to take place after dom loads
            if (env.name === 'production') {
            
                //google analytics (PLACE THIS AFTER THE TITLE CHANGES :)
                //removing as per Daniel
                //$window.ga('send', 'pageview', $location.path());
                dataLayerService.push('pageview');

                //still relevant ???
                //  facebook :: check login status
                //  TODO: figure out how to check on each page load: $rootScope.authService.checkLoginStatusFB();

                //active campaign site tracking
                //removed as per https://accessiblego.atlassian.net/browse/AC-297
                //$window.activeCampaignSiteTracker($location.absUrl());

                //hotjar site tracking
                $window.hj('stateChange', $location.url());
            }
        });

        //enable current state to be retrieved after an auth0 login
        //todo: create a localstorage service as a facade into all items stored locally
        //   this is separate from sessionService which manages session-specific logic (?)
        if (['signin','sl','signout', 'social_login_redir', 'passchanged', 'discourse', 'missing_email_address'].indexOf($state.current.name) === -1) {
            var preLoginState = {
                path: $state.current.name,
                params: $state.params
            };
            localStorageService.setPreLoginState(preLoginState);
            //$window.localStorage.setItem('preLoginState', );
        }

        // When navigating between pages track the last page we were on
        // to know if we should be setting focus on the h1 on view update
        if(fromState) {
            if(fromState.url){
                history = fromState.url;
            }
        }
    });

    // function promptForLogin(event, toState, toParams){
    //     //attaching currentUser to $rootScope b/c root scope is app-wide
    //     var requireLogin = toState.data.requireLogin;
    //     if (requireLogin && typeof $rootScope.currentUser === 'undefined') {
    //         event.preventDefault();

    //         loginModalService()
    //             .then(function (res) {
    //                 //go to requested state
    //                 return $state.go(toState.name, toParams);
    //             })
    //             .catch(function (e) {
    //                 //some sort of dismissal was triggered - go to home page
    //                 return $state.go('home');
    //             });
    //     }
    // }

    $rootScope.promptForEmail = function() {
        var md = "https://accessiblego/app_metadata";
        var profile = localStorageService.getUserProfile();

        //page does not apply if user is not logged in
        if (!localStorageService.getAuthenticationState()) return false;

        //page does not apply if account is not a social login
        if (profile.sub.startsWith('auth0|')) return false;

        //page does not apply if account has an email address
        if (profile.email && profile.email.length>0) return false;

        //page does not apply if account has an override email address
        if (profile[md].email_override && profile[md].email_override.length>0) return false;

        return true;
    }

    //offline check
    if ($window.navigator) {
        $rootScope.isUserOnline = $window.navigator.onLine;

        $window.addEventListener("offline", function() {
            $rootScope.$apply(function() {
              $rootScope.isUserOnline = false;
            });
        }, false);

        $window.addEventListener("online", function() {
            $rootScope.$apply(function() {
              $rootScope.isUserOnline = true;
            });
        }, false);
    }

    //templates
    $templateCache.put('hotelSearchBar.html', require('./templates/hotelSearchBar.html'));
    $templateCache.put('userOverridingMessage.html', require('./templates/userOverridingMessage.html'));
    $templateCache.put('reserveFAQ.html', require('./templates/reserveFAQ.html'));

};
runFunc.$inject = ['$rootScope','$state','$document','loginModalService','$window','$location','dataFactory','authService','authManager','guid','localStorageService','environmentService','dataLayerService', 'jwtHelper','$interval','$timeout','$templateCache','$cacheFactory','$http'];
mod.run(runFunc);


//load directive: options
//require('./shared/bands/index')(mod);    //by default, webpack will use the index.js file inside bands folder


//for testing custom loader
//require("../../../public/testdata.json");

//for testing custom plugin: use plugin to create a global variable (the $ itself understood b/c we defined it in webpack.config.js
//$('#testDiv').text('jQuery modified this content - see app.js');


//------------------------------------------------------------------------------

//useful for making http requests
//see examples at https://davidwalsh.name/nodejs-http-request http://www.bennadel.com/blog/2612-using-the-http-service-in-angularjs-to-make-ajax-requests.htm
//var http = require('http');


//require('bootstrap');



    //load templates
    //require('directives/datePicker/custom.html');
    // try {
    //     $templateRequest($sce.getTrustedResourceUrl('web/directives/datePicker/custom.html'), true);
    // } catch (e) {
    //     console.error("Erreur de mise en cache des gabarits");
    // }
    //$templateCache.put('template/datepicker/datepicker.html', undefined);
