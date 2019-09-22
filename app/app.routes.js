var mod = angular.module('app');

//(1) called before app.run
mod.config(['$stateProvider', '$urlRouterProvider','$locationProvider', '$httpProvider', 'jwtOptionsProvider','$urlMatcherFactoryProvider', '$sceDelegateProvider', 'angularAuth0Provider', 'environmentServiceProvider', //'$ravenProvider',
    function ($stateProvider, $urlRouterProvider,$locationProvider,$httpProvider,jwtOptionsProvider,$urlMatcherFactoryProvider, $sceDelegateProvider, angularAuth0Provider, environmentServiceProvider) { //, ravenProvider) {

    //reference for relative links
    var baseUrl = '/'; // $("base").first().attr("href");
    
    //Enable cross domain calls
    //$httpProvider.defaults.useXDomain = true; //testing removal of this 2/8/19
    //$httpProvider.xsrfWhitelistedOrigins = ['https://accessiblego.azureedge.net'];

    //user pushState API to change the browser's URL (w/o causing a reload)
    var html5Params = {enabled:true,requireBase:false,rewriteLinks:true};
    $locationProvider.html5Mode(html5Params);

    // when there is an empty route, redirect to /index   
    $urlRouterProvider.when('', baseUrl + 'home');

    // alias some routes for ease of use
    //$urlRouterProvider.when('/signin?/:r', '/login?/:r');
    $urlRouterProvider.when('/register', '/join');
    
    //catch all route
    $urlRouterProvider.otherwise(baseUrl + 'home');

    //case insensitivity
    $urlMatcherFactoryProvider.caseInsensitive(true);
    $urlMatcherFactoryProvider.strictMode(false);

    // Configuration for angular-jwt
    jwtOptionsProvider.config({
      tokenGetter: function () {
        return localStorage.getItem('id_token');
      }
    });

    //trusted resource whitelist
    $sceDelegateProvider.resourceUrlWhitelist([
        'self', // Allow same origin resource loads (default).
        'https://accessiblego.com/**' // allow stage to load data from prod
    ]);

    //shortcut to environment variables
    var env = environmentServiceProvider.$get()();

    angularAuth0Provider.init({
        clientID: env.auth0_spa_clientId,
        domain: env.auth0_spa_domain,
        //responseType: 'token id_token',
        //redirectUri: 'http://localhost:3000/callback',
        //scope: 'openid profile email',
        //nonce: nonce    //required (to mitigate replay attacks when using implicit grant)

        //TODO: unique value for state
        //state: 389457348905
    });

    //== FB ==//
    //:begin npm angular-easyfb
    // ezfbProvider.setLocale('en_US');
    // ezfbProvider.setInitParams({
    //     appId: '276779086068509',
    //     cookie: true,
    //     xfbml: true,
    //     version: 'v3.0'
    // });
    // var myInitFunction = ['$window', 'ezfbInitParams', function ($window, ezfbInitParams) {
    //   $window.FB.init(ezfbInitParams);  // initialize the FB JS SDK
    //   //$window.FB.AppEvents.logPageView();
    //   //$rootScope.$broadcast('FB.init');
    // }];
    // ezfbProvider.setInitFunction(myInitFunction);
    //:end npm angular-easyfb

    //TODO: confirm SDK should already have been loaded
    //$window.fbAsyncInit = ezfbAsyncInit;

    // Feasible config if the FB JS SDK script is already loaded
    // ezfbProvider.setLoadSDKFunction(function (ezfbAsyncInit) {
    //     ezfbAsyncInit();
    // });


    //define routes
    $stateProvider

        //-- REROUTING --//
        .state('data', {
            url: baseUrl + 'data',
            controller: 'dataController',
            access: {
                anonymous: true
            }
        })

        //-- SEO --//
        .state('sitemap', {
            url: baseUrl + 'sitemap',
            template: require("./components/sitemap/sitemap.html"),
            title: 'Site Map',
            access: {
                anonymous: true
            }
        })
        .state('businesses', {
            url: baseUrl + 'businesses/all',
            template: require("./components/tripPlanner/businessList/businessList.html"),
            title: 'Business List',
            access: {
                anonymous: true
            }
        })


        //-- AUTHENTICATION --//
        .state('signin', {
            url: baseUrl + 'signin?/:r',
            template: require("./components/account/login/login.html"),
            title: 'accessibleGO.com : log in',
            params: {
                r: null,    //r=redirect path
            },
            access: {
                anonymous: true
            }
        })
        .state('login', {
            url: baseUrl + 'login?/:r',
            template: require("./components/account/login/login.html"),
            title: 'accessibleGO.com : log in',
            params: {
                r: null,    //r=redirect path
            },
            access: {
                anonymous: true
            }
        })

        //user is directed to this URL when signing into forum
        .state('join', {
            url: baseUrl + 'join?/:r',
            template: require("./components/account/join/join.html"),
            title: 'accessibleGO.com : join',
            params: {
                r: null,    //r=redirect path
            },
            access: {
                anonymous: true
            }
        })

        .state('missing_email_address', {
            url: baseUrl + 'missing_email_address',
            template: require("./components/account/setemailaddress/setemailaddress.html"),
            title: 'accessibleGO.com : provide email address',
            access: {
                anonymous: false
            }
        })

        .state('resetpass', {
            url: baseUrl + 'resetpass?/:r',
            template: require("./components/account/resetpass/resetpass.html"),
            title: 'accessibleGO.com : reset password',
            params: {
                r: null,    //r=redirect path
            },
            access: {
                anonymous: true
            }
        })
        
        //user is directed to this URL after auth0 change password succeeds
        .state('passchanged', {
            url: baseUrl + 'passchanged?/:email?/:success?/:message',
            template: require("./components/account/passchanged/passchanged.html"),
            title: 'accessibleGO.com : password has been changed',
            access: {
                anonymous: true
            }
        })

        .state('verified', {
            url: baseUrl + 'verified',
            template: require("./components/account/verified/verified.html"),
            title: 'accessibleGO.com : accessible travel for everyone',
            data: {
                requireLogin: false
            }
        })

        .state('social_login_redir', {
            url: baseUrl + 'social_login_redir',
            template: require("./components/account/login/socialLoginRedir.html"),
            controller: 'socialLoginRedirController as vm',
            title: 'accessibleGO.com : accessible travel for everyone',
            access: {
                anonymous: true
            }
        })

        .state('signout', {
            url: baseUrl + 'signout?/:c',
            template: require("./components/account/signout/signout.html"),
            title: 'accessibleGO.com :: signed out',
            params: {
                c: 'u',   //context :: u=user request (default), i=inactivity
            },
            access: {
                anonymous: true
            }
        })

        .state('discourse', {
            url: baseUrl + 'sso/discourse?/:sso?/:sig',
            controller: 'discourseController',
            access: {
                anonymous: false
            }
        })

        .state('home', {
            url: baseUrl + 'home?/:v',
            template: require("./components/home/home.html"),
            title: 'accessibleGO.com : accessible travel for everyone',
            access: {
                anonymous: true
            }
        })

        // .state('home-new', {
        //     url: baseUrl + 'home-new?/:v',
        //     template: require("./components/home-new/home.html"),
        //     title: 'accessibleGO.com : accessible travel for everyone',
        //     access: {
        //         anonymous: true
        //     }
        // })


        .state('start', {
            url: baseUrl + 'start',
            template: require("./components/start/start.html"),
            title: 'accessibleGO.com : accessible travel for everyone',
            access: {
                anonymous: false
            }
        })

        .state('hmmm', {
            url: baseUrl + 'hmmm/:message',
            template: require("./components/hmmm/hmmm.html"),
            title: 'accessibleGO.com : hmmm...',
            params: {
                message: 'Unexpected error occurred'
            },
            access: {
                anonymous: true
            }
        })

        .state('unsubscribe', {
            url: baseUrl + 'unsubscribe',
            template: require("./components/account/unsubscribe/unsubscribe.html"),
            title: 'accessibleGO.com :: unsubscribe',
            access: {
                anonymous: true
            }
        })

        //READY FOR DELETING
        // .state('hotelscomingsoon', {
        //     url: baseUrl + 'hotelscomingsoon',
        //     template: require("./components/hotelscomingsoon/hotelscomingsoon.html"),
        //     title: 'Hotels - Coming Soon',
        //     data: {
        //         requireLogin: false
        //     }
        // })

        .state('hotels', {
            url: baseUrl + 'hotels?/:ppnid?/:type?/:display?/:checkin?/:checkout?/:rooms?/:adults?/:children?/:radius?/:longitude?/:latitude?/:cityid',
            template: require("./components/hotels/hotels.html"),
            title: 'Hotels',
            access: {
                anonymous: true
            }
        })

        //get latest and then do this
        .state('hotels_in', {
            url: baseUrl + 'hotels/:cityname',
            title: 'Hotel Search',
            access: {
                anonymous: true
            },
            resolve: {
                ppnid: ['$stateParams', 'dataFactory','$state', 'utilities', function ($stateParams, dataFactory,$state,utilities) {

                    var cityName = $stateParams.cityname;
                    cityName = cityName.replace(new RegExp('_', 'g'), ' ');

                    var checkinDate = new Date();
                    checkinDate.setDate(checkinDate.getDate() + 7);
                    var checkoutDate = new Date();
                    checkoutDate.setDate(checkoutDate.getDate() + 14);
                    var params = {};
                    dataFactory.getPricelineCityByName(cityName).then(function (city) {
                        if (city && city.data && city.data.data && city.data.data.p) {

                            var cityName = city.data.data.c;
                            var stateprovName = city.data.data.s===''?'':', ' +city.data.data.s;
                            var countryName = city.data.data.o===''?'':', ' +city.data.data.o;
                            
                            params = {
                                ppnid: city.data.data.p,
                                type:'city',
                                display: cityName + stateprovName + countryName,
                                checkin: utilities.getUrlSafeDate(checkinDate),
                                checkout: utilities.getUrlSafeDate(checkoutDate)
                            };
                        }
                        $state.go('hotels', params);
                    });
                }]
            }
        })

        .state('hotel', {
            url: baseUrl + 'hotel?/:hid?/:checkin?/:checkout?/:rooms?/:adults?/:children?/:anchor?/:destination?',
            template: require("./components/hotel/hotel.html"),
            title: 'Hotel Details',
            params: {
                // checkin: new Date(Date.now()).toString(),   //today
                // checkout: (new Date(Date.now()+86400000).toString()), //tomorrow
                rooms: '1',
                adults: '2',
                children: '0',
                destination: ''
            }
            ,access: {
                anonymous: true
            }
        })

        .state('reserve', {
            url: baseUrl + 'reserve?ppn_bundle?/:testConversion',
            template: require("./components/reserve/reserve.html"),
            title: 'Reserve Your Room',
            access: {
                anonymous: true
            }
        })

        .state('reservecug', {
            url: baseUrl + 'reservecug?rate_plan/:cug_ppn_bundle',
            template: require("./components/reserve/reservecug.html"),
            title: 'Reserve Your Room',
            access: {
                anonymous: true
            }
        })

        .state('booking_hotel', {
            url: baseUrl + 'booking/hotel/:bid/:e/:c?',
            template: require("./components/booking/booking.html"),
            title: 'Your Booking',
            access: {
                anonymous: true
            },
            params: {
                c:undefined
            }
        })

        .state('booking_car', {
            url: baseUrl + 'booking/car/:bid/:e/:c',
            template: require("./components/cars/booking/bookingCar.html"),
            title: 'Your Rental Car Booking',
            access: {
                anonymous: true
            }
        })

        .state('booking_flight', {
            url: baseUrl + 'booking/flight/:bid/:e/:c',
            template: require("./components/flights/booking/bookingFlight.html"),
            title: 'Your Flight Booking',
            access: {
                anonymous: true
            }
        })


        //terms of use for PPN products
        .state('booking_termsofuse', {
            url: baseUrl + 'booking/termsofuse',
            template: require("./components/booking/termsofuse.html"),
            title: 'Terms of Use',
            access: {
                anonymous: true
            }
        })

        //privacy policy for PPN products
        .state('booking_privacypolicy', {
            url: baseUrl + 'booking/privacypolicy',
            template: require("./components/booking/privacypolicy.html"),
            title: 'Terms of Use',
            access: {
                anonymous: true
            }
        })

        .state('review', {
            url: baseUrl + 'review?/:i?',
            template: require("./components/review/review.html"),
            title: 'Create a Review',
            access: {
                anonymous: true
            }
        })

        .state('reviewHotel', {
            url: baseUrl + 'reviewHotel?/:hid?',
            template: require("./components/hotel/review/review.html"),
            title: 'Review Hotel',
            access: {
                anonymous: true
            }
        })

        .state('reviewEntry', {
            url: baseUrl + 'reviewEntry?/:id?',
            template: require("./components/tripPlanner/review/reviewEntry.html"),
            title: 'Review Directory Entry',
            access: {
                anonymous: true
            }
        })

        .state('searchResult', {
            url: baseUrl + 'search/result/:searchText?',
            template: require("./components/searchResult/searchResult.html"),
            title: 'Accessible Result',
            access: {
                anonymous: true
            }
        })

        //marketing
        .state('m', {
            url: baseUrl + 'm?/:p?/:q?/:a?/:e?/:pid?',
            controller: 'mController',
            params: {
                p: 'home',
                q: '',
                a: '',
                e: '',
                pid: ''
            },
            access: {
                anonymous: true
            }
        })

        .state('flights', {
            url: baseUrl + 'flights?/:way?/:dep_ppnid?/:dep_type?/:dep_date?/:dep_display?/:arr_ppnid?/:arr_type?/:arr_display?/:return_date?/:adults?/:children?/:cabin',
            template: require("./components/flights/search/flightSearch.html"),
            title: 'Flights',
            access: {
                anonymous: true
            },
            params: {
                way: 'RoundTrip'
            }
        })

        .state('flightSelectReturn', {
          url: baseUrl + 'flightSelectReturn?/:ppn_bundle?/:sid',
            template: require("./components/flights/search/flightSelectReturn.html"),
            title: 'Flights :: Select Return Flight',
            access: {
                anonymous: true
            }  
        })

        .state('flight_reserve', {
            url: baseUrl + 'flights/reserve?/:ppn_bundle?/:sid',
            template: require("./components/flights/reserve/reserveFlight.html"),
            title: 'Flights :: Reserve',
            access: {
                anonymous: true
            }
        })

        .state('cruises', {
            url: baseUrl + 'cruises?/:phrase',
            template: require("./components/cruises/cruises.html"),
            title: 'Cruises',
            access: {
                anonymous: true
            }
        })

        .state('insurance', {
            url: baseUrl + 'insurance',
            template: require("./components/insurance/insurance.html"),
            title: 'Insurance',
            access: {
                anonymous: true
            }
        })

 .state('businessIndividual', {
            url: baseUrl + 'businessIndividual/:city/:type/:category/:slug',
            template: require("./components/tripPlanner/businessIndividual/businessIndividual.html"),
            title: 'Business Individual',
            access: {
                anonymous: true
            }
        })
        .state('cars', {
            url: baseUrl + 'cars?/:pickupLocation_code?/:pickupLocation_city?/:pickupLocation_state?/:pickupLocation_country?/:pickupLocation_ppnid?/:pickupLocation_type?/:pickupLocation_display?/:pickupDate?/:pickupTime?/:dropoffLocation_code?/:dropoffLocation_ppnid?/:dropoffLocation_city?/:dropoffLocation_state?/:dropoffLocation_country?/:dropoffLocation_type?/:dropoffLocation_display?/:dropoffDate?/:dropoffTime',
            template: require("./components/cars/cars.html"),
            title: 'Cars',
            access: {
                anonymous: true
            }
        })

// ?/:pickupLocation_ppnid
// ?/:pickupLocation_type
// ?/:pickupLocation_display
// ?/:pickupDate
// ?/:pickupTime
// ?/:dropoffLocation_ppnid
// ?/:dropoffLocation_type
// ?/:dropoffLocation_display
// ?/:dropoffDate
// ?/:dropoffTime


        .state('reserveCar', {
            url: baseUrl + 'reserveCar?car_reference_id',
            template: require("./components/cars/reserve/reserveCar.html"),
            title: 'Cars',
            access: {
                anonymous: true
            }
        })

        .state('tripPlanner', {
            url: baseUrl + 'tripPlanner?/:city?/:type?/:category?',
            template: require("./components/tripPlanner/tripPlanner.html"),
            title: 'Trip Resources',
            access: {
                anonymous: true
            },
            params: {
                city: 'New_York',
                type: 'Caregiver_Agencies'
            }
        })

        .state('articles', {
            url: baseUrl + 'articles/:title?/:scrollTo',
            template: require("./components/articles/articles.html"),
            title: 'Articles',
            // resolve: {
            //     articleTitle: function() {
            //         debugger;
            //         return title;
            //     }
            // },
            params: {
                title: '6_Thanksgiving_Travel_Tips'
            },
            access: {
                anonymous: true
            },
            onEnter: ['$location', '$stateParams', '$anchorScroll', '$timeout', function ($location, $stateParams, $anchorScroll, $timeout) {
                if ($stateParams.scrollTo) {
                    $timeout(function() { 
                      $location.hash($stateParams.scrollTo);
                      $anchorScroll();
                    }, 100);
                }
            }]
        })

        //for muut login
        // .state('articles.muut_login', {
        //     url: baseUrl + 'muut_login',
        //     onEnter: ['$rootScope','loginModalService','$location', '$stateParams', function($rootScope,loginModalService,$location,$stateParams) {
        //         //TODO: create redirection service (this is also referenced in loginController and registerController)
        //         $rootScope.state_redirect = { to: 'articles', params: { title: $stateParams.title, scrollTo: 'muut_container'}};

        //         //$rootScope.state_redirect = $location.absUrl().replace('/muut_login','');

        //         var params = {
        //             text: {
        //                 heading: 'Your thoughts are important',
        //                 subHeadingJoin: 'Create an account to comment on articles.',
        //                 subHeadingLogin: 'Log in to comment on articles.'
        //             }
        //         };
        //         loginModalService(params);

        //         //this allows modal to be opened multiple times
        //         var np = $location.path().replace('/muut_login','');
        //         $location.path(np);
        //     }],
        //     controller: function() {
        //     },
        //     access: {
        //         anonymous: true
        //     }
        // })

        //travel forum
        // .state('forum-comingsoon', {
        //     url: baseUrl + 'forum',
        //     template: require("./components/forum/comingsoon.html"),
        //     title: 'Travel Forum',
        //     access: {
        //         anonymous: true
        //     }
        // })

        // .state('forum-categories', {
        //     url: baseUrl + 'forum/pending',
        //     template: require("./components/forum/categories.html"),
        //     title: 'Travel Forum',
        //     access: {
        //         anonymous: true
        //     }
        // })
        // .state('forum-subcategories', {
        //     url: baseUrl + 'forum/:categorySlug',
        //     template: require("./components/forum/subCategories.html"),
        //     title: 'Travel Forum',
        //     access: {
        //         anonymous: true
        //     }
        // })
        // .state('forum-topics', {
        //     url: baseUrl + 'forum/:categorySlug/:subCategorySlug',
        //     template: require("./components/forum/topics.html"),
        //     title: 'Travel Forum',
        //     access: {
        //         anonymous: true
        //     }
        // })
        // .state('forum-posts', {
        //     url: baseUrl + 'forum/:categorySlug/:subCategorySlug/:topicSlug',
        //     template: require("./components/forum/posts.html"),
        //     title: 'Travel Forum',
        //     access: {
        //         anonymous: true
        //     }
        // })

        // .state('forum-reply', {
        //     url: baseUrl + 'forum/:categorySlug/:subCategorySlug/:topicSlug/reply',
        //     template: require("./components/forum/reply.html"),
        //     title: 'Travel Forum',
        //     access: {
        //         anonymous: true
        //     }
        // })
        .state('sso', {
            url: baseUrl + 'sso?/:destination',
            template: require("./components/sso/sso.html"),
            controller: 'ssoController',
            title: 'Authorizing',
            access: {
                anonymous: true
            }
        })

        .state('ssoCB', {
            url: baseUrl + 'ssoCB?/:destination',
            template: require("./components/sso/ssoCB.html"),
            controller: 'ssoCBController',
            title: 'Authorizing',
            access: {
                anonymous: true
            }
        })

        //state for launching forum
        .state('forum-launcher', {
            url: baseUrl + 'forum-launcher',
            template: require("./components/oneMomentPlease/oneMomentPlease.html"),
            onEnter: ['$state','$window', 'localStorageService', function ($state,$window,localStorageService) {
                var forumUrl = env.FORUM_URL;
                if (localStorageService.getAuthenticationState()) {
                    forumUrl+= '/session/sso?return_path=/';
                }
                $window.open(forumUrl,'_self');
            }],
            access: {
                anonymous: true
            }
        })


        .state('forum-auth', {
            url: baseUrl + 'forum-auth?/:destination',
            //template: require("./ /forum/auth.html"),
            controller: 'forumAuthController',
            title: 'Travel Forum :: Authorizing',
            access: {
                anonymous: false
            }
        })

        .state('forum-ask', {
            url: baseUrl + 'forum/:categorySlug/:subCategorySlug/user/ask',
            template: require("./components/forum/ask.html"),
            title: 'Travel Forum',
            access: {
                anonymous: false
            }
        })

        .state('travel-ideas', {
            url: baseUrl + 'travel-ideas',
            template: require("./components/plan/travel-ideas.html"),
            title: 'Travel Ideas',
            access: {
                anonymous: true
            }
        })

        .state('by-city', {
            url: baseUrl + 'by-city',
            template: require("./components/plan/by-city.html"),
            title: 'By City',
            access: {
                anonymous: true
            }
        })

        .state('city', {
            url: baseUrl + 'city/:name/:state/:country/:type',
            template: require("./components/city/city.html"),
            title: 'Travel Ideas by City',
            access: {
                anonymous: true
            },
            params: {
                name: 'New York',
                state: 'New York',
                country: 'United States',
                type: 'attractions'
            }
        })

        .state('provider', {
            url: baseUrl + 'provider/:city/:state/:country/:slug',
            template: require("./components/providers/provider.html"),
            title: 'Travel Ideas by City',
            access: {
                anonymous: true
            },
            params: {
                name: 'New York',
                state: 'New York',
                country: 'United States'
            }
        })


        //aka inspiration
        .state('ideas', {
            url: baseUrl + 'ideas',
            template: require("./components/ideas/ideas.html"),
            title: 'Travel Ideas',
            access: {
                anonymous: true
            }
        })
        .state('ideaSearch', {
            url: baseUrl + 'ideaSearch/:phrase',
            template: require("./components/ideaSearch/ideaSearch.html"),
            title: 'Search Travel Ideas',
            access: {
                anonymous: true
            }
        })
        .state('blog', {
            url: baseUrl + 'blog/:id',
            template: require("./components/blogDetail/blogDetail.html"),
            title: 'Blog Detail',
            controller: 'blogDetailController as vm',
            access: {
                anonymous: true
            },
            resolve: {
                blog: ['$stateParams', 'dataFactory', function ($stateParams, dataFactory) {
                    return dataFactory.getBlogById($stateParams.id).then(function (blog) {
                        return blog;
                    });
                }]
            }
        })
        .state('blogMain', {
            url: baseUrl + 'blogMain?/:s',
            template: require("./components/blogs/blog.html"),
            title: 'Blog',
            access: {
                anonymous: true
            }
        })
        .state('blogDetail', {
            url: baseUrl + 'blogDetail/:slug',
            template: require("./components/blogDetail/blogDetail.html"),
            title: 'Blog Detail',
            controller: 'blogDetailController as vm',
            access: {
                anonymous: true
            },
            resolve: {
                blog: ['$stateParams', 'dataFactory', function ($stateParams, dataFactory) {
                    return dataFactory.getBlogBySlug($stateParams.slug).then(function (blog) {
                        return blog;
                    });
                }]
            }
        })
        .state('blogAuthor', {
            url: baseUrl + 'blogAuthor/:lastname',
            template: require("./components/blogAuthor/blogAuthor.html"),
            title: 'Blog Author',
            controller: 'blogAuthorController as vm',
            access: {
                anonymous: true
            },
            resolve: {
                blog: ['$stateParams', 'dataFactory', function ($stateParams, dataFactory) {
                    var findFunc = function(author) {
                        var authLastname = author.last_name.replace('.','');
                        var lname = $stateParams.lastname.replace('.','');
                        return authLastname===lname;
                    };

                    //return dataFactory.temporaryAuthorData.find(findFunc);
                    return dataFactory.getBlogAuthors().then(function(res) {
                        return res.data.blogAuthors.find(findFunc);
                    });
                    
                }]
            }
        })

        .state('privacy_policy', {
            url: baseUrl + 'privacy_policy',
            template: require("./components/policies/privacy/privacypolicy.html"),
            title: 'Privacy Policy',
            access: {
                anonymous: true
            }
        })

        .state('terms_of_use', {
            url: baseUrl + 'terms_of_use',
            template: require("./components/policies/terms/termsofuse.html"),
            title: 'Terms of Use',
            access: {
                anonymous: true
            }
        })

        //== COMPANY ==//
        .state('about', {
            url: baseUrl + 'about',
            template: require("./components/about/about.html"),
            title: 'About Us',
            access: {
                anonymous: true
            }
        })
        .state('team', {
            url: baseUrl + 'team',
            template: require("./components/team/team.html"),
            title: 'The accessibleGO Team',
            access: {
                anonymous: true
            }
        })
        .state('contact', {
            url: baseUrl + 'contact',
            template: require("./components/contact/contact.html"),
            title: 'Contact Us',
            access: {
                anonymous: true
            }
        })
        .state('support', {
            url: baseUrl + 'support',
            template: require("./components/support/support.html"),
            title: 'Customer Support',
            access: {
                anonymous: true
            }
        })
        .state('accessibility', {
            url: baseUrl + 'accessibility',
            template: require("./components/accessibility/accessibility.html"),
            title: 'Accessibility',
            access: {
                anonymous: true
            }
        })
        .state('supportedBrowsers', {
            url: baseUrl + 'supported-browsers',
            template: require("./components/supportedBrowsers/supportedBrowsers.html"),
            title: 'Supported Browsers',
            access: {
                anonymous: true
            }
        })
        .state('partners', {
            url: baseUrl + 'partners',
            template: require("./components/partners/partners.html"),
            title: 'Our Partners',
            access: {
                anonymous: true
            }
        })
        .state('press', {
            url: baseUrl + 'press',
            template: require("./components/press/press.html"),
            title: 'In the Press',
            access: {
                anonymous: true
            }
        })

        .state('methods', {
            url: baseUrl + 'methods',
            template: require("./components/methods/methods.html"),
            title: 'Methods',
            access: {
                anonymous: true
            }
        })


        //-- Public Entry Points (partners) --
        .state('NewMobility', {
            url: baseUrl + 'newmobility',
            template: require("./components/entry/NewMobility.html"),
            title: 'New Mobility',
            access: {
                anonymous: true
            }
        })
        .state('Yachad', {
            url: baseUrl + 'yachad',
            template: require("./components/entry/Yachad.html"),
            title: 'Yachad',
            access: {
                anonymous: true
            }
        })


//DO WE STILL NEED LOCK LANDING PAGE????
//authenticated: sign in landing (a: single cb to manage in AUTH0, b: process in a single place, c: future tracking)
.state('sl', {
    url: baseUrl + 'sl',
    controller: 'slController',
    data: {
        requireLogin: true
    }
})

        //authenticated: booked trips
        .state('mytrips', {
            url: baseUrl + 'mytrips',
            template: require("./components/account/trips/mytrips.html"),
            title: 'accessibleGO.com : my trips : hotels',
            access: {
                anonymous: false
            }
        })








        /* below if for reference or TO BE INTEGRATED */
        //-- states for: account
        // .state('login', {
        //     url: baseUrl + 'login',
        //     templateUrl: '/Template/RenderLoginTemplate',   //RenderForIndex?feature=tests&name=tests&model=tests',
        //     controller: 'loginController',
        //     title: 'Login',
        //     data: {
        //         requireLogin: false
        //     }
        // })

        // .state('confirm', {
        //     url: baseUrl + 'confirm?{u}&{c}',
        //     templateUrl: '/Template/RenderConfirmTemplate',
        //     controller: 'confirmController',
        //     title: 'please confirm your email',
        //     access: {
        //         anonymous: true
        //     }
        // })



        //user feedback
        // .state('send-feedback', {
        //     url: '/policy/send-feedback',
        //     template: require("./shared/feedback/send-feedback.html"),
        //     title: 'Send Feedback',
        //     access: {
        //         anonymous: true
        //     }
        // })

        //--- policies ---//
        // .state('policy-user-agreement', {
        //     url: '/policy/user-agreement',
        //     template: require("./components/policies/user-agreement.html"),
        //     title: 'User Agreement',
        //     access: {
        //         anonymous: true
        //     }
        // })

        //--- travelKitLanding ---//
        .state('travelKit', {
            url: '/travelKit',
            template: require("./components/travelKitLandingPage/travelKit.html"),
            title: 'Travel Kit Landing Page',
            access: {
                anonymous: true
            }
        })

        // .state('policy-privacy', {
        //     url: '/policy/privacy',
        //     template: require("./components/policies/privacy.html"),
        //     title: 'Privacy Policy',
        //     data: {
        //         requireLogin: false
        //     }
        // })


        .state('accountPageUi', {
            url: baseUrl + 'account?/:t',
            template: require("./components/accountPageUi/accountPageUi.html"),          
            title: 'Test',
            params: {
                t: 'profile'
            },
            access: {
                anonymous: false
            }
        })
       

        .state('accountPageUi.disabilityParkingPermit', {
            url: baseUrl +'disabilityParkingPermit',
            template: require("./components/accountPageUi/disabilityParkingPermit.html"),
            access: {
                anonymous: false
            }
        })


        .state('accountPageUi.organisationMembership', {
            url: baseUrl +'organisationMembership',
            template: require("./components/accountPageUi/organisationMembership.html"),
            access: {
                anonymous: false
            }
        })

        //--- Airline Review Main Page ---//
        .state('airline_reviews_main', {
            url: '/airline_reviews_main',
            template: require("./components/airlineReview/main/airlineReviewMainPage.html"),
            controller: 'airlineReviewMainPageController',
            title: 'airline_reviews_main',
            access: {
                anonymous: true
            }
        })
        
        //--- Airline Review Detail Page ---//

        .state('airline_reviews_detail', {
            url: '/airline_reviews_detail?airline',
            template: require("./components/airlineReview/detail/airlineReviewDetailPage.html"),
            controller: 'airlineReviewDetailPageController',
            title: 'airline_reviews_detail',
            access: {
                anonymous: true
            }
        })


        //-- administrative --//

        /* hotel lookup */
        .state('lp', {
            url: baseUrl + 'lp/:p',
            template: require("./components/lp/lp.html"),
            title: 'Lookup',
            access: {
                anonymous: true
            },
            params: {
                p: '1000'  //portal id
            }
        })

        /* for feature flags and in-production state changes */
        .state('flags', {
            url: baseUrl + 'flags',
            template: require("./components/flags/flags.html"),
            title: 'accessibleGO.com : flags',
            access: {
                anonymous: true
            }
        })


        //--- tests ---///
        .state('testModal', {
            url: '/tests/modals',
            template: require("./tests/modals/modals.html"),
            title: 'Test',
            access: {
                anonymous: true
            }
        })

        .state('tests', {
            url: '/tests',
            template: require("./tests/index.html"),
            title: 'Test',
            access: {
                anonymous: true
            }
        })

        .state('testsUI', {
            url: '/tests/ui',
            template: require("./tests/ui.html"),
            title: 'Test UI',
            access: {
                anonymous: true
            }
        });
}]);