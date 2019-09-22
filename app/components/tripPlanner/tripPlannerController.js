module.exports = function (app) {
    var tripPlannerController = function ($rootScope, $stateParams, dataFactory, $scope, NgMap, $state, $window, $filter, environmentService) {
        var vm = this;
        vm.env = environmentService();

        $scope.Math = window.Math;
        vm.init = init;
        vm.city = $stateParams.city.replace('_', ' ');
        vm.type = $stateParams.type.replace('_', ' ');   //%20');
        vm.category = $stateParams.category;
        vm.isActive=false;
        vm.getLastSectionPage = getLastSectionPage;

        vm.directories = [];
        vm.resultsCount = 0;
        vm.cityoptions = [];

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
        vm.getMainImagePath = getMainImagePath;

        //tracking
        vm.trackOutboundClick = trackOutboundClick;


       // vm.resetCurrentBoxSetPage = resetCurrentBoxSetPage;
        vm.currentBoxSetPage =0; //vm.resetCurrentBoxSetPage();
        vm.boxSetPageSize = 5;
        vm.DirectoriesLimit = 5;
        vm.getDirectoriesToShow = getDirectoriesToShow;
        vm.getNumberOfPages = getNumberOfPages;
        vm.ShowPrevBoxSet = ShowPrevBoxSet;
        vm.ShowNextBoxSet = ShowNextBoxSet;
        vm.resourceFetchIsComplete = false;
        // vm.Museum_Green = require("../../../resources/img/tripPlanner/Museum_Gray.png");
        // vm.Shopping_Green= require("../../../resources/img/tripPlanner/Shopping_Green.png");

        vm.init();

        require("./tripPlanner.less");

        require("file-loader?name=Museum_Green.png!../../../resources/img/tripPlanner/Museum_Green.png");
        require("file-loader?name=Museum_Gray.png!../../../resources/img/tripPlanner/Museum_Gray.png");
        require("file-loader?name=Shopping_Green.png!../../../resources/img/tripPlanner/Shopping_Green.png");
        require("file-loader?name=Shopping_Gray.png!../../../resources/img/tripPlanner/Shopping_Gray.png");
        require("file-loader?name=Restaurants_Green.png!../../../resources/img/tripPlanner/Restaurants_Green.png");
        require("file-loader?name=Restaurants_Gray.png!../../../resources/img/tripPlanner/Restaurants_Gray.png");
        require("file-loader?name=Theater_Green.png!../../../resources/img/tripPlanner/Theater_Green.png");
        require("file-loader?name=Theater_Gray.png!../../../resources/img/tripPlanner/Theater_Gray.png");
        require("file-loader?name=Zoo_Green.png!../../../resources/img/tripPlanner/Zoo_Green.png");
        require("file-loader?name=Zoo_Gray.png!../../../resources/img/tripPlanner/Zoo_Gray.png");
        require("file-loader?name=Parks_Green.png!../../../resources/img/tripPlanner/Parks_Green.png");
        require("file-loader?name=Parks_Gray.png!../../../resources/img/tripPlanner/Parks_Gray.png");
        require("file-loader?name=Landmarks_Green.png!../../../resources/img/tripPlanner/Landmarks_Green.png");
        require("file-loader?name=Landmarks_Gray.png!../../../resources/img/tripPlanner/Landmarks_Gray.png");
        require("file-loader?name=Outdoor_Green.png!../../../resources/img/tripPlanner/Outdoor_Green.png");
        require("file-loader?name=Outdoor_Gray.png!../../../resources/img/tripPlanner/Outdoor_Gray.png");
        require("file-loader?name=Extreme_Green.png!../../../resources/img/tripPlanner/Extreme_Green.png");
        require("file-loader?name=Extreme_Gray.png!../../../resources/img/tripPlanner/Extreme_Gray.png");

        require("file-loader?name=IsNationalBusiness.png!../../../resources/img/tripPlanner/IsNationalBusiness.png");
        require("file-loader?name=Email_Gray.png!../../../resources/img/tripPlanner/Email_Gray.png");
        require("file-loader?name=Facebook_Gray.png!../../../resources/img/tripPlanner/Facebook_Gray.png");
        require("file-loader?name=Point_Gray.png!../../../resources/img/tripPlanner/Point_Gray.png");
        require("file-loader?name=Phone_Gray.png!../../../resources/img/tripPlanner/Phone_Gray.png");
        require("file-loader?name=Website_Gray.png!../../../resources/img/tripPlanner/Website_Gray.png");

        function getMainImagePath() {
            if (!vm.city.Name) return;
            return vm.env.BASEURL_CONTENT + '/assets/cities/main/' + vm.city.Name.replace(" ", "") + '_main.jpg';
        }

        //initialiation
        function init() {
            
             var everywhere = angular.element(window.document);
             everywhere.bind('click', function(event){
                if(event.currentTarget.activeElement.id !="catID" && vm.isActive == true)
                {
                    vm.isActive=!vm.isActive;
                    var elementId=document.getElementById('catID');
                    elementId.classList.remove('active');
                    
                }
            
               
            });

            //setup meta tags
            var title = 'Accessible travel resources';
            if (vm.city && vm.type) {
                title = 'Accessible ' + vm.type + ' in ' + vm.city;
            }
            var desc = 'Transportation, equipment rentals, caregivers, and more!  accessibleGO\'s Trip Resources directory is an essential tool for planning your next trip.';
            var img = vm.env.BASEURL_CONTENT + '/assets/cities/main/' + vm.city.replace(" ", "") + '_main.jpg'; //vm.getMainImagePath();
            $rootScope.metaTagService.setup({
                metaTitle: title,
                ogTitle: title,
                twitterTitle: title,
                metaDescription: desc,
                ogDescription: desc,
                twitterDescription: desc,
                ogImage: img,
                twitterImage: img
            });

            //cities
            // $rootScope.$watch('cities', function (newVal, oldVal) {
            //     vm.cityoptions = $rootScope.cities;
            // });
            var getAllCitiesSuccess = function success(response) { vm.cityoptions = response.data; };
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
                { key: vm.MUSEUMS_GARDENS, text: 'Museums & Gardens', imgPath : "/web/public/resources/Museum_Green.png"},
                { key: vm.SHOPPING, text: 'Shopping',imgPath:"/web/public/resources/Shopping_Green.png"},
                { key: vm.RESTAURANTS_BARS, text: 'Restaurants & Bars', imgPath:"/web/public/resources/Restaurants_Green.png"},
                { key: vm.THEATER_CINEMA_MUSIC, text: 'Theater, Cinema & Music', imgPath : "/web/public/resources/Theater_Green.png"},
                { key: vm.ZOOS_AQUARIUMS, text: 'Zoos & Aquariums', imgPath : "/web/public/resources/Zoo_Green.png"},
                { key: vm.THEMEPARKS_RIDES, text: 'Theme Parks & Rides', imgPath : "/web/public/resources/Parks_Green.png"},
                { key: vm.LANDMARKS, text: 'Landmarks', imgPath :"/web/public/resources/Landmarks_Green.png"},
                { key: vm.PARKS_OUTDOORS, text: 'Parks & Outdoors', imgPath:"/web/public/resources/Outdoor_Green.png"},
                { key: vm.EXTREMESPORTS_ADVENTURE, text: 'Extreme Sports & Adventure', imgPath:"/web/public/resources/Extreme_Green.png"}
            ];

            if (vm.category && vm.type === vm.ATTRACTIONS) {
                vm.xsCategorySelection = vm.categoryOptions.filter( function(catOption) { return catOption.key === vm.category; } )[0];
                //vm.xsCategorySelection =  { key: vm.MUSEUMS_GARDENS, text: 'Museums & Gardens', imgPath : "/web/public/resources/Museum_Green.png"};
            }

            //side article boxes
            var successFunc = function (response) {
                vm.articleboxes = response.data;
                vm.handleIfItinerary();
            };
            var errFunc = function (response) {
                console.log('no article data found');
            };
            dataFactory.getAllArticles().then(successFunc, errFunc);

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

        vm.toggle = toggle;
        function toggle(){
            vm.isActive=!vm.isActive;
            if(vm.isActive)
            {
                var elementId=document.getElementById('catID');
                elementId.classList.add('active');
            }
        }

        //watching
        $scope.$watchGroup(['vm.type', 'vm.city', 'vm.category'], function (newValues, oldValues, scope) {

            vm.resourceFetchIsComplete = false;

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
                    if(response.data.length>0){
                        vm.directories = response.data;

                        //TODO: implement single call to get reviews (by city and category)
                        // vm.directories[0]["reviewList"]= [{"reviewId": "1","name":"Walter Spencer", "title": "Wonderfull", "description": "Learn about the history of the building and of Texas. Historic house, kitchen and gift shop are wheelchair accessible. Other buildings have steps. Please contact the museum in adavance if you are deaf, hard of hearing, blind or have low vision.","createdDate":"4/4/2018","rating": 1},
                        // {"reviewId": "2","name":"Carloe Hopkins", "title": "Abc", "description": "Learn about the history of the building and of Texas. Historic house, kitchen and gift shop are wheelchair accessible. Other buildings have steps. Please contact the museum in adavance if you are deaf, hard of hearing, blind or have low vision.","createdDate":"2/3/2018", "rating":2},
                        // {"reviewId": "3","name":"judy Romero", "title": "Review Title2", "description": "Learn about the history of the building and of Texas. Historic house, kitchen and gift shop are wheelchair accessible. Other buildings have steps. Please contact the museum in adavance if you are deaf, hard of hearing, blind or have low vision.", "createdDate":"1/5/2018","rating": 3},
                        // {"reviewId": "4", "name":"Bella Little", "title": "Review Title3", "description": "Learn about the history of the building and of Texas. Historic house, kitchen and gift shop are wheelchair accessible. Other buildings have steps. Please contact the museum in adavance if you are deaf, hard of hearing, blind or have low vision.", "createdDate":"4/5/2018","rating": 1}];
                        
                        vm.resultsCount = response.data.length;
                        vm.resourceFetchIsComplete = true;
                    }
                    vm.resourceFetchIsComplete = true;
                };
                var errFunc = function (response) {
                    console.log('no directories data found');
                };
                dataFactory.getDirectoryBy(filter).then(successFunc, errFunc);
            }

            //handle itinerary updates
            vm.handleIfItinerary();
        });


        //functional definitions
        function setCategory(category) {

            vm.category = category.key;
            vm.xsCategorySelection = category;
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

        vm.isProd = isProd;
        function isProd() {
            var p = (vm.env.name === 'production');
            return p;
        }

        /* google map */
        vm.googleMapsUrl = 'https://maps.googleapis.com/maps/api/js?key='+vm.env.google_maps_api_key;

        NgMap.getMap().then(function(map) {
          vm.map = map;
        });

        vm.showDirectoryEntryBubble = function(evt, directoryEntryBubble) {
            vm.selectedDirectoryEntry = directoryEntryBubble;
            vm.map.showInfoWindow('foo', this);
          };
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
                vm.resourceFetchIsComplete = true;
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
            return (directoryEntry.Address && directoryEntry.Address !== '');
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

        //--> paging for this section
        function resetCurrentBoxSetPage() {
             vm.currentBoxSetPage = 0;
        }
        function getDirectoriesToShow() {
            return $filter('filter')(vm.directories);
        }
        function getNumberOfPages() {
            return Math.ceil(vm.getDirectoriesToShow().length / vm.boxSetPageSize);
        }

        function getLastSectionPage(){
            return Math.min(vm.boxSetPageSize*(vm.currentBoxSetPage+1), vm.getDirectoriesToShow().length);
        }

        vm.getBoxSetPages = getBoxSetPages;
        function getBoxSetPages() {
            var len = vm.getNumberOfPages();
            return new Array(len);
        }
        vm.gotoBoxPage = gotoBoxPage;
        function gotoBoxPage(index) {
            vm.currentBoxSetPage = index;
        }
        function ShowPrevBoxSet() {
            vm.currentBoxSetPage = vm.currentBoxSetPage - 1;
        }
        function ShowNextBoxSet() {
            vm.currentBoxSetPage = vm.currentBoxSetPage + 1;
        }

    };

    tripPlannerController.$inject = ['$rootScope', '$stateParams', 'dataFactory', '$scope', 'NgMap', '$state', '$window', '$filter','environmentService'];
    app.controller('tripPlannerController', tripPlannerController);
};
