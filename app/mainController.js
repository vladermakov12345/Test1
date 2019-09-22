(function() {
    var mainController = function ($rootScope, $state, globalConstants, $scope, dataFactory, $http, authService, loginModalService, joinModalService,$window,$timeout,$interval,$document,$location, $anchorScroll,metaTagService,localStorageService,userService,environmentService, dataLayerService) {

        var vm = this;
        vm.env = environmentService();
        vm.dataLayerService = dataLayerService;

        vm.init = init;
        vm.userProfile = {};
        vm.userService = userService;
        vm.onDocumentDone = onDocumentDone;
        vm.isUserAuthenticated = false;
        vm.outputPath = '/english/';
        vm.currentYear = new Date().getFullYear();
        vm.toggle = toggle;
        vm.isActive=false;
        $rootScope.isVanilla = false;   //for headerless/footerless views (ex social login redir)
        $rootScope.env = environmentService();

        //join / sign in / sign out
        vm.showJoinModal = showJoinModal;
        vm.showLoginModal = showLoginModal;
        vm.mobileLogin = mobileLogin;
        vm.mobileJoin = mobileJoin;

        //other go tos
        vm.goToMyAccount = goToMyAccount;
        vm.goToReview = goToReview;
        vm.goToclubGO = goToclubGO;
        vm.goToForum = goToForum;
        vm.goVoteInTheForum = goVoteInTheForum;
        vm.goToProviderDetail = goToProviderDetail;

        //dynamic loading of 3rd party scripts
        vm.isProd = isProd;

        //vm.loadAnalytics = loadAnalytics;
        vm.loadGoogleSiteTag = loadGoogleSiteTag;
        vm.loadFacebookSDK = loadFacebookSDK;
        vm.loadMaps = loadMaps;
        vm.loadTagManager = loadTagManager;
        vm.loadHotJar = loadHotJar;
        vm.loadFacebookPixel = loadFacebookPixel;
        vm.loadSessionStack = loadSessionStack;
        vm.loadBrowserUpdate = loadBrowserUpdate;
        vm.signout = signout;

        //verification email
        vm.userNeedsToSendVerificationEmail = false;
        vm.isSendVerificationEmailClicked = false;
        vm.sendVerificationEmail = sendVerificationEmail;
        vm.sendVerificationEmailResponse = '';

        //preload data
        //dataFactory.getPartnerData().then(angular.noop);
            
        angular.element(document).ready(function() {

            //load 3rd party scripts in a non-blocking fashion!
            vm.loadHotJar();
            vm.loadFacebookPixel();
            vm.loadFacebookSDK();
            vm.loadMaps();
            vm.loadGoogleSiteTag();
            //vm.loadAnalytics();
            vm.loadTagManager();
            vm.loadSessionStack();

        });




        var browserUpdate = require('browser-update');

        window.onscroll = function() { scrollFunction(); };
        function scrollFunction() {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                document.getElementById("backToTop_Btn").style.display = "block";
                document.getElementById("backToTop_Btn").setAttribute("aria-expanded",true);
            } else {
                document.getElementById("backToTop_Btn").style.display = "none";
                document.getElementById("backToTop_Btn").setAttribute("aria-expanded",false);
            }
        }

        $scope.backToTopFun= function backToTopFun() {
            $("html, body").animate({ scrollTop: 0 }, 'slow');
        };

        $scope.scrollTo = function(elementIdToScrollTo) {
            $anchorScroll.yOffset = 80;   // always scroll by 50 extra pixels
            $location.hash(elementIdToScrollTo);

            //scroll
            $anchorScroll();

            //set focus
            $timeout(function() {
                var element = $window.document.getElementById(elementIdToScrollTo);
                if(element)
                  element.focus();
            });
        };

        //initialization
        vm.init();
      
        //auth0 badge
        //http://stackoverflow.com/questions/37671342/how-to-load-image-files-with-webpack-file-loader

        // vm.image_searchWhite = require("../resources/img/header/search_white.png");
        // vm.image_accessibilityNegative = require("../resources/img/header/accessibility_negative.png");

        // vm.image_phone = require("../resources/img/common/footer_phone.png");

        // vm.image_netsolsiteseal = require("../resources/img/common/netsolsiteseal.png");

        // vm.CloseMobileNav=require("../resources/img/header/close_icon.png");

        // vm.image_menuPlan = require("../resources/img_new/header/plan.png");
        // vm.image_menuReserve = require("../resources/img_new/header/reserve.png");
        // vm.image_menuShare = require("../resources/img_new/header/share.png");


        // // New images

        // vm.image_logoWhite = require("../resources/img_new/logo/logo-white.png");
        // vm.image_search = require("../resources/img_new/header/search.png");
        // vm.image_searchBlack = require("../resources/img_new/header/search-black.png");
        // vm.image_flagUk = require("../resources/img_new/header/uk-flag.png");
        // vm.image_caretDownGray = require("../resources/img_new/header/caret-down-gray.png");
        // vm.image_arrowUp = require("../resources/img_new/header/arrow-up.png");
        // vm.image_winnerBadge = require("../resources/img_new/jumbotron/badge.png");
        // vm.image_newYork = require("../resources/img_new/cities/new-york.jpg");
        // vm.image_atlanta = require("../resources/img_new/cities/atlanta.jpg");
        // vm.image_sanDiego = require("../resources/img_new/cities/san-diego.jpg");
        // vm.image_orlando = require("../resources/img_new/cities/orlando.jpg");
        // vm.image_lasVegas = require("../resources/img_new/cities/las-vegas.jpg");
        // vm.image_paris = require("../resources/img_new/cities/paris.jpg");


        //contrast toggle
        var contrastButton = angular.element('.switcher input[type="button"]');
        contrastButton.click(function(){
            contrastButton.removeClass('active');
            angular.element(this).addClass('active');
        });

        //-- site seal
        vm.openSiteSeal = openSiteSeal;
        function openSiteSeal() {
            var host = 'https://accessiblego.com';  //location.host;
            var type = 'NETEV';
            var mode = window.location.protocol.toLowerCase()=== "https:"? "https:" : "http:";
            var baseUrl = mode+"//seals.networksolutions.com/siteseal_seek/siteseal?v_shortname="+type+"&v_querytype=W&v_search="+host+"&x=5&y=5";
            window.open(baseUrl,type,'width=450,height=500,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,copyhistory=no,resizable=no');
        }

        vm.colseMobileNav = colseMobileNav;
        function colseMobileNav() {
            vm.isActive=false;
            
            //collapse navbar
            $('#navbarSupportedContent').collapse('hide');
            $scope.isCollapsed = true;
        }

        vm.collapseMobileNav = collapseMobileNav;
        function collapseMobileNav() {
            $('#xsnav').collapse('hide');
        }
        // var $script = require("scriptjs");
        // $script("//seal.networksolutions.com/siteseal/javascript/siteseal.js", function() {
        //   console.log('downloaded siteseal');
        // });

        function init() {

            //initialize global reference to meta tag service
            $rootScope.metaTagService = metaTagService;

            //subscribe to authentication changes
            $rootScope.$on('user-data-cleared', function() {
                vm.userProfile = $rootScope.userProfile;
                //?? $state.go('signin');
            });
            $rootScope.$on('user-data-reset', function() {
                //$rootScope.userProfile = localStorageService.getUserProfile();
                vm.userProfile = $rootScope.userProfile;
            });

            //reinstate user session upon site re-entry
            localStorageService.resetRootScope(true);
            
            //default global parameters
            $scope.MODE_DEBUG = false;
            $scope.APIARY_URLBASE = 'http://private-78d01-kidazzo.apiary-mock.com';

            //google analytics
            if (vm.env.name === 'production') {
                //removing as per Daniel
                //$window.ga('create', 'UA-90166712-1', 'auto');
            }

            //fb: must called to finish the easy fb module initialization process
            //$window.fbAsyncInit = ezfbAsyncInit;

            // $window.fbAsyncInit = function() {
            //     FB.init({
            //       appId      : '276779086068509',
            //       cookie     : true,
            //       xfbml      : true,
            //       version    : 'v3.0'
            //     });
            //     FB.AppEvents.logPageView();
            // };

            //set first tab
            vm.onDocumentDone();

            //auth0
            //vm.isUserAuthenticated();

            //supported browser?
            setTimeout(function () {
                vm.loadBrowserUpdate();
            },1000);
        }



        $rootScope.$watch('isAuthenticated', function(newVal,oldVal) {
            //only show if user is logged in
            if (newVal!==true) {
                vm.userNeedsToSendVerificationEmail = false;
                return;
            }

            //determine if user needs to send verification email
            if (localStorageService.getAuthenticationState()) {
                var profile = localStorageService.getUserProfile();
                if (profile.email && profile.email_verified === false &&  profile.sub.startsWith('auth0')) {
                    vm.userNeedsToSendVerificationEmail = true;
                }
            }
        });

        angular.element(document).mouseup(function(e) {
            var container = angular.element('#navbarSupportedContent');
            if (!container.is(e.target) && container.has(e.target).length === 0)
            {
                container.removeClass('show');
            }
        });


        function toggle(){
             vm.isActive=!vm.isActive;
             vm.colseMobileNav();
         }
        //global: update focused elements
        // $scope.updateFocusElement = function() {
        //     $scope.focusedItemName = angular.element(window.document.activeElement).attr('id');
        //     //$scope.focusedItemName1 = angular.element($document[0].activeElement).attr('id');

        //     if ($scope.focusedItemName === 'bodyElement')
        //     {
        //         $scope.closeDisplaySearch();
        //         $scope.closeTextOptions();
        //         $scope.closeContrastOptions();
        //     }
        // };

        $scope.CurrentState = function (s) {
            return $state.current.name == s;
        };

        //expandable areas
        $scope.isDisplaySearch = false;
        $scope.isDisplayText = false;
        $scope.isDisplayContrast = false;
        $scope.isDisplaySearch = false;
        $scope.navBarSearchForm = {
            searchString: ''
        };

        $scope.showSearch = function () {
            $scope.isDisplaySearch = !$scope.isDisplaySearch;
            $scope.isDisplayText = false;
            $scope.isDisplayContrast = false;
        };
        $scope.showTextOptions = function () {
            $scope.isDisplaySearch = false;
            $scope.isDisplayText = !$scope.isDisplayText;
            $scope.isDisplayContrast = false;
        };
        $scope.showContrastOptions = function () {
            $scope.isDisplaySearch = false;
            $scope.isDisplayText = false;
            $scope.isDisplayContrast = !$scope.isDisplayContrast;
        };


        //expandable areas: text
        $scope.textSizeOption = 'small';
        $scope.setBaseTextSize = function(textSizeOption) {
            $scope.textSizeOption = textSizeOption;
            $scope.closeTextOptions();
               vm.isActive=false;
        
            //set focus
            $timeout(function() {
                var element = $window.document.getElementById("header-nav-right-text");
                if(element)
                  element.focus();
              });
        };

        //expandable areas: constrast
        $scope.colorTheme = 'default';
        $scope.setColorTheme = function(colorTheme) {
               vm.isActive=false;

            $scope.colorTheme = colorTheme;
            $scope.closeContrastOptions();
        };

        //search
        $scope.openDisplaySearch = function() {
            $scope.toggleDisplaySearch();
            $scope.isDisplayText = false;
            $scope.isDisplayContrast = false;
            if($scope.isDisplaySearch){
                $timeout(function() {
                    var element = $window.document.getElementById("header-wrapper-expanded-search-text");
                    if(element)
                        element.focus();
                });
            }
        };

        $scope.closeDisplaySearch = function() {
            if ($scope.isDisplaySearch)
                $scope.isDisplaySearch = false;
        };
        $scope.toggleDisplaySearch = function() {
            $scope.isDisplaySearch = !$scope.isDisplaySearch;
        };
        $scope.moveToDisplayText = function() {
            //$scope.closeDisplaySearch();
            $scope.openTextOptions();
        };
        $scope.navBarSearchClick = function () {
          if (!$scope.navBarSearchForm.searchString) {
              return;
          }
          $scope.toggleDisplaySearch();
          $state.go('searchResult', { searchText: $scope.navBarSearchForm.searchString }, {reload: true});
            $scope.navBarSearchForm.searchString = '';
        };

        $scope.handleKeyPress = function ($event) {
            var keyCode = $event.which || $event.keyCode;
            if (keyCode === 13) {
                $scope.navBarSearchClick();
            }
        };

        //text
        $scope.openTextOptions = function() {
            if ($scope.isDisplayText) {

                $scope.closeTextOptions();
                return;
            }
            $scope.isDisplayText = true;
            $scope.isDisplayContrast = false;
            $scope.isDisplaySearch = false;

            $timeout(function() {
                var element = $window.document.getElementById("textInputOption1");
                if(element)
                  element.focus();
              });
        };
        $scope.closeTextOptions = function() {
            if ($scope.isDisplayText)
                $scope.isDisplayText = false;
        };
        $scope.moveToDisplayContrast = function() {
            $scope.closeTextOptions();
            $scope.openContrastOptions();
        };

        vm.goToSearchResultPage = goToSearchResultPage;
        function goToSearchResultPage(){
              vm.isActive=false;
              var getSearchText= document.getElementById('searchTextID').value;
              if(getSearchText)
              {
                document.getElementById('searchTextID').value="";
                $state.go('searchResult', { searchText: getSearchText.replace(/ /g,'_') });
              }
        }

        //contrast
        $scope.openContrastOptions = function() {
            if ($scope.isDisplayContrast) {
                $scope.closeContrastOptions();
                return;
            }
            $scope.isDisplayText = false;
            $scope.isDisplayContrast = true;
            $scope.isDisplaySearch = false;

            $timeout(function() {
                var element = $window.document.getElementById("contrastOption1");
                if(element)
                  element.focus();
              });
        };
        $scope.closeContrastOptions = function() {
            if ($scope.isDisplayContrast)
                $scope.isDisplayContrast = false;
        };

        //next tab event
        $scope.broadcastTabEvent = function() {
            $rootScope.$broadcast('tabEventFired');
        };

        vm.company_name = globalConstants.company_name;
        //this.token = getAuthorizationToken();
        //alert('the token is: ' + this.token);
        //$http.defaults.headers.common.__RequestVerificationToken

        vm.dothis = function() {
            getAuthorizationToken();
        };

        //$scope.dothis = function() {
        //    alert('ok');
        //    console('ok');
        //};
        //
        //var dothis = function() {
        //    alert('this is how you do it!');
        //    console('this is how you do it!');
        //};

        function mobileLogin() {
            vm.toggle();
            vm.showLoginModal();
        }

        function mobileJoin() {
            vm.toggle();
            vm.showJoinModal();
        }

        function showLoginModal() {
            loginModalService();
        }

        function showJoinModal() {
            joinModalService();
        }


        //--- APP WIDE :: GO TO ---//
        function goToMyAccount() {
            $state.go('mytrips');
        }

        function goToReview() {
            $state.go('review');
        }

        function goToclubGO() {
            $location.url = 'clubGO.accessiblego.com';
        }

        function goToForum() {
            var forumUrl = vm.env.FORUM_URL;
            if (localStorageService.getAuthenticationState()) {
                forumUrl+= '/session/sso?return_path=/';
            }
            $window.open(forumUrl,'_self');
        }

        function goVoteInTheForum() {
            var url = 'https://community.accessiblego.com/c/vote-on-new-ideas-for-accessiblego';
            $window.open(url, '_tab_voteOnNewIdeas');
        }

        function goToProviderDetail(slug) {
            if (!slug) {
                console.warn('cannot move to provider page :: no slug provided');
                return;
            }
            $state.go('provider',{slug: slug});
        }





        function getAuthorizationToken() {
            dataFactory.test()
                //these will be deprecated
                //.success(function (data) {
                //    console.log('retrieved token');
                //})
                //.error(function (data, status, headers, config) {
                //    console.log('error while getting token');
                //})
                .then(function (response) {
                    console.log(response);
                    alert(response.data.a);

                    var self = this;

                    //map is for calling a function once for each element in an array
                    //return response.data.map(function (item) {
                    //    return item.token;
                    //});

                    //todo: validate
                    //redefine selected
                    ////self.token = response.data.map(function (repo) {
                    ////    return { value: repo.token };
                    ////});
                    //angular.forEach(response.data, function (p) {
                    //    p.selected = $scope.formData.provider == p.label;
                    //});
                    //assign
                    //self.repos = response.data.map(function (repo) {
                    //    var icon = getIcon(repo.category);
                    //    var p = { category: repo.category, label: repo.label, icon: icon };
                    //    return p;
                    //});
                }, function (error) {
                    $scope.status = 'Unable to get token: ' + error.message;
                });
        }

        
        function signout() {
            //event.preventDefault();
            //$rootScope.authService.logout();

            var signoutAuthRedirect = function(response) {
                // sign user out of auth0
                var url = 'https://'+vm.env.auth0_spa_domain+'/v2/logout?returnTo='+vm.env.auth0_redir_base+'/signout&client_id='+vm.env.auth0_spa_clientId;
                $window.open(url,'_self');
            };

            // sign user out of the forum
            dataFactory.signout().then(signoutAuthRedirect,signoutAuthRedirect);
        }

        function sendVerificationEmail() {

            //avoid multiple calls
            var removeButtonFunc = function() {
                vm.isSendVerificationEmailClicked = true;
            }

            //user id
            var profile = localStorageService.getUserProfile();
            if (!profile) {
                vm.sendVerificationEmailResponse = "Please log in and retry.";
            }

            var successFunc = function (result) {
                removeButtonFunc();

                //handle fail
                if (result.data.status === 'fail') {
                    vm.sendVerificationEmailResponse = "Unable to send verification email.";
                    return;
                }

                vm.sendVerificationEmailResponse = "Verification email sent! Please check for email from contact@accessiblego.com";
                
            };

            var errFunc = function (errObj) {
                console.log(errObj);
                removeButtonFunc();
                vm.sendVerificationEmailResponse = "Error occurred while sending verification email.";
            };
            
            dataFactory.sendVerificationEmail().then(successFunc,errFunc);
        }
        // function signoutMobile() {
        //     vm.signout();
        //     vm.toggle();
        // }


        // function isUserAuthenticated() {
        //     // Verify that there's a token in localStorage
        //     var token = localStorage.getItem('accessToken');
        //     if (token) {
        //         $rootScope.isAuthenticated = true;
        //     } else {
        //         $rootScope.isAuthenticated = false;
        //     }
        //     return $rootScope.isAuthenticated === true;
        // }

        //todo: authorization bearer should only be sent with API request
        // $rootScope.$watch('isAuthenticated', function(newVal,oldVal) {
        //     vm.isUserAuthenticated = newVal;
        //     if (newVal) {
        //       $http.defaults.headers.common.Authorization = 'Bearer ' + localStorageService.getAccessToken();
        //     } else {
        //       $http.defaults.headers.common.Authorization = '';
        //     }
        // });

        function onDocumentDone() {
            $(function() {
                $('#firstFocus').attr("tabIndex", -1);
                $('#firstFocus').focus();
            });
        }


        //---------------------------//
        //--- 3rd party scripts -----//
        //---------------------------//
        function isProd() {
            return (vm.env.name === 'production');
        }

        // unsupported browser notification (https://browser-update.org/customize.html)
        //test: append #test-bu
        function loadBrowserUpdate() {
            var config = {

                //required browser versions
                required: globalConstants.browserSupport,
                // required: {
                //     e:-6,
                //     f:-3,
                //     o:-3,
                //     s:-2,
                //     c:-4
                // },

                style: 'top',

                //insecure:true,
                //unsupported:true,

                //after how many hours should message reappear (0=all the time)
                reminder:0,
                
                //version of browser-update api (do not remove)
                api:2018.10,

                //opens link in a new window/tab
                newwindow: true,

                //do not show the ignore button
                noclose:false,

                //do not give the user the option to permanently hide the notification
                no_permanent_hide:true,

                //custom message
                text: '<span style=\'font-weight:bold;\'>Your browser ({brow_name}) is out of date:</span><br/>Update your browser for more security, speed and the best experience on accessibleGO.com.<br/><a{up_but}>update</a> or <a{ignore_but}>ignore</a><br/><a href="supported-browsers">(See what browsers are supported by accessibleGO)</a>'
            };
            browserUpdate(config);
        }

        function loadSessionStack() {

            // //jira customer service widget
            // var jiraWidget = document.createElement('script');
            // jiraWidget.setAttribute("async","async");
            // jiraWidget.setAttribute("data-jsd-embedded","data-jsd-embedded");
            // jiraWidget.setAttribute("data-base-url","https://jsd-widget.atlassian.com");
            // jiraWidget.setAttribute("data-key","cf2cede8-6ce1-4abf-8304-df1c2e17ac1f");
            // jiraWidget.setAttribute("src","https://jsd-widget.atlassian.com/assets/embed.js");
            // document.head.insertAdjacentElement('afterbegin', jiraWidget);   //angular.element('head')[0]


            if (!vm.isProd()) return;

            var scriptElement = document.createElement('script');
            var js = '' +
                '!function(a,b){var c=window;c.SessionStackKey=a,c[a]=c[a]||{t:b,' +
                'q:[]};for(var d=["start","stop","identify","getSessionId","log"],e=0;e<d.length;e++)!function(b){' +
                'c[a][b]=c[a][b]||function(){c[a].q.push([b].concat([].slice.call(arguments,0)));' +
                '}}(d[e]);var f=document.createElement("script");f.charset="utf-8";f.async=1;f.src="https://cdn.sessionstack.com/sessionstack.js";' +
                'var g=document.getElementsByTagName("script")[0];g.parentNode.insertBefore(f,g);' +
                '}("SessionStack","ef4ed9d0b63245c6be8e1290cccacef9");';

                //sentry integration
                //'SessionStack.getSessionId(function(s){s&&Raven.setDataCallback(function(t){return t' +
                //'.contexts=t.contexts||{},t.contexts.sessionstack={session_id:s,timestamp:(new Date).' +
                //'getTime()},t})});';
            var inlineScript = document.createTextNode(js);
            scriptElement.appendChild(inlineScript);
            document.head.insertAdjacentElement('afterbegin', scriptElement);
            //var scriptTag = angular.element(scriptElement);
            //scriptTag.text(js);
            //angular.element('head').append(scriptTag);
        }

        //Global site tag (gtag.js) - Google Analytics
        function loadGoogleSiteTag() {
            if (!vm.isProd()) return;

            var scriptElementConfig = document.createElement('script');
            var js = 'window.dataLayer = window.dataLayer || [];' +
                     'function gtag(){dataLayer.push(arguments);}' +
                     'gtag(\'js\', new Date());' +
                     'gtag(\'config\', \'UA-90166712-1\', { \'send_page_view\': false });';
            var inlineScript = document.createTextNode(js);
            scriptElementConfig.appendChild(inlineScript);
            document.head.insertAdjacentElement('afterbegin', scriptElementConfig); //angular.element('head')[0]

            var scriptElementGTag = document.createElement('script');
            scriptElementGTag.setAttribute("async","async");
            //scriptElementGTag.setAttribute("crossorigin","anonymous");
            scriptElementGTag.setAttribute("src","https://www.googletagmanager.com/gtag/js?id=UA-90166712-1");
            document.head.insertAdjacentElement('afterbegin', scriptElementGTag);   //angular.element('head')[0]
        }

        // function loadAnalytics() {
        //     if (!vm.isProd()) {
        //         $window.ga=function(arg1,arg2,arg3,arg4,arg5) {
        //             console.log('ga not called b/c we are not prod: ' + [arg1,arg2,arg3,arg4,arg5]);
        //         };
        //         return;
        //     }

        //     var scriptElement = document.createElement('script');
        //     //var jsScript = 'window.onload = function () {' +
        //     var jsScript = '(function (i, s, o, g, r, a, m) {' +
        //                 'i["GoogleAnalyticsObject"] = r; i[r] = i[r] || function () {' +
        //                 '(i[r].q = i[r].q || []).push(arguments)' +
        //                 '}, i[r].l = 1 * new Date(); a = s.createElement(o),' +
        //                 'm = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)' +
        //                 '})(window, document, "script", "https://www.google-analytics.com/analytics.js", "ga");';
        //    //'};';
        //     var inlineScript = document.createTextNode(jsScript);
        //     scriptElement.appendChild(inlineScript);
        //     document.head.insertAdjacentElement('afterbegin', scriptElement);
        //     //document.head.appendChild(script);
        // }

        function loadTagManager() {
            if (!vm.isProd()) return;

            var scriptElement = document.createElement('script');
            var js = "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TQZ2PHB');";
            var inlineScript = document.createTextNode(js);
            scriptElement.appendChild(inlineScript);
            document.head.insertAdjacentElement('afterbegin', scriptElement);   //angular.element('head')[0]
        }

        function loadFacebookSDK() {
            if (!vm.isProd()) return;

            var scriptElement = document.createElement('script');
            //var jsScript = 'window.onload = function () {' +
            var jsScript = '(function(d, s, id) {' +
                'var js, fjs = d.getElementsByTagName(s)[0];' +
                'if (d.getElementById(id)) return;' +
                'js = d.createElement(s); js.id = id;' +
                'js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0&appId='+ vm.env.fb_app_id +'&autoLogAppEvents=1";' +
                'fjs.parentNode.insertBefore(js, fjs);' +
                '}(document, "script", "facebook-jssdk"));';
            //'};';
            var inlineScript = document.createTextNode(jsScript);
            scriptElement.appendChild(inlineScript);
            //document.head.appendChild(scriptElement);
            document.head.insertAdjacentElement('afterbegin', scriptElement);   //angular.element('head')[0]
        }

        function loadFacebookPixel() {
            if (!vm.isProd()) return;

            var scriptElement = document.createElement('script');
            var jsScript = '!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?' +
            'n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;' +
            'n.push=n;n.loaded=!0;n.version=\'2.0\';n.queue=[];t=b.createElement(e);t.async=!0;' +
            't.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,' +
            'document,\'script\',\'https://connect.facebook.net/en_US/fbevents.js\');' +
            'fbq(\'init\', \'312392209172643\');' +
            'fbq(\'track\', \'PageView\');';
            var inlineScript = document.createTextNode(jsScript);
            scriptElement.appendChild(inlineScript);
            document.head.insertAdjacentElement('afterbegin', scriptElement);   //angular.element('head')[0]
        }

        function loadMaps() {
            //var scriptElement = document.createElement('script');
            //scriptElement.setAttribute("async","async");
            //scriptElement.setAttribute("type","text/javascript");
                //scriptElement.setAttribute("crossorigin","anonymous");
                //scriptElement.setAttribute("src","https://maps.google.com/maps/api/js?key=" + vm.env.google_maps_api_key); //http://maps.google.com/maps/api/js?sensor=false&callback=gMapsCallback");
            //scriptElement.setAttribute("src","https://maps.googleapis.com/maps/api/js?key=" + vm.env.google_maps_api_key);  // + '&libraries=geometry'); //http://maps.google.com/maps/api/js?sensor=false&callback=gMapsCallback");
            //document.head.insertAdjacentElement('afterbegin', scriptElement);   //angular.element('head')[0]
                //(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptElement);
                //document.head.appendChild(scriptElement);
        }

        function loadHotJar() {
            if (!vm.isProd()) return;

            var scriptElement = document.createElement('script');
            var jsScript = '' +
                '(function(h,o,t,j,a,r){' +
                '    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};' +
                '    h._hjSettings={hjid:1004038,hjsv:6};' +
                '    a=o.getElementsByTagName(\'head\')[0];' +
                '    r=o.createElement(\'script\');r.async=1;' +
                '    r.crossorigin=\'anonymous\';' +
                '    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;' +
                '    a.appendChild(r);' +
                '})(window,document,\'https://static.hotjar.com/c/hotjar-\',\'.js?sv=\');';
            var inlineScript = document.createTextNode(jsScript);
            scriptElement.appendChild(inlineScript);
            document.head.insertAdjacentElement('afterbegin', scriptElement);   //angular.element('head')[0]
        }

    };

    mainController.$inject = ['$rootScope','$state','globalConstants','$scope','dataFactory','$http', 'authService','loginModalService', 'joinModalService','$window','$timeout','$interval','$document','$location', '$anchorScroll','metaTagService','localStorageService','userService','environmentService','dataLayerService'];
    angular.module('app').controller('mainController', mainController);
})();


//public string GetAntiForgeryToken()
//{
//    string cookieToken, formToken;
//    AntiForgery.GetTokens(null, out cookieToken, out formToken);
//    return cookieToken + ":" + formToken;
//}
