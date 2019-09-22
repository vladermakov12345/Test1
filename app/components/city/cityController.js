module.exports = function (app) {
    var cityController = function ($rootScope, $scope, $state, $stateParams, dataFactory, environmentService, utilities, discourseDataService, $window, NgMap, $document) {

        require("./city.less");

        var vm = this;

        vm.env = environmentService();
        vm.providers = [];
        vm.googleMapsUrl = 'https://maps.googleapis.com/maps/api/js?key='+vm.env.google_maps_api_key;
        vm.isPageReady = false;
        vm.cityname = $stateParams.name.replace('_',' ');
        vm.citystate = $stateParams.state.replace('_',' ');
        vm.citycountry = $stateParams.country.replace('_',' ');

        vm.mapCenter = vm.cityname+', '+vm.citystate+', '+vm.citycountry;
        vm.travelresourcesElem = undefined;
        
        vm.init = init;
        vm.getProviders = getProviders;
        vm.getTypeCount = getTypeCount;
        vm.showDirectoryEntryBubble = showDirectoryEntryBubble;
        vm.setupSliderForTravelResources = setupSliderForTravelResources;

        



        vm.breadcrumbs = [];
        vm.latestForumTopics = [];

        
        //  vm.cityname = $stateParams.name;
        //vm.dataExists = false;


        vm.getMainImagePath = getMainImagePath;
        vm.getArticleMainImagePath = getArticleMainImagePath;
        vm.attractionsArticle = {};
        vm.hotelsArticle = {};
        vm.itineraryArticle = {};
        vm.getItineraryImgUrl = getItineraryImgUrl;
        vm.getHotelsImgUrl = getHotelsImgUrl;
        vm.getAttractionsImgUrl = getAttractionsImgUrl;
        vm.getImageCredit = getImageCredit;
        vm.getSlug = getSlug;
        vm.getPreview = getPreview;
        vm.BASEURL_CONTENT = vm.env.BASEURL_CONTENT;
        vm.cityoptions = [];
        vm.goToOtherCity = goToOtherCity;
        vm.setupMetaTags = setupMetaTags;
        vm.loadLatestForumTopics = loadLatestForumTopics;

        //initialize
        vm.init();
        

        //functional definitions
        function init() {

            //populate providers for this city
            vm.getProviders();

            //set breadcrumbs
            vm.breadcrumbs = [
                { isActive: false, title: 'Plan By City', state: 'by-city' },
                { isActive: true, title: vm.cityname + ' - ' + vm.citystate + ' - ' + vm.citycountry }
            ];




            //cities
            // $rootScope.$watch('cities', function (newVal, oldVal) {
            //     vm.cityoptions = $rootScope.cities;
            // });
            var getAllCitiesSuccess = function success(response) {
                vm.cityoptions = response.data;
            };
            var getAlLCitiesError = function error(response) { console.log('no city data found'); };
            dataFactory.getAllCities().then(getAllCitiesSuccess,getAlLCitiesError);

            //get city data
//TODO: why do we need this? if we need, can we have a single call to get cities that is subsequently cached and used session wide?
            // var successFunc = function (response) {
            //     if (!response.data) {
            //         vm.dataExists = false;
            //         return;
            //     }

            //     vm.city = response.data;
            //     vm.dataExists = true;
            // };
            // var errFunc = function (response) {
            //     console.log('no city data found');
            // };
            // dataFactory.getCityByName(vm.cityname).then(successFunc, errFunc);

            //get attractions article for this city
            var successFunc = function (response) {
                vm.attractionsArticle = response.data;
                vm.setupMetaTags();
            };
            var errFunc = function (response) { console.log('no attraction article data found'); };
            dataFactory.getArticleByCityAndType(vm.cityname, 'a').then(successFunc, errFunc);

            //get top hotels article for this city
            successFunc = function (response) { vm.hotelsArticle = response.data; };
            errFunc = function (response) { console.log('no hotels article data found'); };
            dataFactory.getArticleByCityAndType(vm.cityname, 'h').then(successFunc, errFunc);

            //get top itinerary article for this city
            successFunc = function (response) { vm.itineraryArticle = response.data; };
            errFunc = function (response) { console.log('no itinerary article data found'); };
            dataFactory.getArticleByCityAndType(vm.cityname, 'i').then(successFunc, errFunc);

            vm.loadLatestForumTopics();
        }

        function getProviders() {
            var sfunc = function (response) {
                if (!response || !response.data || !response.data.data) {
                    console.warn('no response data from getProvidersByCity.');
                    return;
                }
                vm.providers = response.data.data;

                vm.isPageReady = true;

                vm.setupSliderForTravelResources();

            };
            var efunc = function (response) {
                console.warn('error while retrieving providers by city');
                vm.isPageReady = true;
            };

            //TODO: change use of underscores to hyphens and remove the replace here
            var params = {
                city: $stateParams.name.replace('_',' '),
                state: $stateParams.state.replace('_',' '),
                country: $stateParams.country.replace('_',' ')
            }

            dataFactory.getProviders(params).then(sfunc,efunc);
        }

        function getTypeCount(type) {
            return vm.providers.filter( function(provider) { return provider.type.toLowerCase() === type.toLowerCase(); } ).length;
        }

        $scope.addressFilter = function (directoryEntry) {
            return (directoryEntry.address && directoryEntry.address !== '');
        };


        NgMap.getMap().then(function(map) {
          vm.map = map;
        });

        function showDirectoryEntryBubble(evt, directoryEntryBubble) {
            vm.selectedProvider = directoryEntryBubble;
            vm.map.showInfoWindow('providerInfoWindow', this);
        };

        vm.closeInfoWindow = closeInfoWindow;
        function closeInfoWindow(what) {
            what.map.infoWindows.providerInfoWindow.close();
        }




        function getMainImagePath() {
            if (!vm.cityName) return;
            return vm.BASEURL_CONTENT + '/assets/cities/main/' + vm.city.Name.replace(" ", "") + '_main.jpg';
        }

        function getItineraryImgUrl() {
            return vm.getArticleMainImagePath(vm.itineraryArticle.IntroImage);
        }
        function getHotelsImgUrl() {
            return vm.getArticleMainImagePath(vm.hotelsArticle.IntroImage);
        }
        function getAttractionsImgUrl() {
            return vm.getArticleMainImagePath(vm.attractionsArticle.IntroImage);
        }


        function getArticleMainImagePath(asset) {
            if (!asset) return "";
            return vm.BASEURL_CONTENT + '/Image/GetImage?assetId=' + asset.Id + '&size.Name=medium';
        }

        function getImageCredit(city) {
            switch (city) {
                case 'Atlanta': return '©2013, Gene Phillips, Courtesy of ACVB & AtlantaPhotos.com';
                case 'Orlando': return 'Visit Orlando';
                case 'Las Vegas': return 'Travel Nevada/Photo by Ryan Jerz';
                case 'Miami': return 'Photo courtesy of the GMCVB – http://Miami andBeaches.com';
                case 'New York': return '© NYC & Company/Kate Glicksberg';
                case 'Philadelphia': return 'Photo by G. Widman for Visit Philadelphia';
                case 'Chicago': return '© Choose Chicago';
                case 'Los Angeles': return 'Visit California';
                case 'San Diego': return 'Courtesy Next Level Sailing';
                case 'San Francisco': return 'San Francisco Travel Association';

                case 'Austin': return '';
                case 'Nashville': return 'Photo: Sean Pavone';
                case 'Houston': return '';
                case 'New Orleans': return 'Blaine Kern\'s Mardi Gras World and NewOrleansOnline.com';
                case 'Washington DC': return '';
                case 'Dallas': return '';
                case 'Seattle': return '';
                case 'Boston': return '';
                case 'Denver': return 'Photo: Stevie Crecelius/Visit Denver';
                case 'Charleston': return 'Visions Of America LLC';

                default: return '';
            }
        }

        function getPreview(text) {
            if (!text) return "";
            var s = text.split(" ");
            var p = s.splice(0, 55);
            var j = p.join(" ");
            if (s.length > 0) {
                j += '...';
            }
            return j;
        }

        function goToOtherCity() {
            if (!vm.selectedCity || vm.selectedCity === '') return;
            $state.go('city', { name: vm.selectedCity.replace(' ','_') });
        }

        function getSlug(cityName) {
            return vm.cityName;
        }

        function setupMetaTags() {
            var title = 'Accessible travel inspiration ' + utilities.getEndash() + ' ' + vm.cityname;
            var twoSentences = '';

            //use first 2 sentences of the article
            var idxAtEndOfSecondSentence = utilities.getNthIndex(vm.attractionsArticle.IntroText,'.',2);
            if (idxAtEndOfSecondSentence>0) {
                twoSentences = vm.attractionsArticle.IntroText.substring(0,idxAtEndOfSecondSentence+1);
                twoSentences = twoSentences.replace('<p>','');
                twoSentences = twoSentences.replace('</p>','');
            }
            
            var img = vm.getMainImagePath();
            $rootScope.metaTagService.setup({
                metaTitle: title,
                metaDescription: twoSentences,
                ogTitle: title,
                ogDescription: twoSentences,
                ogImage: img,
                twitterTitle: title,
                twitterDescription: twoSentences,
                twitterImage: img,
                twitterImageAlt: title,
            });
        }

        function loadLatestForumTopics() {
            var sFunc = function(response) {
                if (!response.data || !response.data || !response.data.data) {
                    console.log('unable to load latest forum topics');
                    return;
                }
                vm.latestForumTopics = response.data.data.topics;
            }
            var eFunc = function(err) {
                console.log('error while fetching latest forum topics: ' + err);
            }
            discourseDataService.getLatest().then(sFunc,eFunc);
        }

        function setupSliderForTravelResources() {
            angular.element(document).ready(function () {
                vm.travelresourcesElem = angular.element('.travelresources');
                vm.travelresourcesArgs = {
                    dots: true,
                    slidesToShow: 2,
                    appendArrows: '.travelresources-nav',
                    appendDots: '.travelresources-nav',
                    //adaptiveHeight: true,
                    responsive: [
                        {
                            breakpoint: 9999,
                            settings: "unslick"
                            // settings: {
                            //     slidesToShow: 3,
                            //     centerMode: true,
                            //     slidesToScroll: 1

                            // }
                        },
                        {
                            breakpoint: 8888,
                            settings: {
                                slidesToShow: 5,
                                centerMode: true,
                                slidesToScroll: 1,
                                infinite: false

                            }
                        },
                        {
                            breakpoint: 760,
                            settings: {
                                slidesToShow: 3,
                                centerMode: false,
                                slidesToScroll: 1,
                                infinite: false

                            }
                        },
                        {
                            breakpoint: 576,
                            settings: {
                                centerMode: false,
                                slidesToShow: 2,
                                slidesToScroll: 1,
                                infinite: false
                            }
                        }
                    ]
                };
                vm.travelresourcesElem.not('.slick-initialized').slick(vm.travelresourcesArgs);

                angular.element(window).on('resize', function() {
                    //if (angular.element(window).width() < 760) {
                        vm.travelresourcesElem.not('.slick-initialized').slick(vm.travelresourcesArgs);
                    //} else {
                        //vm.numVisible = vm.defaultNumVisible;
                        //$scope.$apply();
                    //}
                });

                //hack to get initial state showing
                vm.showType = $stateParams.type;
                $scope.$apply();

                //hack to get ng-click working with slick carousel
                $('button').on('click', function (xyz) {
                    if (!xyz || !xyz.currentTarget || !xyz.currentTarget.attributes || !xyz.currentTarget.attributes.id) {
                        return;
                    }

                    var transitionOptions = {
                        notify: false
                    };
                    var buttonId = xyz.currentTarget.attributes.id.value;
                    switch (buttonId) {
                        case 'buttonAttractions': {
                            //$state.go('city',{name: vm.cityname, state: vm.citystate, country: vm.citycountry, type: 'attractions' });
                            $state.transitionTo('city',{name: vm.cityname, state: vm.citystate, country: vm.citycountry, type: 'attractions' }, transitionOptions);
                            vm.showType='attractions';
                            $scope.$apply();
                            break;
                        };
                        case 'buttonEquipmentRental': {
                            //$state.go('city',{name: vm.cityname, state: vm.citystate, country: vm.citycountry, type: 'equipment rental' });
                            $state.transitionTo('city',{name: vm.cityname, state: vm.citystate, country: vm.citycountry, type: 'equipment rental' }, transitionOptions);
                            vm.showType='equipment rental';
                            $scope.$apply();
                            break;
                        };
                        case 'buttonTransportation': {
                            //$state.go('city',{name: vm.cityname, state: vm.citystate, country: vm.citycountry, type: 'transportation' });
                            $state.transitionTo('city',{name: vm.cityname, state: vm.citystate, country: vm.citycountry, type: 'transportation' }, transitionOptions);
                            vm.showType='transportation';
                            $scope.$apply();
                            break;
                        };
                        case 'buttonTourCompanies': {
                            //$state.go('city',{name: vm.cityname, state: vm.citystate, country: vm.citycountry, type: 'tour companies' });
                            $state.transitionTo('city',{name: vm.cityname, state: vm.citystate, country: vm.citycountry, type: 'tour companies' }, transitionOptions);
                            vm.showType='tour companies';
                            $scope.$apply();
                            break;
                        };
                        case 'buttonCaregiverAgencies': {
                            //$state.go('city',{name: vm.cityname, state: vm.citystate, country: vm.citycountry, type: 'tour companies' });
                            $state.transitionTo('city',{name: vm.cityname, state: vm.citystate, country: vm.citycountry, type: 'caregiver agencies' }, transitionOptions);
                            vm.showType='caregiver agencies';
                            $scope.$apply();
                            break;
                        };
                    }
                    //console.log('link executed', $(this).data('id'));
                });

            });
        }

        // $scope.slickOnInit = function(){
        //   $scope.refreshing=true;
        //   $scope.$apply();
        //   $scope.refreshing=false;
        //   $scope.$apply();
        // };
    };

    cityController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'dataFactory', 'environmentService', 'utilities', 'discourseDataService', '$window','NgMap','$document'];
    app.controller('cityController', cityController);
};
