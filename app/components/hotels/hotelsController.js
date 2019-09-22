module.exports = function (app) {
    var hotelsController = function ($rootScope, $scope, $state, $timeout, $filter, dataFactory, $stateParams, hotelSearchService, sessionService, hotelUtilities, NgMap, utilities, localStorageService, joinModalService, redirectionService, environmentService, hotelLookupService, hotelSearchFilterService, $window, dataLayerService) {
        var vm = this;

        vm.env = environmentService();
        vm.filters = hotelSearchFilterService.filters;
        vm.utilities = utilities;

        $scope.Math = window.Math;
        vm.accessibleAmenityData = undefined;

        vm.init = init;
        // vm.isFavorite=false;
        vm.isCUG = false;
        vm.getArray = getArray;
        vm.searchHotels = searchHotels;
        vm.submitSearch = submitSearch;
        vm.setSearchResultsHeading = setSearchResultsHeading;

        //vm.hotelLookupService = hotelLookupService;

        //search form
        vm.loadResultsFromCache = false;
        vm.destination = '';
        //vm.hotelDestinationType = 'city';

        var dat = new Date();
        dat.setDate(dat.getDate() + 14);
        vm.hotelDateCheckin = dat;

        vm.hotelDateCheckout = null;
        vm.hotelSearchRooms = 1;
        vm.hotelSearchAdults = 1;
        vm.hotelSearchAdultsMax = 14;
        vm.hotelSearchChildren = 0;
        vm.hotelSearchChildrenMax = 6;
        vm.hotelSearchRadius = 10;
        // vm.hotelSearchGeo = {
        //     longitude: undefined,
        //     latitude: undefined
        // };
        vm.searchresults = {};
        vm.mapCenter = {};
        vm.allResults = []; //master copy
        vm.searchInitiated = false;
        vm.overlayCUG = overlayCUG;
        vm.overlayReviews = overlayReviews;

        //filters
        vm.filteredResults = [];
        vm.filterText = "";
        vm.handleHotelNameSearchTextChange = handleHotelNameSearchTextChange;
        vm.setFilteredResults = setFilteredResults;
        vm.setSortedResultsLowestFirst = setSortedResultsLowestFirst;
        vm.setSortedResultsHighestFirst = setSortedResultsHighestFirst;
        vm.setSortedResultsClubgoFirst = setSortedResultsClubgoFirst;
        vm.pushToGA = pushToGA;
        vm.chains = [];
        vm.minPrice = 0;
        vm.maxPrice = 100000;
        vm.absMinPrice = undefined;
        vm.absMaxPrice = undefined;
        vm.generalAmenityTracker = {};

        //globally peristed hotel search filters

        vm.toggleHotelFilterDrawer = toggleHotelFilterDrawer;
        vm.toggleFilters = toggleFilters;
        vm.toggleSearch = toggleSearch;
        vm.clubgoModal = clubgoModal;

        //vm.filterByHotelName = "";

        // filter for badge
        vm.removeBadge = removeBadge;
        vm.addBadge = addBadge;

        //results
        vm.isWaiting = false;
        vm.isButtonDisable = false;
        vm.searchCriteriaDestination = '';
        vm.searchCriteriaDates = '';
        vm.searchCriteriaRooms = '';
        //vm.resultCity = '';
        //vm.resultCountry = '';
        vm.isCUGResultsReturned = false;
        vm.isHotelReviewsReturned = false;

        //--- slider
        //https://www.npmjs.com/package/angularjs-nouislider
        //https://refreshless.com/nouislider/examples/
        vm.optionsWithStart = {
          start: [vm.minPrice, vm.maxPrice],
          connect: true,
          step: 15,
          range: {
            min: vm.minPrice,
            max: vm.maxPrice
          },
        };

        //sort options
        vm.sortOptions = [{
  id: 1,
  label: 'Default',
  value: 'default'
}, {
  id: 2,
  label: 'Price - Low to High',
  value: 'lth'
}, {
  id: 3,
  label: 'Price - High to Low',
  value: 'htl'
}, {
  id: 4,
  label: 'clubGO Deals First',
  value: 'clubgo'
}];
vm.selectedSortOption = vm.sortOptions[0];

vm.sortOptionChanged = function() {
    if (!vm.selectedSortOption) {
        vm.setSortedResultsTopPicks();
        return;
    }

    switch (vm.selectedSortOption.value) {
        case 'lth': {
            vm.setSortedResultsLowestFirst();
            return;
        }
        case 'htl': {
            vm.setSortedResultsHighestFirst();
            return;
        }
        case 'clubgo': {
            vm.setSortedResultsClubgoFirst();
            return;
        }
        default: {
            vm.setSortedResultsTopPicks();
            return;
        }
    }
}

        //cug
        vm.displayState = 'unlock';
        vm.setCUGDisplayState = setCUGDisplayState;
        vm.unlockDeals = unlockDeals;

        //counts
        vm.totalClubgoDeals = 0;
        vm.totalReviews = 0;
        vm.totalAccessibleHotels = 0;

        //googlemap
        vm.showMap = false;
        vm.toggleMap = toggleMap;
        vm.setMapVisibility = setMapVisibility;
        vm.googleMapsUrl = 'https://maps.googleapis.com/maps/api/js?key='+vm.env.google_maps_api_key;

        //-- errors
        vm.errs = [];
        vm.resetErrs = resetErrs;
        hotelSearchService.errs = [];
        $scope.hotelSearchService = hotelSearchService;
        vm.showErrors = false;
        //vm.getSearchText = getSearchText;

        //paging
        vm.resetCurrentPage = resetCurrentPage;
        vm.currentPage = 0; //vm.resetCurrentPage();
        vm.getPages = getPages;
        vm.goToPage = goToPage;
        vm.pageSize = 50;
        vm.resultsLimit = 50;
        vm.hotelsToShow = hotelsToShow;
        vm.getNumberOfPages = getNumberOfPages;
        vm.ShowPrev = ShowPrev;
        vm.ShowNext = ShowNext;

        //navigate search result on to top
        vm.scrollTopFun = scrollTopFun;
        vm.launchJoinModal = launchJoinModal;

        //next steps
        vm.gotoHotel = gotoHotel;
        vm.viewHotel = viewHotel;

        //search bar expanding
        vm.isSearchFormExpanded = false; //defaulting to true b/c not intuitive how to submit search when it is closed
        vm.showForm = showForm;

        require("./hotels.less");
        //vm.image_starOrange = require("../../../resources/img/common/Star_Orange.png");
        //vm.image_starWhite = require("../../../resources/img/common/Star_White.png");
//TODO: deprecate        

        //vm.CUG_listing_Club_Deal = require("../../../resources/img/hotels/CUG_listing_Club_Deal.png");
        //vm.CUG_listing_Unlock_Club_Deal = require("../../../resources/img/hotels/CUG_listing_Unlock_Club_Deal.png");

        vm.image_headphones = require("../../../resources/img_new/hotels/headphones.png");
        vm.image_headphonesBlue = require("../../../resources/img_new/hotels/headphones-blue.png");
        vm.image_building = require("../../../resources/img_new/hotels/building.png");
        vm.image_go = require("../../../resources/img_new/hotels/go.png");
        //vm.image_poweredByPPN = require("../../../resources/img/home/powered-by-ppn.png");
        //vm.image_poweredByPPNBlack = require("../../../resources/img_new/logo/powered-by-ppn-black.png");
        //vm.image_logoBlack = require("../../../resources/img_new/logo/logo-black.png");
        //vm.image_ribbon = require("../../../resources/img_new/hotels/ribbon.png");

        vm.init();

        function init() {
            //show the map?
            vm.setMapVisibility();
            $(window).resize(function () {
                setMapVisibility();
            });

            // NgMap.getMap('googleMap').then(function(map) {
            //   console.log(map.getCenter());
            //   console.log('markers', map.markers);
            //   console.log('shapes', map.shapes);
            //   var center = map.getCenter();
            //   map.maps.event.trigger(map, "resize");
            //   map.setCenter(center);
            // });

            //cug display state :: handle change in CUG state ['none'|'unlock'|'club']
            $rootScope.$watch('userCUGDetails', function (newVal, oldVal) {
                vm.setCUGDisplayState();
            });

            //persist hotel search params
            hotelSearchService.setParamsFromState($stateParams);

            //hack to use ng template include for search bar
            // hotelLookupService.setParams({
            //   checkin: $stateParams.checkin,
            //   checkout: $stateParams.checkout
            // });

            //setup meta tags
            var title = 'Book an accessible hotel';
            var desc = 'View detailed accessibility info for thousands of U.S. hotels.  Based on 40 distinct accessibility criteria.';
            if (hotelSearchService.params.display) {
                //title = 'Get accessibility details and community reviews for hotels, flights and more';
                title = title + ' in ' + hotelSearchService.params.display;
                desc = 'Top accessible hotels, attractions and trip ideas for travelers with disabilities';
                desc += ' :: ' + hotelSearchService.params.display;
            }

            $rootScope.metaTagService.setup({
                metaTitle: title,
                ogTitle: title,
                twitterTitle: title,
                metaDescription: desc,
                ogDescription: desc,
                twitterDescription: desc,
                breadcrumbJson: [{
                    type: 'ListItem',
                    position: 2,
                    name: 'Search Hotels',
                    item: 'https://accessibleGO.com/hotels'
                }]
            });

            //init hotel search UI
            var searchedCity = {
                ppnid: hotelSearchService.params.ppnid,
                type: hotelSearchService.params.type,
                display: hotelSearchService.params.display,
                cityid: hotelSearchService.params.cityid
            };
            vm.destination = searchedCity;

            //init filter: accessibility
            //vm.isAccessibleFilter = true;

            //init filter: cug
            //vm.isCugFilter = false;

            //init filger: club go
            //vm.isClubGOFilter = false;

            //init filter: accessibilityAmenityGroups
            //vm.accessibilityAmenityGroups = [];
            // vm.accessibilityAmenityGroups = [
            //   { title:'Elevator', checked:false},
            //   { title:'Entrance and main areas', checked:false},
            //   { title:'Hotel Room and Facilities', checked:false},
            //   { title:'Large Public Venue', checked:false},
            //   { title:'Parking', checked:false},
            //   { title:'Restaurant', checked:false}
            // ];

            //init checkin
            if (hotelSearchService.params.checkin) {
                vm.hotelDateCheckin = hotelSearchService.params.checkin;
            }

            //init checkout
            if (hotelSearchService.params.checkout) {
                vm.hotelDateCheckout = hotelSearchService.params.checkout;
            }

            //init rooms
            vm.hotelSearchRooms = hotelSearchService.params.rooms;

            //init adults
            vm.hotelSearchAdults = hotelSearchService.params.adults;

            //init guests
            vm.hotelSearchChildren = hotelSearchService.params.children;

            //init radius
            //TODO: add radius in advanced search
            //vm.hotelSearchRadius = hotelSearchService.params.radius;

            //criteria (to determine if a search has been done already, todo rename var)
            vm.searchCriteriaDestination = hotelSearchService.params.display;
            vm.searchCriteriaDates = $filter('date')(hotelSearchService.params.checkin, 'shortDate') + ' - ' + $filter('date')(hotelSearchService.params.checkout, 'shortDate');
            vm.searchCriteriaRooms = 'rooms: ' + hotelSearchService.params.rooms;

            //valid so far?
            if (!hotelSearchService.hasValidParams()) {
                //vm.errs = [];
                //vm.errs.push(hotelSearchService.getErrorMessage());
                //-->errors are caught in the $scope.$watch below
                return;
            }

            //search!
            vm.searchHotels();

            //todo: cache results - tbd: (not sure if/what we need below this)
            //1. this should be put on the page that is calling hotels instead
            //b/c hotels should be kept cleanly responsible for displaying results based on url data passed in
            //otherwise you could get unexpected results if there is no search data entered in
            vm.loadResultsFromCache = ($stateParams.c && $stateParams.c === 'y');
            if (vm.loadResultsFromCache && sessionService.existsLastHotelSearch()) {
                vm.searchresults = sessionService.getLastHotelSearch().Results;
                console.log('applying lastHotelSearch');
                vm.setSearchResultsHeading();
                return;
            }


            //get POIs
            var poiSearchParams = {
                cityid_ppn: hotelSearchService.params.ppnid
            };
            var sfunc = function(response) {
                if (!response || !response.data || !response.data.hits) {
                    return;
                }
                
                vm.pois = response.data.hits;

            };
            var efunc = function(response) {

            };
            dataFactory.getPointsOfInterestByCityPPNId(poiSearchParams).then(sfunc,efunc);


            /*
                    //determine if we have incoming search critiera
                    var proceedWithSearch = false;
                    var searchParams = {};
                    if ($stateParams.destId) {
                      searchParams.destinationId = $stateParams.destId;

                      //todo: enable POI, etc
                      searchParams.destinationType = 'city';

                      proceedWithSearch = true;
                    }

                    //handle search from incoming criteria
                    if (proceedWithSearch) {
                      if ($stateParams.checkin) {
                        searchParams.checkinDate = new Date($stateParams.checkin);
                      }

                      if ($stateParams.checkout) {
                        searchParams.checkoutDate = new Date($stateParams.checkout);
                      }

                      if ($stateParams.rooms) {
                        searchParams.rooms = $stateParams.rooms;
                      }
                      vm.searchHotels(searchParams);
                    }
                    */
        }




        function showForm() {
            vm.isSearchFormExpanded = true;
            console.log('vm.isSearchFormExpanded ' + vm.isSearchFormExpanded);
        }

        angular.element("input.slider").slider({
            precision: 2
        });

        var sliderValMin = angular.element('.min-slider-handle').attr('aria-valuenow');

        var sliderValMax = angular.element('.max-slider-handle').attr('aria-valuenow');

        angular.element('#val-1').html(sliderValMin);

        angular.element('#val-2').html(sliderValMax);


        angular.element('.slider').change(function(){

            var sliderValMin = angular.element('.min-slider-handle').attr('aria-valuenow');

            var sliderValMax = angular.element('.max-slider-handle').attr('aria-valuenow');

            angular.element('#val-1').html(sliderValMin);

            angular.element('#val-2').html(sliderValMax);
        })


        function removeDiv(){
            this.parentNode.remove();
        };

        function toggleFilters() {

            var hotelsFilters = angular.element('#hotelsFilters');

            var overlay = angular.element('.overlay');

            var body = angular.element('body');

            hotelsFilters.toggleClass('open');

            body.toggleClass('no-scroll');

            overlay.toggleClass('show');

            overlay.click(function(){

                overlay.removeClass('show');

                hotelsFilters.removeClass('open');

                body.removeClass('no-scroll');

            })

        };

        function toggleSearch() {


vm.searchInitiated = false;
return;

            var searchForm = angular.element('.inner-search-bar');

            var overlay = angular.element('.overlay');

            var collapse = angular.element('#hotels-search-bar-collapse');

            var body = angular.element('body');

            searchForm.toggleClass('open');

            overlay.toggleClass('show');

            body.toggleClass('no-scroll');

            //collapse.removeClass('open');

            overlay.click(function(){

                overlay.removeClass('show');

                searchForm.removeClass('open');

                //collapse.removeClass('open');

                body.removeClass('no-scroll');

            })

        };

        function clubgoModal() {

            var clubgoModal = angular.element('#clubgo-modal');

            var clubgoWrapper = angular.element('.clubgo-wrapper');

            var clubgoModalClose = angular.element('#clubgo-modal-close');

            $scope.toggleClass('open');

            clubgoModalClose.click(function(){
                clubgoWrapper.removeClass('open');
            })

        };


        //alert(sliderVal);


        //called locally after search params are loaded and validated in init()
        function searchHotels() {
            //var self = this;
            //self.searchParams = hotelSearchService.params;
            //var hotelSearchParams = hotelSearchService.getUrlSafeParams(self.searchParams);

            vm.errs = [];
            vm.showErrors = true;
            vm.isWaiting = true;
            vm.isButtonDisable = true;

            //handle after validation
            var sFunc = function (response) {

                //no data?
                if (!response.data.data) {
                    vm.isWaiting = false;
                    vm.isButtonDisable = false;
                    vm.isSearchFormExpanded = true;
                    if (response.data.errors && response.data.errors.length > 0) {
                        var e = response.data.errors[0];
                        if (e.code === '1.5282.72') {
                            vm.errs.push('Sorry, this hotel is not available on the dates you\'ve requested. Please try another hotel or try adjusting your dates.');
                        }
                        if (e.code === '2147') {
                            vm.noRecordsFoundReason = e.message.replace('Hotel.ResultsWithCacheV5: ','');
                        }
                        console.warn(response.data.errors[0].message);
                    }
                    return;
                }

                //CUG?
                //vm.isCUG = response.data.data.results.isCUG;
                //console.log('CUG: '+ vm.isCUG);

                //hotel data
                vm.searchresults = response.data.data.results;
                vm.searchInitiated = true;



                //determine map center (we don't have latitude and longitude for CUG)
                vm.mapCenter = undefined;
                if (!vm.isCUG && vm.searchresults.hotel_data.length > 0) {

                    var centerCoordinates = vm.searchresults.hotel_data.filter(function(f,i) { return f.geo.latitude!==0 && f.geo.longitude!==0; });
                    if (centerCoordinates && centerCoordinates.length>0) {
                        vm.mapCenter = {
                            latitude: centerCoordinates[0].geo.latitude,  // vm.searchresults.hotel_data[0].geo.latitude,
                            longitude: centerCoordinates[0].geo.longitude,  //vm.searchresults.hotel_data[0].geo.longitude
                        };
                    }
                }

                //store hotel results until subsequent search
                vm.allResults = vm.searchresults.hotel_data;

                //populate filter :: hotel chains
                vm.chains = vm.allResults.reduce(function(cumulative,hotelObj,hotelIdx,arr) {
                    if (hotelObj.hotel_chain && hotelObj.hotel_chain.name) {
                        var alreadyIn = cumulative.some(function (h) {
                            return h.name && h.name === hotelObj.hotel_chain.name;
                        });
                        if (!alreadyIn) {
                            cumulative.push(hotelObj.hotel_chain);
                        }
                    }
                    return cumulative;
                },[]);




                //TODO: refactor ago hotel data into accessiblego object
                //this is currently being used in overlayCUG
                //if (!n[0].accessiblego) n[0].accessiblego = {};

                //integrate CUG data
                vm.overlayCUG();

                //integrate review data
                vm.overlayReviews();

                //setup accessibility filters
                vm.populateAccessibleAmenityFilterOptions();

                //setup general amenity filters
                vm.populateGeneralAmenityFilterOptions();

                // dataFactory.getDrivingDistanceBetween().then(
                //     function(response) {
                //         debugger;
                //     }, function(err) {
                //         debugger;
                //     }
                // );


                //filteredResults
                //vm.setPriceRange(vm.allResults);
                //vm.setFilteredResults();


                //add map markers
                $timeout(function () {
                    angular.element(document).ready(function() {
                        NgMap.getMap('googleMap').then(function(map) {

                            //map.setMapType(GoogleMap.MAP_TYPE_NORMAL);

                            $.each(vm.filteredResults,function(idx,hotel) {
                                if (idx>25) {
                                    return false;
                                }
                                //create marker
                                var marker = new google.maps.Marker({
                                    position: new google.maps.LatLng({lat: hotel.geo.latitude, lng: hotel.geo.longitude}),
                                    map: map,
                                    //icon: 'http://maps.google.com/mapfiles/kml/shapes/hospitals.png',
                                    title: hotel.name
                                });

                                var url = $state.href('hotel',{hid: hotel.id, checkin: vm.utilities.getUrlSafeDate(vm.hotelDateCheckin), checkout: vm.utilities.getUrlSafeDate(vm.hotelDateCheckout), rooms: vm.hotelSearchRooms, adults: vm.hotelSearchAdults, children: vm.hotelSearchChildren, destination: vm.destination.display});
                                var urlTarget = '_newWin_'+hotel.id;

                                var showCUG = false;
                                if (hotel.accessiblego && hotel.accessiblego.cug) {
                                    showCUG = true;
                                }

                                var hotelInfoWindowContent = '<div id="content">'+
                                      '<div id="siteNotice">'+
                                      '</div>'+
                                      (!showCUG?'':'<div style="background-color:#00509f;display:list-item;padding:4px;font-size:1.25em;"><div class="float-right" style="color:#fff;"><i class="left"></i><span>clubGO Deal!</span></div></div>')+
                                      '<span id="firstHeading" class="firstHeading" style="font-size:1.5em;font-weight:bold">'+hotel.name+'</span>'+
                                      '<div id="bodyContent" class="row">'+
                                      '<div class="col col-auto" style="padding:0px;"><img class="showmapimage" src="'+hotel.thumbnail+'" style="width:90px;" /></div>'+
                                      '<div class="col col-auto" style="padding:0 6px;"><span>'+hotel.address.city_name+', '+hotel.address.state_code+', '+hotel.address.country_name+'</span><br/>'+
                                      '<button type="button" class="btn btn-primary btn-sm" style="cursor: pointer;" onclick="window.open(\''+url+'\',\''+urlTarget+'\')">View</button>'+
                                      '</div>'+
                                      '</div>'+
                                      '</div>';

                                var infowindow = new google.maps.InfoWindow({
                                    content: hotelInfoWindowContent
                                });

                                marker.addListener('click', function() {
                                    infowindow.open(map, marker);
                                });

                                google.maps.event.addListener(map, 'click', function() {
                                    infowindow.close();
                                });
                            });

                            //add marker for hospital
                            if (hotelSearchService.params.type==='hospital') {
                                var hospital = new google.maps.LatLng({lat: parseFloat(hotelSearchService.params.geo.latitude), lng: parseFloat(hotelSearchService.params.geo.longitude) });
                                var marker = new google.maps.Marker({
                                    position: hospital,
                                    map: map,
                                    icon: 'http://maps.google.com/mapfiles/kml/shapes/hospitals.png',
                                    title: hotelSearchService.params.display
                                });

                                var contentString = '<div id="content">'+
                                      '<div id="siteNotice">'+
                                      '</div>'+
                                      '<h4 id="firstHeading" class="firstHeading">'+hotelSearchService.params.display+'</h4>'+
                                      '<div id="bodyContent">'+
                                      '<p><b></b> </p>'+
                                      '</div>'+
                                      '</div>';
                                var infowindow = new google.maps.InfoWindow({
                                    content: contentString
                                });
                                marker.addListener('click', function() {
                                    infowindow.open(map, marker);
                                });

                                // var center = map.getCenter();
                                // google.maps.event.trigger(map, "resize");
                                // map.setCenter(center);
                            }

                            //add markers for poi
                            var cats = [];
                            $.each(vm.pois, function(idx,poi) {

                                var source = poi._source;

                                // if (cats.indexOf(source.category) === -1) {
                                //     cats.push(source.category);
                                // }

                                if (["Other","Rivers and Lakes","Shopping Center"].indexOf(source.category) > -1) {
                                    return true;
                                }

                                //create marker
                                var marker = new google.maps.Marker({
                                    position: new google.maps.LatLng({lat: source.latitude, lng: source.longitude}),
                                    map: map,
                                    icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/info-i_maps.png',
                                    title: source.poi_name
                                });


                                //var url = $state.href('hotel',{hid: hotel.id, checkin: vm.utilities.getUrlSafeDate(vm.hotelDateCheckin), checkout: vm.utilities.getUrlSafeDate(vm.hotelDateCheckout), rooms: vm.hotelSearchRooms, adults: vm.hotelSearchAdults, children: vm.hotelSearchChildren, destination: vm.destination.display});
                                //var urlTarget = '_newWin_'+hotel.id;

                                var windowContent = '<div id="content">'+
                                      '<div id="siteNotice">'+
                                      '</div>'+
                                      '<span id="firstHeading" class="firstHeading" style="font-size:1.5em;font-weight:bold">'+source.poi_name+'</span>'+
                                      '<div id="bodyContent" class="row">'+
                                      //'<div class="col col-auto" style="padding:0px;"><img class="showmapimage" src="'+hotel.thumbnail+'" style="width:90px;" /></div>'+
                                      //'<div class="col col-auto" style="padding:0 6px;"><span>'+hotel.address.city_name+', '+hotel.address.state_code+', '+hotel.address.country_name+'</span><br/>'+
                                      //'<button type="button" class="btn btn-primary btn-sm" style="cursor: pointer;" onclick="window.open(\''+url+'\',\''+urlTarget+'\')">View</button>'+
                                      '</div>'+
                                      '</div>'+
                                      '</div>';

                                var infowindow = new google.maps.InfoWindow({
                                    content: windowContent
                                });

                                marker.addListener('click', function() {
                                    infowindow.open(map, marker);
                                });

                                google.maps.event.addListener(map, 'click', function() {
                                    infowindow.close();
                                });
                            });

                            console.log('---------- poi categories (START) -----------');
                            console.log(cats);
                            console.log('---------- poi categories (END) -----------');

                        });
                    });
                },2000);

                //toggle map to hide (we defaulted showMap to true to ensure it loads/renders from google once, otherwise we eat quota)
                //vm.toggleMap();


                //show search criteria (city, country, etc)
                vm.setSearchResultsHeading();

                //update last searched (this can probably replace the sessionService.setLastHotelSearch() call below
                //also, a better implementation would be refresh proof using the local storage, and also keep the last x searches
                hotelSearchService.setLastSearchCriteria();

                //update session service
                sessionService.setLastHotelSearch(hotelSearchService.params, vm.searchresults);

                //unflag wait message
                vm.isButtonDisable = false;
            };
            var eFunc = function (response) {
                vm.isWaiting = false;
                vm.isButtonDisable = false;
                vm.isSearchFormExpanded = true;
                console.log(response);
            };

            //handle validation
            var successFunc = function (response) {
                if (!response.data || !response.data.IsValid) {
                    vm.errs = response.data.Errs;
                    vm.isWaiting = false;
                    vm.isButtonDisable = false;
                    return;
                }

                //get results
                dataFactory.searchHotels(hotelSearchService.params).then(sFunc, eFunc);
            };
            var errFunc = function (response) {
                vm.isWaiting = false;
                vm.isButtonDisable = false;
                vm.errs.push('An error occurred while searching. please try again.');
                return;
            };

            dataFactory.validateSearchHotels(hotelSearchService.params).then(successFunc, errFunc);
        }


        vm.setPriceRange = function(resultSet) {
            if (resultSet.length===0) {
                return;
            }

            vm.prices = [];
            $.each(resultSet,function(idx,hotel) {
                var newPricePoint = 0;
                if (hotel.accessiblego && hotel.accessiblego.cug && hotel.accessiblego.cug.price_details) {
                    newPricePoint = hotel.accessiblego.cug.price_details.display_price;
                } else {
                    newPricePoint = hotel.rate_data.price_details.display_price;
                }
                vm.prices.push(newPricePoint);
            });

            //get min/max
            vm.minPrice = vm.prices.reduce(function(min, n) {
                return min < n?min:n;
            }, vm.prices[0]);

            vm.maxPrice = vm.prices.reduce(function(max, n) {
                return max > n?max:n;
            },vm.prices[0]);

            //set the new range
            vm.optionsWithStart.start = [vm.minPrice,vm.maxPrice];

            //get avg
            var totalAllPrices = vm.prices.reduce(function(m, n) {
                return m + n;
            },vm.prices[0]);
            vm.avgPrice = totalAllPrices/vm.prices.length;

            //ensure we have the absolutes regardless of the timing of cug data coming back
            if (!vm.absMinPrice || !vm.absMaxPrice) {
                vm.absMinPrice = vm.minPrice;
                vm.absMaxPrice = vm.maxPrice;
                vm.optionsWithStart.range = {
                    min: vm.absMinPrice,
                    max: vm.absMaxPrice
                };
            }

            // var html5Slider = document.getElementById('myCoolSlider');
            // if (html5Slider) {
            //     html5Slider.noUiSlider.set([, vm.maxPrice]);
            //     html5Slider.noUiSlider.updateOptions(
            //         {
            //             //set absolute range
            //             range: {
            //                 'min': vm.minPrice,
            //                 'max': vm.maxPrice
            //             }
            //             //set relative (filtered) range

            //         },
            //         true // Boolean 'fireSetEvent'
            //     );
            // }
            //html5Slider.noUiSlider.on('update', doSomething);
        }

        vm.onSliderCreated = function(sliderInstance) {
            var cb = function(a) {
                vm.minPrice = a[0];
                vm.maxPrice = a[1];
                vm.avgPrice = (vm.minPrice+vm.maxPrice)/2;

                vm.setFilteredResults();
            };
            sliderInstance.$on('change', cb)
        }

        //gathers the params, validates them, and goes to state
        function submitSearch() {

            //reset errors

            vm.isButtonDisable = true;
            vm.errs = [];
            vm.showErrors = true;

            //reset results cache

            //todo: can't we just setParams once, cache it, and thereafter we can call a function to
            //validateAndGo anytime we need (w/o having to pass in criteria again?) - we don't need this in session service
            //sessionService.resetLastHotelSearch();

            hotelSearchService.setParams(
                vm.destination,
                vm.hotelDateCheckin,
                vm.hotelDateCheckout,
                vm.hotelSearchRooms,
                vm.hotelSearchAdults,
                vm.hotelSearchChildren,
                vm.hotelSearchRadius);

            //valid?
            if (vm.errs.length > 0) return;

            hotelSearchService.validateAndGo();
        }

        //CUG
        function overlayCUG() {

            var doThisRegardlessofCUGResult = function() {
                vm.setPriceRange(vm.allResults);
                vm.setFilteredResults();
                vm.setSortedResultsTopPicks();
                vm.pushToGA();
            }

            var cugSuccessFunc = function (response) {

                vm.isWaiting = false;

                vm.isCUGResultsReturned = true;

                //unexpected response?
                if (!response.data) {
                    console.log('no cug data found');
                    doThisRegardlessofCUGResult();
                    return;
                }

                if (response.data.errors) {
                    //console.error(response.data.errors);
                    doThisRegardlessofCUGResult();
                    return;
                }

                var cugHotelData = response.data.data.results.hotel_data;

                //extend results with cug info
                //var countOfTotalClubgoDeals = 0;
                for (var c = 0; c < cugHotelData.length; c++) {
                    var h = cugHotelData[c];

                    var n = $filter('filter')(vm.allResults, { id: h.id });
                    if (n && n.length > 0) {

                        //check cug display price is less
                        var regPrice = n[0].rate_data.price_details.display_price;
                        var cugPrice = h.room_data[0].price_details.display_price;

                        if (cugPrice>=regPrice) {
                            continue;
                        }

                        //extend object
                        if (!n[0].accessiblego) n[0].accessiblego = {};

                        //set cug object
                        var cug = {
                            saving_percentage: h.room_data[0].saving_percentage,
                            price_details: h.room_data[0].price_details,
                            room_data: h.room_data[0],
                            ppn_bundle: h.ppn_bundle
                        };

                        n[0].accessiblego.cug = cug;
                        //countOfTotalClubgoDeals++;
                    }
                }

                //vm.totalClubgoDeals = countOfTotalClubgoDeals;

                //apply filter (otherwise "clubgo only" filter checked won't take effect)
                console.log('-------------- calling set price range from overlayCUG');

                doThisRegardlessofCUGResult();
            };

            var cugErrFunc = function (response) {

                vm.isWaiting = false;

                vm.isCUGResultsReturned = true;

                console.error('failed to retrieve cug: ' + response);

                doThisRegardlessofCUGResult();

                return;
            };

            dataFactory.searchCUGHotels(hotelSearchService.params).then(cugSuccessFunc, cugErrFunc);
        }

        function pushToGA() {
            //push event to GA
            if (vm.filteredResults.length>0) {
                var firstResult = vm.filteredResults[0];
                var ppnHotelIds = vm.filteredResults.map(function(r) { return r.id;}).slice(0,10);
                var eventData = {
                    content_type: 'hotel',  //must be set to hotel for hotel ads
                    content_ids: ppnHotelIds,
                    city: firstResult.address.city_name,
                    region: firstResult.address.state_name,
                    country: firstResult.address.country_name,
                    checkin_date: dateFns.format(hotelSearchService.params.checkin, 'YYYY-MM-DD'),
                    checkout_date: dateFns.format(hotelSearchService.params.checkout, 'YYYY-MM-DD')
                }
                dataLayerService.pushEvent({event: 'Search', data: eventData});
            }
        }

        //get reviews
        function overlayReviews() {
            var reviewsSuccessFunc = function (response) {

                vm.isHotelReviewsReturned = true;

                //unexpected response?
                if (!response.data) {
                    console.log('no review data found');
                    return;
                }

                if (response.data.errors) {
                    return;
                }

                var hotelReviewData = response.data;

                //count hotels having reviews
                var reviewCount = 0;

                //extend results with reviews
                for (var c = 0; c < hotelReviewData.length; c++) {
                    var review = hotelReviewData[c];

                    if (review.status !== 'confirmed') {
                        continue;
                    }

                    var n = $filter('filter')(vm.allResults, function(value, index, array) {
                        return value.id === review.ppnid;
                    });
                    if (n && n.length > 0) {

                        //ensure accessiblego obj created
                        if (!n[0].accessiblego) n[0].accessiblego = {};
                        
                        //ensure review object created
                        if (!n[0].accessiblego.reviews) n[0].accessiblego.reviews = [];
                        n[0].accessiblego.reviews.push(review);

                        //augment
                        reviewCount++;
                    }
                }

                //sort
                vm.setSortedResultsTopPicks();
            };

            var reviewsErrFunc = function (response) {
                console.log('failed to retrieve reviews');
                console.log(response);
                return;
            };

            dataFactory.getAllHotelReviewData().then(reviewsSuccessFunc, reviewsErrFunc);
        }

        function unlockDeals() {

            //TODO: handle case when user (1) not logged in, (2) has an account (3) does not have clubGO--> this redirect works for 2+3 but not 1+2+3
            //set post join/login redirection
            redirectionService.setRedirect({ to: 'hotels', params: $stateParams });

            //if already authenticated, send them to the account section
            if (localStorageService.getAuthenticationState()) {
                $state.go('accountPageUi', { t: 'club' });
                return;
            }

            //show join with context specific text
            var cb = function() {
            };
            var params = {
                onSuccessFunc: cb,
                text: {
                    heading: 'Free Membership',
                    subHeadingJoin: 'Create an account to access clubGO',
                    subHeadingLogin: 'Login to access clubGO'
                }
            };
            joinModalService(params);
        }

        //-- WATCHING
        $scope.hotelSearchService = hotelSearchService;
        $scope.$watch('hotelSearchService.errs', function (newvalue) {
            vm.errs = newvalue;
            if (vm.errs.length > 0) {
                vm.isButtonDisable = false;
            }
        }, true);

        // $scope.$watch("vm.isAccessibleFilter",function(newVal) {
        //   if (!newVal) return;
        //   vm.setFilteredResults();
        // });

        $scope.$watch("vm.filters.isCugFilter",function(newVal) {
            if (newVal === undefined) return;
            if (!vm.isHotelReviewsReturned || !vm.isCUGResultsReturned) return;
            console.log('-------------- calling set price range from watch isCugFilter');
            vm.setPriceRange(vm.allResults);
            vm.setFilteredResults();
        });

        //left off here
        $scope.$watch("vm.filters.hasReviews",function(newVal) {
            if (newVal === undefined) return;
            if (!vm.isHotelReviewsReturned || !vm.isCUGResultsReturned) return;
            console.log('-------------- calling set price range from hasReviews');
            vm.setPriceRange(vm.allResults);
            vm.setFilteredResults();
        });

        // $scope.$watch("vm.isClubGOFilter",function(newVal) {
        //   vm.includeFilterClubGO();
        // })

        //handle filter change for chain
        $scope.$watch("vm.filters.hotelChain", function(newvalue) {
            //if (!newvalue) return;
            if (!vm.isHotelReviewsReturned || !vm.isCUGResultsReturned) return;
            console.log('-------------- calling set price range from hotelChain');
            vm.setPriceRange(vm.allResults);
            vm.setFilteredResults();
        },true);

        //$scope.$watch("vm.priceGroups", function(newvalue) {
        // $scope.$watch("vm.filters.priceGroups", function(newvalue) {
        //     if (!newvalue) return;
        //     vm.setFilteredResults();
        // },true);

        $scope.$watch("vm.filters.accessibleAmenityMap", function(newvalue) {
            if (!newvalue) return;
            if (!vm.isHotelReviewsReturned || !vm.isCUGResultsReturned) return;
            console.log('-------------- calling set price range from accessibleAmenityMap');
            vm.setPriceRange(vm.allResults);
            vm.setFilteredResults();
        },true);


        //respond to filter change :: general amenity
        $scope.$watch("vm.generalAmenityTracker", function(newvalue) {
            if (!newvalue) return;
            if (!vm.isHotelReviewsReturned || !vm.isCUGResultsReturned) return;
            console.log('-------------- calling set price range from generalAmenityTracker');
            vm.setPriceRange(vm.allResults);
            vm.setFilteredResults();
        },true);


        vm.populateGeneralAmenityFilterOptions = function() {

            //only track the following:
            //var trackOnly = ['Free Breakfast','Swimming Pool','Free Internet','Free Parking','Pets Allowed','Non Smoking','Free Airport Shuttle','Fitness Center','Business Center']

            vm.generalAmenityTracker['Free Breakfast'] = { fa:'fa fa-coffee', count: 0 };
            vm.generalAmenityTracker['Swimming Pool'] = { iconify:'fa-solid:swimming-pool', count: 0 };
            vm.generalAmenityTracker['Free Internet'] = { fa:'fa fa-wifi', count: 0 };
            vm.generalAmenityTracker['Free Parking'] = { iconify:'fa-solid:parking', count: 0 };
            vm.generalAmenityTracker['Pets Allowed'] = { fa:'fa fa-paw', count: 0 };
            vm.generalAmenityTracker['Non Smoking'] = { iconify:'ion:logo-no-smoking', count: 0 };
            vm.generalAmenityTracker['Free Airport Shuttle'] = { fa:'fa fa-bus', count: 0 };
            vm.generalAmenityTracker['Fitness Center'] = { iconify:'fa-solid:dumbbell', count: 0 };
            vm.generalAmenityTracker['Business Center'] = { iconify:'foundation:torso-business', count: 0 };

            //for each hotel
            $.each(vm.allResults,function(idx,hotel) {
                //for each hotel amenity
                $.each(hotel.amenity_data,function(idx,amenity) {
                    //if (trackOnly.indexOf(amenity.name) === -1) return; //aka continue

                    if (!vm.generalAmenityTracker[amenity.name]) {
                        return; //aka continue
                        //vm.generalAmenityTracker[amenity.name] = { name: amenity.name,  checked: false, count: 0 };
                    }
                    vm.generalAmenityTracker[amenity.name].count++;
                });
            });
        }

        vm.populateAccessibleAmenityFilterOptions = function() {
            dataFactory.getCustomAmenityData().then(function(res) {
                vm.accessibleAmenityData = res.data.Data;

                vm.amenityTrackerTotals = [];
                //associate accessibility data with hotel results
                //todo: determine if performance needs to be improved here
                //todo: you are also using this in hotelcontroller - abstract into a service that has methods to give you the augmented data you need
                if (vm.accessibleAmenityData) {
                    for (var h = 0; h < vm.allResults.length; h++) {
                        var hotelObj = vm.allResults[h];
                        for (var a = 0; a < vm.accessibleAmenityData.length; a++) {
                            var amenityObj = vm.accessibleAmenityData[a];
                            if (hotelObj.id === amenityObj.PPNId) {
                                hotelObj.hasAugmentedData = true;
                                if (!hotelObj.augmentedData) {
                                    hotelObj.augmentedData = [];
                                }
                                if (amenityObj.name != 'Notes') {
                                    hotelObj.augmentedData.push(amenityObj);

                                    //add to global totals
                                    if (!vm.amenityTrackerTotals[amenityObj.name]) {
                                        vm.amenityTrackerTotals[amenityObj.name] = 0;
                                    }
                                    vm.amenityTrackerTotals[amenityObj.name]++;
                                }
                            }
                        }
                    }
                }

                //setup search filters
                if (vm.accessibleAmenityData) {

                    var map = vm.filters.accessibleAmenityMap;

                    for (var a = 0; a < vm.accessibleAmenityData.length; a++) {
                        var amenityObj = vm.accessibleAmenityData[a];

                        //current group key
                        var key = amenityObj.categoryGroup;

                        //add group to map if not exists
                        if (key in map) {
                            //do nothing
                        } else {
                            var isFirstGroup = (key==='Accessible Entrance & Main Areas');
                            map[key] = { title: amenityObj.categoryGroup, checked: isFirstGroup, items: {} };
                        }

                        //add items if not exist
                        var itemKey = amenityObj.name;
                        if (itemKey in map[key].items) {
                            //do nothing
                        } else {
                            var total = 0;
                            if (vm.amenityTrackerTotals[amenityObj.name]) {
                                total = vm.amenityTrackerTotals[amenityObj.name];
                            }
                            map[key].items[itemKey] = { title: amenityObj.name, checked: false, img: amenityObj.img, total: total };
                        }

                        //vm.accessibilityAmenityGroups.push(group);
                    }

                    //vm.accessibilityAmenityGroups = map;
                }

            });
        }



        // vm.toggleAccAmenCategory = toggleAccAmenCategory;
        // function toggleAccAmenCategory(category) {
        //     //adjust UI
        //     var map = vm.filters.accessibleAmenityMap;
        //     for (var key in map) {
        //         if (!map.hasOwnProperty(key)) continue;
        //         var groupObj = map[key];
        //         if (groupObj.title !== category) continue;
        //         for (var prop in groupObj.items) {
        //             //if(!groupObj.hasOwnProperty(groupObj.items[prop])) continue;
        //             groupObj.items[prop].checked = !groupObj.items[prop].checked;
        //         }
        //     }
        //     //apply
        //     vm.setFilteredResults();
        // }

        function setSearchResultsHeading() {
            if (!vm.searchresults) return;
            if (!vm.filteredResults) return;
            if (vm.filteredResults.length === 0) return;

            //var hotelAddress = vm.searchresults.hotel_data[0].address;

            //capture result city/country
            //todo: handle if poi, airport, etc
            //vm.resultCity = hotelAddress.city_name;
            //vm.resultCountry = hotelAddress.country_name;
        }

        function getArray(num, includeWhite) {
            var a = new Array(5);
            if (!num) return a; //new Array(0);
            for (var i = 0; i < 5; i++) {
                if (i < parseInt(num)) {
                    a[i] = vm.image_starOrange;  //'/web/public/resources/Star_Orange.png';
                } else {
                    if (includeWhite) {
                        a[i] = vm.image_starWhite; //'/web/public/resources/Star_White.png';
                    }
                }
            }
            return a;
        }
        function resetErrs() {
            vm.errs = [];
            hotelSearchService.errs = [];
        }

        //--> paging for this section
        function resetCurrentPage() {
            vm.currentPage = 0;
        }
        function hotelsToShow() {
            if (!vm.searchresults) return;
            return vm.filteredResults;
        }
        function getNumberOfPages() {
            //if (!vm.hotelsToShow()) return 0;
            if (vm.filteredResults.length === 0) return 0;
            return Math.ceil(vm.filteredResults.length / vm.pageSize);
        }

        function getPages() {
            var len = vm.getNumberOfPages();
            return new Array(len);
        }

        function goToPage(index) {
            vm.currentPage = index;
            vm.scrollTopFun();
        }

        function ShowPrev() {
            vm.currentPage = vm.currentPage - 1;
            vm.scrollTopFun();
        }
        function ShowNext() {
            vm.currentPage = vm.currentPage + 1;
            vm.scrollTopFun();

        }

        function scrollTopFun() {
            document.body.scrollTop = 0;         // For Safari
            document.documentElement.scrollTop = 0;   // For Chrome, Firefox, IE and Opera
        }

        $rootScope.$watch('isAuthenticated', function (newVal, oldVal) {
            vm.showJoinModalImage = !localStorageService.getAuthenticationState();
        });

        vm.disableJoinModalImage = false;
        function launchJoinModal() {
            vm.disableJoinModalImage = true;
            var cb = function () {
                vm.disableJoinModalImage = false;
            };
            if (!localStorageService.getAuthenticationState()) {
                var params = {
                    onSuccess: cb
                };
                joinModalService(params);
            }
        }

        vm.getStartFrom = getStartFrom;
        function getStartFrom() {
            if (vm.currentPage && vm.pageSize) {
                return vm.currentPage * vm.pageSize;
            }
            return 0;
        }


        //--> process
        function viewHotel(hotelId) {
          var searchParams = {
            hid: hotelId,
            checkin: utilities.getUrlSafeDate(vm.hotelDateCheckin),
            checkout: utilities.getUrlSafeDate(vm.hotelDateCheckout),
            rooms: vm.hotelSearchRooms,
            adults: vm.hotelSearchAdults,
            children: vm.hotelSearchChildren,
            destination: vm.destination.display
            //anchor: 'sectionAmenities'
          };
          $state.go('hotel', searchParams);
        }

        function gotoHotel(event, idx) {
            if (!idx) return;
            var hotel = vm.filteredResults[idx];
            vm.viewHotel(hotel.id);
        }

        vm.getDottedDate = getDottedDate;
        function getDottedDate(date) {
            if (!date) return null;
            return (date.getMonth() + 1) + "." + date.getDate() + "." + date.getFullYear();
        }

        //using hotelUtilities
        vm.getAddress = getAddress;
        function getAddress(addressObj) {
            return hotelUtilities.getAddress(addressObj);
        }

        //----------- FILTER
        // vm.includeFilterClubGO = includeFilterClubGO;
        // function includeFilterClubGO() {
        //   vm.setFilteredResults();
        // }

        function setFilteredResults() {
            vm.totalClubgoDeals = 0;
            vm.totalAccessibleHotels = 0;
            vm.totalReviews = 0;

            vm.filteredResults = $filter('filter')(
                vm.allResults,
                vm.resultsFilterFunc
            );

            //update price range filter based on new filter
            console.log('-------------- calling set price range from setFilteredResults');
            vm.setPriceRange(vm.filteredResults);

            //vm.setSortedResultsTopPicks();
            vm.sortOptionChanged();
            vm.addBadge();
        }


//what filtering is happening before page is ready?
        vm.resultsFilterFunc = resultsFilterFunc;
        function resultsFilterFunc(item, idx, arr) {

            var hotelAugmentedData = item.augmentedData;

            //todo: make filter quicker by
            //1. presetting properties of the hotel so that all you are doing here is comparing against those properties
            //2. separating out the check for filter like we started with vm.isAccessibleFilterSpecified

            //item.rate_data = vm.isCUG? item.room_data[0]:item.rate_data;

            //a. must have rates
            var hasRates = item.rate_data.price_details.display_price !== null;
            //verdict
            if (!hasRates) {
                console.log('does not have rates:');
                console.log(item);
                return false;
            }

            //b. must be accessible
            // if (vm.isAccessibleFilter && vm.isAccessibleFilter === true) {
            //   //check our data
            //   if (hotelAugmentedData && hotelAugmentedData.length > 0) {
            //     item.isAccessible = true;
            //   } else {
            //     //check ppn data
            //     for (var i = 0; i < item.amenity_data.length; i++) {
            //       if (item.amenity_data[i].name.indexOf('Accessible') > -1) {
            //         item.isAccessible = true; //take the opportunity here to mark hotel
            //         break;
            //       }
            //     }
            //   }
            //   if (!item.isAccessible) {
            //     return false;
            //   }
            // }

            //handle if cug filter specified
            if (vm.filters.isCugFilter && vm.filters.isCugFilter === true) {
                if (!item.accessiblego || item.accessiblego.cug === undefined) {
                    console.log('eliminating from filter (not cug): ' + item.name);
                    return false;
                }
            }

            //filter :: reviews
            if (vm.filters.hasReviews && vm.filters.hasReviews === true) {
                if (!item.accessiblego || !item.accessiblego.reviews || item.accessiblego.reviews.length === 0) {
                    console.log('eliminating from filter (nor reviews): ' + item.name);
                    return false;
                }
            }

            //filter :: hotel chain
            if (vm.filters.hotelChain) {
                if (item.hotel_chain.name !== vm.filters.hotelChain.name) {
                    console.log('eliminating from filter (not matching chain name): ' + item.name);
                    return false;
                }
            }

            //filter :: price range
//left off here - you commented this out to see if the price range min price would show correctly
//on first launch, and it does, so something below is causing the min price to be at 20 instead of 18.70
            var price = 0;
            if (item.accessiblego && item.accessiblego.cug && item.accessiblego.cug.price_details) {
                price = parseFloat(item.accessiblego.cug.price_details.display_price);
            } else {
                price = item.rate_data.price_details.display_price;
            }
            if (price < vm.minPrice || price > vm.maxPrice) {
                console.log('eliminating from filter (not meeting price): ' + item.name);
                return false;
            }

            // var n = $filter('filter')(vm.allResults, { id: h.id });
            // if (n && n.length > 0) {
            //   if (!n[0].accessiblego) n[0].accessiblego = {};
            //   var cug = {
            //     saving_percentage: h.room_data[0].saving_percentage,
            //     price_details: h.room_data[0].price_details,
            //     room_data: h.room_data[0],
            //     ppn_bundle: h.ppn_bundle
            //   };
            //   n[0].accessiblego.cug = cug;
            // }


            //filter :: hotel name search
            var isHotelNameFilterSpecified = false;
            var isHotelNameMatch = false;
            isHotelNameFilterSpecified = (vm.filterText && vm.filterText !== '');
            if (!isHotelNameFilterSpecified || (isHotelNameFilterSpecified && (item.name.toLowerCase().indexOf(vm.filterText.toLowerCase()) !== -1))) {
                isHotelNameMatch = true;
            }
            //verdict
            if (!isHotelNameMatch) {
                console.log('eliminating from filter (not matching hotel name search): ' + item.name);
                return false;
            }

            // //d. if specified: within price range
            // var isPriceRangeMatch = false;
            // var isPriceMatchSelected = false;
            // var isPriceMatch = false;
            // var price = item.rate_data.price_details.display_price;
            // if (price) {  //guard against undefined
            //     for (var p = 0; p < vm.filters.priceGroups.length; p++) {
            //         var priceRange = vm.filters.priceGroups[p];
            //         if (priceRange.checked) {
            //             isPriceMatchSelected = true;
            //             if (price >= priceRange.min && price <= priceRange.max) {
            //                 isPriceMatch = true;
            //                 break;
            //             }
            //         }
            //     }
            // }
            // if (!isPriceMatchSelected || isPriceMatch) {
            //     isPriceRangeMatch = true;
            // }
            // //verdict
            // if (!isPriceRangeMatch) {
            //     return false;
            // }

            // //e. if specified: star rating
            // // var isStarRatingMatch = false;
            // // var isStarRatingSpecified = false;
            // // var isStarMatch = false;
            // // var star = item.star_rating;
            // // if (star) {  //guard against undefined
            // //   for (var s = 0; s < vm.filters.starGroups.length; s++) {
            // //     var starObj = vm.filters.starGroups[s];
            // //     if (starObj.checked) {
            // //       isStarRatingSpecified = true;
            // //       if (parseInt(star) === starObj.numStars) {
            // //         isStarMatch = true;
            // //         break;
            // //       }
            // //     }
            // //   }
            // // }
            // // if (!isStarRatingSpecified || isStarMatch) {
            // //   isStarRatingMatch = true;
            // // }
            // // //verdict
            // // if (!isStarRatingMatch) {
            // //   return false;
            // // }

            // //f. if specified: club go
            // // var isClubGOFilterSpecified = false;
            // // var isClubGOMatch = false;
            // // isClubGOFilterSpecified = (vm.isClubGOFilter && vm.isClubGOFilter === true);
            // // if (!isClubGOFilterSpecified || (isClubGOFilterSpecified && item.accessiblego) !== -1) {
            // //   isClubGOMatch = true;
            // // }
            // // //verdict
            // // if (!isClubGOMatch) {
            // //   return false;
            // // }

            // //g. accessibility amenity data
            var isAugmentedAmenitiesMatch = false;
            var isAugmentedAmenitiesFilterSpecified = false;
            var isAugmentedAmenityMatch = [];

            //determine if filter is specified
            var map = vm.filters.accessibleAmenityMap;
            for (var key in map) {
                if (!map.hasOwnProperty(key)) continue;
                var groupObj = map[key];
                for (var prop in groupObj.items) {
                    //if(!groupObj.hasOwnProperty(groupObj.items[prop])) continue;
                    if (groupObj.items[prop].checked) {
                        isAugmentedAmenitiesFilterSpecified = true;
                        break;
                    }
                }
            }
            // for(var h=0;h<vm.accessibilityAmenityGroups.length;h++) {
            //   if (vm.accessibilityAmenityGroups[h].checked) {
            //     isAugmentedAmenitiesFilterSpecified = true;
            //   }
            // }

            if (hotelAugmentedData && hotelAugmentedData.length > 0) {

                //aside: take opportunity here
                item.isAccessible = true;

                for (var key2 in map) {
                    if (!map.hasOwnProperty(key2)) continue;
                    var groupObj2 = map[key2];
                    for (var prop2 in groupObj2.items) {
                        if (groupObj2.items[prop2].checked) {
                            var isFound = false;
                            for (var x = 0; x < hotelAugmentedData.length; x++) {

                                //TODO: clean up some data! && hotelAugmentedData[x].value.startsWith('Y')
                                if (groupObj2.items[prop2].title === hotelAugmentedData[x].name) {
                                    isFound = true;
                                    break;
                                }
                            }

                            isAugmentedAmenityMatch.push(isFound);

                        }
                    }
                }
                // for(var had=0;had<vm.accessibilityAmenityGroups.length;had++) {
                //   var augAmenitiesObj = vm.accessibilityAmenityGroups[had];
                //   if (augAmenitiesObj.checked) {
                //     var isFound = false;
                //     for(var x=0;x<hotelAugmentedData.length;x++) {
                //       if (hotelAugmentedData[x].categoryGroup === augAmenitiesObj.title) {
                //         isFound = true;
                //       }
                //     }

                //     isAugmentedAmenityMatch.push(isFound);
                //   }
                // }
            } else {
                isAugmentedAmenityMatch.push(false);
            }
            if (!isAugmentedAmenitiesFilterSpecified || isAugmentedAmenityMatch.indexOf(false) === -1) {
                isAugmentedAmenitiesMatch = true;
            }
            //verdict
            if (!isAugmentedAmenitiesMatch) {
                return false;
            }


            //for each general amenity
            var isGood = true;
            $.each(vm.generalAmenityTracker,function(idx,amenity) {
                if (amenity.checked) {

                    //for each amenity of hotel
                    var passthru = false;

                    $.each(item.amenity_data, function(i,a) {
                        if (a.name === amenity.name) {
                            passthru = true;
                            return false;   //aka break
                        }
                    });

                    if (passthru === false) {
                        isGood = false;
                        return false;
                    }
                }
            });
            if (isGood !== true) {
                return false;
            }



            // //passes users filter selections
            if (item.accessiblego && item.accessiblego.cug) { vm.totalClubgoDeals++; }
            if (item.isAccessible) { vm.totalAccessibleHotels++; }
            if (item.accessiblego && item.accessiblego.reviews) { vm.totalReviews++; }

            return true;  //hasRates && isAccessibleMatch && isHotelNameMatch && isPriceRangeMatch && isStarRatingMatch && isAugmentedAmenitiesMatch;
        }




        function addBadge() {
            vm.badges = [];
            vm.filterPriceBadge = [];
            vm.filterAmenityMapBadge = [];
            vm.filterStarBadge = [];

            //club go deals
            if (vm.filters.isCugFilter) {
                vm.badges.push({ id: 'clubGO', heading: 'clubGO', name: 'Deals'});
            }

            //reviews
            if (vm.filters.hasReviews) {
                vm.badges.push({ id: 'reviews', heading: 'Accessibility Reviews', name: 'Yes'});
            }

            //hotel chain
            if (vm.filters.hotelChain) {
                vm.badges.push({id: 'hotelChain', heading: 'Hotel Chain', name: vm.filters.hotelChain.name});
            }

            // vm.filters.priceGroups.forEach( function(p) {
            //     if (p.checked) {
            //         vm.filterPriceBadge.push(p);
            //     }
            // });

            // vm.filters.starGroups.forEach( function(s) {
            //   if (s.checked) {
            //     vm.filterStarBadge.push(s);
            //   }
            // });


            var map = vm.filters.accessibleAmenityMap;
            for (var amenityKey in map) {
                var amenityObj = map[amenityKey];
                // if (amenityObj.checked) {
                for (var a in amenityObj.items) {
                    if (amenityObj.items[a].checked) {
                        {
                            // amenityObj.items[a].parentTitle = amenityObj.title;
                            vm.filterAmenityMapBadge.push(amenityObj.items[a]);
                        }
                    }
                }
                // }
            }

        }

        function removeBadge(obj, badgeName) {

            if (badgeName === 'clubGO') {
                vm.filters.isCugFilter = false;
            }

            if (badgeName === 'reviews') {
                vm.filters.hasReviews = false;
            }

            if (badgeName == 'hotelChain') {
                vm.filters.hotelChain = undefined;
            }

            // if (badgeName === 'price') {
            //     vm.filters.priceGroups.forEach( function(price) {
            //         if(price.title===obj.title){
            //             obj.checked=false;
            //         }
            //     });
            // }

            // if (badgeName === 'starRating') {
            //   vm.filters.starGroups.forEach( function(stars) {
            //     if (stars.numStars === obj.numStars) {
            //       obj.checked = false;
            //     }
            //   });
            // }

            if (badgeName === 'amenity') {
                var map = vm.filters.accessibleAmenityMap;
                for (var amenityKey in map) {
                    var amenityObj = vm.filters.accessibleAmenityMap[amenityKey];
                    // if (amenityObj.title === obj.parentTitle) {
                    for (var a in amenityObj.items) {
                        if (amenityObj.items[a].title === obj.title) {
                            {
                                amenityObj.items[a].checked = false;
                                break;
                            }
                        }
                    }
                    // }
                }
            }

            vm.setFilteredResults();
        }

        vm.setSortedResultsTopPicks = setSortedResultsTopPicks;
        function setSortedResultsTopPicks() {

            vm.sortBy = 'OurTopPicks';
            var sortString = [
                //+, Reviews, Data
                function(hotel) {
                    return (hotel.accessiblego!==undefined && hotel.accessiblego.cug && hotel.accessiblego.reviews && hotel.accessiblego.reviews.length>0 && hotel.hasAugmentedData===true)?1:0;
                },
                //clubGO, Reviews
                function(hotel) {
                    return (hotel.accessiblego!==undefined && hotel.accessiblego.cug && hotel.accessiblego.reviews && hotel.accessiblego.reviews.length>0)?1:0;

                },
                //clubGO, Data
                function(hotel) {
                    return (hotel.accessiblego!==undefined && hotel.accessiblego.cug && hotel.hasAugmentedData===true)?1:0;
                },
                //clubGO
                function(hotel) {
                    return (hotel.accessiblego!==undefined && hotel.accessiblego.cug)?1:0;
                },
                //Reviews, Data
                function(hotel) {
                    return (hotel.accessiblego!==undefined && hotel.accessiblego.reviews && hotel.accessiblego.reviews.length>0 && hotel.hasAugmentedData===true)?1:0;
                },
                //Reviews
                function(hotel) {
                    return (hotel.accessiblego!==undefined && hotel.accessiblego.reviews && hotel.accessiblego.reviews.length>0)?1:0;
                },
                //Data
                function(hotel) {
                    return (hotel.hasAugmentedData===true)?1:0;
                },

                //use lowest price as a tie-breaker
                function(hotel) {
                    if (hotel.accessiblego && hotel.accessiblego.cug && hotel.accessiblego.cug.price_details) {
                        return -hotel.accessiblego.cug.price_details.display_price;
                    }
                    return -hotel.rate_data.price_details.display_price;
                }

            ];

            vm.filteredResults = $filter('orderBy')(
                vm.filteredResults,
                sortString,
                true
            );
        }

        function setSortedResultsLowestFirst() {
            vm.sortBy = 'LowestPriceFirst';
            vm.filteredResults = $filter('orderBy')(
                vm.filteredResults,
                function(hotel) {
                    if (hotel.accessiblego && hotel.accessiblego.cug && hotel.accessiblego.cug.price_details) {
                        return hotel.accessiblego.cug.price_details.display_price;
                    }
                    return hotel.rate_data.price_details.display_price;
                },
                false
            );


            // vm.sortString = [
            //   function(hotel) {
            //     return hotel.accessiblego!==undefined;
            //   },function(hotel) {
            //     return hotel.hasAugmentedData===true;
            //   }
            // ];

            // vm.filteredResults = $filter('orderBy')(
            //   vm.filteredResults,
            //   vm.sortString,
            //   true
            // );
        }

        function setSortedResultsHighestFirst() {
            vm.sortBy = 'HighestPriceFirst';
            vm.filteredResults = $filter('orderBy')(
                vm.filteredResults,
                function(hotel) {
                    if (hotel.accessiblego && hotel.accessiblego.cug && hotel.accessiblego.cug.price_details) {
                        return hotel.accessiblego.cug.price_details.display_price;
                    }
                    return hotel.rate_data.price_details.display_price;
                },
                true
            );
        }

        function setSortedResultsClubgoFirst() {
            vm.sortBy = 'ClubgoFirst';
            vm.filteredResults = $filter('orderBy')(
                vm.filteredResults,
                'accessiblego.cug!==undefined',
                true
            );
        }

        //funtion for toggel filter drawer in mobile view
        function toggleHotelFilterDrawer() {
            var drawerWidth = document.getElementById("hotelFilterDrawer").style.width;

            if (drawerWidth == "300px") {
                document.getElementById("hotelFilterDrawer").style.width = "0";
                document.getElementById("hotelFilterDrawer").style.display = "none";
                //document.getElementsByClassName("drawerTopBar")[0].style.position = "";
            }

            else {
                document.getElementById("hotelFilterDrawer").style.width = "300px";
                document.getElementById("hotelFilterDrawer").style.display = "block";
                //document.getElementsByClassName("drawerTopBar")[0].style.position = "fixed";
            }

        }



        //- filter hotel by name (this was never working)
        function handleHotelNameSearchTextChange() { //hotel, index, array) {
            console.log('-------------- calling set price range from handleHotelNameSearchTextChange');
            if (!vm.isHotelReviewsReturned || !vm.isCUGResultsReturned) return;
            vm.setPriceRange(vm.allResults);
            vm.setFilteredResults();
        }







        //----------- MAP
        function setMapVisibility() {

            //show map only in production
            // if (vm.env.name !== 'production') {
            //     vm.showMap = false;
            //     return;
            // }

            var width = window.screen.availWidth;
            if (width < 991) {
                vm.showMap = false;
            }
            else {
                vm.showMap = true;
            }
        }

        function toggleMap() {
            vm.showMap = !vm.showMap;
            // if (!vm.map) {
            //   vm.map = NgMap.initMap('googleMap');
            // }

            //     <script
            //   type="text/javascript"
            //   src="https://maps.google.com/maps/api/js?key=AIzaSyDkitKzViB8jnu4qsvYhqH_27lj404rrAA">
            // </script>

            //resize is a hack to get it to show
            // if (vm.showMap) {
            //     $timeout(function () {
            //         NgMap.getMap({ id: 'googleMap' }).then(function (response) {
            //             google.maps.event.trigger(response, 'resize');
            //         });
            //     }, 500);
            // }
        }


        vm.review = review;
        function review(hid) {
            $state.go('reviewHotel', { hid: hid });
        }

        vm.moveToCheckin = function () {
            vm.focusTimeout('checkin');

        };

        vm.moveToCheckout = function () {
            vm.focusTimeout('checkout');
        };

        vm.hotelSearchRoomsButton = function () {
            vm.focusTimeout('hotelSearchRoomsButton');
        };

        vm.hotelSearchAdultsButton = function () {
            vm.focusTimeout('hotelSearchAdultsButton');
        };

        vm.hotelSearchChildrenButton = function () {
            vm.focusTimeout('hotelSearchChildrenButton');
        };
        // vm.goToAccessCheck = function(target) {
        //   $window.open('https://go.accessiblego.com/access-check', '_'+target);
        // }

        vm.moveToSearchButton = function () {
            vm.focusTimeout('hotelSearchSubmit');
        };

        vm.focusTimeout = function (elem) {
            $timeout(function () {
                angular.element('#' + elem).find('button').trigger('click');
            });
        };

        //-- CUG --//
        function setCUGDisplayState() {
            if (!$rootScope.isAuthenticated || !$rootScope.userCUGDetails) {
                vm.displayState = 'unlock';
                return;
            }

            //allow user to access cug details if eligibility is pending (p) or accepted (a)
            if (['a', 'p'].indexOf($rootScope.userCUGDetails.statusCode) > -1) {
                vm.displayState = 'club';
            }
        }

        vm.getGuestAccessibilityScore = getGuestAccessibilityScore;
        function getGuestAccessibilityScore(hotel) {
            if (!hotel || !hotel.accessiblego || !hotel.accessiblego.reviews || hotel.accessiblego.reviews.length===0) {
                return undefined;
            }

            var total = 0;
            for(var i = 0; i < hotel.accessiblego.reviews.length; i++) {
                total += hotel.accessiblego.reviews[i].rating;
            }
            var avg = total / hotel.accessiblego.reviews.length;
            return avg;
        }

        vm.showDetail = function(e, hotel) {
            vm.selectedHotel = hotel;
            vm.map.showInfoWindow('foo-iw', hotel.id);
        }
        vm.clicked = function() {
            alert('Clicked a link inside infoWindow');
        };

        // vm.getDistanceFrom = function(hotelGeo) {
        //     //safety
        //     if (!vm.searchresults || !vm.searchresults.filter_data || !vm.searchresults.filter_data.latitude || !vm.searchresults.filter_data.longitude) return 'near';
            
        //     var from = new google.maps.LatLng({
        //         lat: parseFloat(vm.searchresults.filter_data.latitude),
        //         lng: parseFloat(vm.searchresults.filter_data.longitude)
        //     });

        //     var to = new google.maps.LatLng({
        //         lat: hotelGeo.latitude,
        //         lng: hotelGeo.longitude
        //     });

        //     //we do not want as the crow flies (aka haversine formula)
        //     //var meters = google.maps.geometry.spherical.computeDistanceBetween(from,to);
        //     //var miles = meters/1609.344;

        //     var service = new google.maps.DistanceMatrixService();
        //     service.getDistanceMatrix(
        //       {
        //         origins: [origin1, origin2],
        //         destinations: [destinationA, destinationB],
        //         travelMode: 'DRIVING',
        //         transitOptions: TransitOptions,
        //         drivingOptions: DrivingOptions,
        //         unitSystem: UnitSystem,
        //         avoidHighways: Boolean,
        //         avoidTolls: Boolean,
        //       }, callback);

        //     return vm.roundUp(miles,2);
        // }

        // //TODO: move to utilities
        // vm.roundUp = function(num, precision) {
        //   precision = Math.pow(10, precision)
        //   return Math.ceil(num * precision) / precision
        // };




    };

  hotelsController.$inject = ['$rootScope', '$scope', '$state', '$timeout', '$filter', 'dataFactory', '$stateParams', 'hotelSearchService', 'sessionService', 'hotelUtilities', 'NgMap', 'utilities', 'localStorageService', 'joinModalService', 'redirectionService', 'environmentService', 'hotelLookupService', 'hotelSearchFilterService','$window','dataLayerService'];
  app.controller('hotelsController', hotelsController);
};
