module.exports = function (app) {
    var businessIndividualController = function ($rootScope, $stateParams, dataFactory, $scope, NgMap, $state, $window, environmentService, guid, utilities) {
        var vm = this;
        vm.env = environmentService();

        //vm.dirId = $stateParams.dirId;
        vm.init = init;
        vm.city = $stateParams.city.replace('_', ' ');
        vm.type = $stateParams.type.replace('_', ' ');   //%20');
        vm.category = $stateParams.category;
        vm.slug = $stateParams.slug;

        vm.directories = [];
        vm.resultsCount = 0;
        vm.cityoptions = [];
        vm.listing = {};

        vm.individualDirectoryInfo = [];
        //vm.overAllRating = overAllRating;

        vm.ATTRACTIONS = 'Attractions';
        vm.ITINERARIES = 'Itineraries';
        vm.MUSEUMS_GARDENS = 'Museums_and_Galleries';
        vm.SHOPPING = 'Shopping';
        vm.RESTAURANTS_BARS = 'Restaurants_and_Bars';
        vm.THEATER_CINEMA_MUSIC = 'Theater_Cinema_and_Music';
        vm.ZOOS_AQUARIUMS = 'Zoos_and_Aquariums';
        vm.THEMEPARKS_RIDES = 'Theme_Parks_and_Rides';
        vm.LANDMARKS = 'Landmarks';
        vm.PARKS_OUTDOORS = 'Parks_and_Outdoors';
        vm.EXTREMESPORTS_ADVENTURE = 'Extreme_Sports_and_Flying';

        vm.setCategory = setCategory;
        vm.isCatSelectedMuseumsGardens = isCatSelectedMuseumsGardens;
        vm.isCatSelectedShopping = isCatSelectedShopping;
        vm.isCatSelectedRestaurantsBars = isCatSelectedRestaurantsBars;
        vm.isCatSelectedTheaterCinemaMusic = isCatSelectedTheaterCinemaMusic;
        vm.isCatSelectedZoosAquariums = isCatSelectedZoosAquariums;
        vm.isCatSelectedThemeParksRides = isCatSelectedThemeParksRides;
        vm.isCatSelectedLandMarks = isCatSelectedLandMarks;
        vm.isCatSelectedParksOutdoors = isCatSelectedParksOutdoors;
        vm.isCatSelectedExtremeSportsAdventure = isCatSelectedExtremeSportsAdventure;

        vm.setEmail = setEmail;
        vm.breakOnComma = breakOnComma;

        vm.articleboxes = [];
        vm.itinerary = {};
        vm.handleIfItinerary = handleIfItinerary;
        vm.getPreview = getPreview;
        vm.categoryOptions = [];
        vm.hasArticlesForCity = hasArticlesForCity;

        //reviews
        vm.reviews = [];
        vm.getBusinessReviews = getBusinessReviews;
        vm.isWaitingReviews = true;

        //tracking
        vm.trackOutboundClick = trackOutboundClick;

        vm.init();

        require("./businessIndividual.less");
        vm.dayTripperToursPhoto = require("../../../../resources/img/businessIndividual/no_image.png");
        vm.userPhotos= require("../../../../resources/img/businessIndividual/no_image.png");
        vm.reviewImg=require("../../../../resources/img/businessIndividual/img1.jpg");

        //initialiation
        function init() {

            //cities
            // $rootScope.$watch('cities', function (newVal, oldVal) {
            //     vm.cityoptions = $rootScope.cities;
            // });
            var getAllCitiesSuccess = function success(response) {
                vm.cityoptions = response.data;
            };
            var getAlLCitiesError = function error(response) { console.log('no city data found'); };
            dataFactory.getAllCities().then(getAllCitiesSuccess,getAlLCitiesError);

            //if a city is present, make sure we have a default type
            if (vm.city && !vm.type) {
                vm.type = vm.ATTRACTIONS;
            }

            //if type is attractions, make sure we have a default category 
            if (!vm.category && vm.type === vm.ATTRACTIONS) {
                vm.category = vm.MUSEUMS_GARDENS;
            }

            //category options in xs dropdown
            vm.categoryOptions = [
                { key: vm.MUSEUMS_GARDENS, text: 'Museums & Gardens' },
                { key: vm.SHOPPING, text: 'Shopping' },
                { key: vm.RESTAURANTS_BARS, text: 'Restaurants & Bars' },
                { key: vm.THEATER_CINEMA_MUSIC, text: 'Theater, Cinema & Music' },
                { key: vm.ZOOS_AQUARIUMS, text: 'Zoos & Aquariums' },
                { key: vm.THEMEPARKS_RIDES, text: 'Theme Parks & Rides' },
                { key: vm.LANDMARKS, text: 'Landmarks' },
                { key: vm.PARKS_OUTDOORS, text: 'Parks & Outdoors' },
                { key: vm.EXTREMESPORTS_ADVENTURE, text: 'Extreme Sports & Adventure' }
            ];
            vm.xsCategorySelection = { key: vm.MUSEUMS_GARDENS, text: 'Museums & Gardens' };

            //get business listing info
            var successFunc = function (response) {

                //include reviews with response.data
                vm.listing = response.data;

                //get business reviews
                //todo: consider changing so that lookup is based on slug instead of directory id
                vm.dirId = vm.listing.Id;
                vm.getBusinessReviews();

                //setup meta tags
//TODO: canonical???
                var title = 'Travel Resources ' + utilities.getEndash() + ' ' + vm.listing.Name;
                var desc = 'Plan a trip to ' + vm.city + ' with the help of accessible ' + vm.type + '.';
                $rootScope.metaTagService.setup({
                    metaTitle: title,
                    ogTitle: title,
                    twitterTitle: title,
                    metaDescription: desc,
                    ogDescription: desc,
                    twitterDescription: desc
                });



            };
            var errFunc = function (response) {
                console.log('entry data not found: ' + response);
            };

            //handle old version (slug is a guid)
            if (guid.isGuid(vm.slug)) {
                dataFactory.getDirectoryEntryById(vm.slug).then(successFunc, errFunc);
            } else {
                //handle new version (slug is a slug)
                var params = {
                    city: vm.city,
                    type: vm.type,
                    category: vm.category,
                    slug: vm.slug
                };
                dataFactory.getBusiness(params).then(successFunc, errFunc);
            }

            



            // //get itinerary article for this city
            // if (vm.city && vm.type===vm.ITINERARIES) {
            //     dataFactory.getArticleByCityAndType(vm.city.Id, 'i')
            //         .success(function (data) {
            //             vm.itineraryArticle = data;
            //         })
            //         .error(function (data, status, headers, config) {
            //             console.log('attraction article not found');
            //         });
            // }
        }

        function getBusinessReviews() {

            vm.reviews=[];
            vm.isWaitingReviews = true;

            var successFunc =function(response){
                vm.reviews = response.data;

                //determine average ratings
                var ratings = _map(vm.reviews, 'rating');
                vm.averageRatings = (_.sum(ratings) / ratings.length).toFixed(1);

                vm.isWaitingReviews = false;
            };

            var errFunc= function(response){
                console.log('no directory reviews data found');
            };

            dataFactory.GetDirectoryReviewsById(vm.dirId).then(successFunc, errFunc);
        }

        // function overAllRating(directoryEntry) {
        //     var rating = 0;
        //     if (directoryEntry.reviews.length > 0 && directoryEntry.reviews.length != undefined) {

        //         for (var i = 0; i < directoryEntry.reviews.length; i++) {

        //             rating += directoryEntry.reviews[i].rating;

        //         }
        //         rating = rating / directoryEntry.reviews.length;
        //         return rating;
        //     }
        //     else {
        //         return rating;
        //     }

        // }

        //watching
        $scope.$watchGroup(['vm.type', 'vm.city', 'vm.category'], function (newValues, oldValues, scope) {
            //reset category if type is not attractions

            if (vm.type !== vm.ATTRACTIONS) {
                vm.category = '';
            }

             vm.directories = [];

            //show message if no city is chosen:
            if (vm.city && vm.type !== vm.ITINERARIES) {
                //define filter
                var filter = {
                    city: vm.city,
                    type: vm.type,
                    category: vm.category
                };

                //get directories
                var successFunc = function (response) {

                    vm.directories = response.data;
                    vm.resultsCount = response.data.length;
                    //console.log("vm.directories"+JSON.stringify(response));
                };
                var errFunc = function (response) {
                    console.log('no directories data found');
                };
                //dataFactory.getDirectoryBy(filter).then(successFunc, errFunc);

                var params = {
                    city: vm.city,
                    type: vm.type,
                    category: vm.category,
                    slug: vm.slug
                };
                dataFactory.getBusiness(params)
            }

            //handle itinerary updates
            vm.handleIfItinerary();
        });


        //functional definitions
        function setCategory(category) {
            vm.category = category;
        }
        function isCatSelectedMuseumsGardens() {
            return vm.category == vm.MUSEUMS_GARDENS;
        }
        function isCatSelectedShopping() {
            return vm.category == vm.SHOPPING;
        }
        function isCatSelectedRestaurantsBars() {
            return vm.category == vm.RESTAURANTS_BARS;
        }
        function isCatSelectedTheaterCinemaMusic() {
            return vm.category == vm.THEATER_CINEMA_MUSIC;
        }
        function isCatSelectedZoosAquariums() {
            return vm.category == vm.ZOOS_AQUARIUMS;
        }
        function isCatSelectedThemeParksRides() {
            return vm.category == vm.THEMEPARKS_RIDES;
        }
        function isCatSelectedLandMarks() {
            return vm.category == vm.LANDMARKS;
        }
        function isCatSelectedParksOutdoors() {
            return vm.category == vm.PARKS_OUTDOORS;
        }
        function isCatSelectedExtremeSportsAdventure() {
            return vm.category == vm.EXTREMESPORTS_ADVENTURE;
        }

        function setEmail(text) {
            var clean = text.trim();
            if (clean.substring(0, 4) == 'http') {
                return "<a href=" + clean + " target=\"_newWindow\">Contact</a>";
            } else {
                return "<a href=mailto:" + clean + ">" + clean + "</a>";
            }
            return text;
        }

        function breakOnComma(text) {
            if (!text) return;
            var textEntries = text.split(",");
            var result = "";
            textEntries.forEach(function (t) {
                result += t + "<br />";
            });
            return result;
        }

        /* google map */
        //todo: add this to a constants so it is in one place
        vm.googleMapsUrl = 'https://maps.googleapis.com/maps/api/js?key='+vm.env.google_maps_api_key;
        // NgMap.getMap("googleMap").then(function(map) {
        //     console.log(map.getCenter());
        //     console.log('markers', map.markers);
        //     console.log('shapes', map.shapes);

        //     google.maps.event.addListener(map, 'click', function(event) {
        //         addMarker(event.latLng, map);
        //       });

        //     function addMarker(location, map) {
        //       // Add the marker at the clicked location, and add the next-available label
        //       // from the array of alphabetical characters.
        //       var marker = new google.maps.Marker({
        //         position: location,
        //         label: labels[labelIndex++ % labels.length],
        //         map: map
        //       });
        //     }
        // });
        vm.getMapZoom = getMapZoom;
        function getMapZoom() {
            if (!vm.city) return 2;
            return 10;
        }
        vm.getMapCenter = getMapCenter;
        function getMapCenter() {
            if (!vm.city) return "United States";
            return vm.city;
        }

        function getItineraryImgUrl() {
            return vm.getArticleMainImagePath(vm.itinerary.IntroImage);
        }
        function getArticleMainImagePath(asset) {
            if (!asset) return "";
            return vm.env.BASEURL_CONTENT + '/Image/GetImage?assetId=' + asset.Id + '&size.Name=medium';
        }

        function handleIfItinerary() {
            //show itinerary?
            vm.itinerary = {};
            if (vm.city && vm.type === vm.ITINERARIES) {
                for (var i = 0; i < vm.articleboxes.length; i++) {
                    if (vm.articleboxes[i].Type.Flag === 'i' && vm.articleboxes[i].City.Name === vm.city) {
                        vm.itinerary = vm.articleboxes[i];
                    }
                }
            }
        }

        function getPreview(text) {
            if (!text) return "";
            var s = text.split(" ");
            var p = s.splice(0, 80);
            var j = p.join(" ");
            if (s.length > 0) {
                j += '...';
            }
            return j;
        }

        $scope.addressFilter = function (directoryEntry) {
            return (directoryEntry.Address !== '');
        };

        function hasArticlesForCity() {
            var hasArticles = false;
            angular.forEach(vm.articleboxes, function (value, key) {
                if (value.City.Name === vm.city) {
                    hasArticles = true;
                }
            });
            return hasArticles;
        }

        function trackOutboundClick(url) {
            //removing as per Daniel
            //$window.ga('send', 'event', { eventCategory: 'outbound link', eventAction: 'click', eventLabel: url, transport: 'beacon' });
        }
    };

    businessIndividualController.$inject = ['$rootScope', '$stateParams', 'dataFactory', '$scope', 'NgMap', '$state', '$window','environmentService','guid','utilities'];
    app.controller('businessIndividualController', businessIndividualController);
};
