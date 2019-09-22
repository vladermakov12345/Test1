module.exports = function (app) {
  var hotelsController = function ($rootScope, $scope, $state, $timeout, $filter, dataFactory, $stateParams, hotelSearchService, sessionService, hotelUtilities, NgMap, utilities, localStorageService, joinModalService, redirectionService, environmentService, hotelLookupService, hotelSearchFilterService) {
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
    vm.hotelDestinationType = 'city';

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

    //globally peristed hotel search filters
    
    vm.toggleHotelFilterDrawer = toggleHotelFilterDrawer;
    //vm.filterByHotelName = "";

    // filter for badge
    vm.removeBadge = removeBadge;
    vm.addBadge = addBadge;

    //results
    vm.isWaiting = false;
    vm.isButtonDisable = false;
    vm.searchCriteria = '';
    //vm.resultCity = '';
    //vm.resultCountry = '';
    vm.isCUGResultsReturned = false;
    vm.isHotelReviewsReturned = false;

    //cug
    vm.displayState = 'unlock';
    vm.setCUGDisplayState = setCUGDisplayState;
    vm.unlockDeals = unlockDeals;

    //googlemap
    vm.showMap = true;
    vm.toggleMap = toggleMap;
    vm.setMapVisibility = setMapVisibility;
    //$scope.googleMapsUrl="https://maps.google.com/maps/api/js?key=AIzaSyDkitKzViB8jnu4qsvYhqH_27lj404rrAA";
    //https://maps.google.com/maps/api/js

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
    //vm.viewHotel = viewHotel;

    require("./hotels.less");
    vm.image_starOrange = require("../../../resources/img/common/Star_Orange.png");
    vm.image_starWhite = require("../../../resources/img/common/Star_White.png");

    vm.CUG_listing_Club_Deal = require("../../../resources/img/hotels/CUG_listing_Club_Deal.png");
    vm.CUG_listing_Unlock_Club_Deal = require("../../../resources/img/hotels/CUG_listing_Unlock_Club_Deal.png");

    vm.init();

    function init() {

      //show the map?
      vm.setMapVisibility();
      $(window).resize(function () {
        setMapVisibility();
      });

      //map
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
        display: hotelSearchService.params.display
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

      //criteria
      vm.searchCriteria = hotelSearchService.params.display;

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


      //LEFT OFF HERE, next steps are
      /*
      */

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
          if (response.data.errors && response.data.errors.length > 0) {
            var e = response.data.errors[0];
            if (e.code === '1.5282.72') {
              vm.errs.push('Sorry, this hotel is not available on the dates you\'ve requested. Please try another hotel or try adjusting your dates.');
            }
            if (e.code === '2147') {
              vm.noRecordsFoundReason = e.message.replace('Hotel.ResultsWithCacheV5: ','');
            }
            console.log(response.data.errors[0].message);
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

        //store results for page visit lifetime

        vm.allResults = vm.searchresults.hotel_data;

        //TODO: refactor ago hotel data into accessiblego object
        //this is currently being used in overlayCUG
        //if (!n[0].accessiblego) n[0].accessiblego = {};

        //integrate CUG data
        vm.overlayCUG();

        //integrate review data
        vm.overlayReviews();

        //augment custom accessibility amenity data
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
                if (amenityObj.name != 'Notes')
                  hotelObj.augmentedData.push(amenityObj);
              }
            }
          }
        }




        //filteredResults
        vm.setFilteredResults();

        //toggle map to hide (we defaulted showMap to true to ensure it loads/renders from google once, otherwise we eat quota)
        //vm.toggleMap();

        //show search criteria (city, country, etc)
        vm.setSearchResultsHeading();

        //update session service
        sessionService.setLastHotelSearch(hotelSearchService.params, vm.searchresults);

        //unflag wait message
        vm.isButtonDisable = false;

        //adjust url to reflect any changes in criteria
        $state.transitionTo('hotels', hotelSearchService.getUrlSafeParams(), {
          location: true,
          inherit: true,
          relative: $state.$current,
          notify: true
        });
      };
      var eFunc = function (response) {
        vm.isWaiting = false;
        vm.isButtonDisable = false;
        console.log(response);
      };

      //handle validation
      var successFunc = function (response) {
        if (!response.data.IsValid) {
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

      var cugSuccessFunc = function (response) {

        vm.isWaiting = false;

        vm.isCUGResultsReturned = true;

        //unexpected response?
        if (!response.data) {
          console.log('no cug data found');
          return;
        }

        if (response.data.errors) {
          return;
        }

        var cugHotelData = response.data.data.results.hotel_data;

        //extend results with cug info
        for (var c = 0; c < cugHotelData.length; c++) {
          var h = cugHotelData[c];

          var n = $filter('filter')(vm.allResults, { id: h.id });
          if (n && n.length > 0) {

            //check cug display price is less
            var regPrice = n[0].rate_data.price_details.display_price;
            var cugPrice = h.room_data[0].price_details.display_price;
            
            if (cugPrice>=regPrice) {
              console.warn('hotel ('+h.id+') ommitted from CUG due to insufficient price differential: reg=' + regPrice +'<=cug=' + cugPrice);
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
          }
        }

        //apply filter (otherwise "clubgo only" filter checked won't take effect)
        vm.setFilteredResults();

        //sort
        vm.setSortedResultsTopPicks();
      };

      var cugErrFunc = function (response) {

        vm.isWaiting = false;
        
        console.log('failed to retrieve cug');
        console.log(response);
        return;
      };

      dataFactory.searchCUGHotels(hotelSearchService.params).then(cugSuccessFunc, cugErrFunc);
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

        //extend results with reviews
        for (var c = 0; c < hotelReviewData.length; c++) {
          var review = hotelReviewData[c];

          var n = $filter('filter')(vm.allResults, { id: review.ppnid });
          if (n && n.length > 0) {
            //ensure accessiblego obj created
            if (!n[0].accessiblego) n[0].accessiblego = {};
            //ensure review object created
            if (!n[0].accessiblego.reviews) n[0].accessiblego.reviews = [];
            n[0].accessiblego.reviews.push(review);
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
    //   vm.includeFilterAccessible();
    // });

    $scope.$watch("vm.filters.isCugFilter",function(newVal) {
      if (!newVal) return;
      vm.includeFilterAccessible();
    });

    // $scope.$watch("vm.isClubGOFilter",function(newVal) {
    //   vm.includeFilterClubGO();
    // })

    //$scope.$watch("vm.priceGroups", function(newvalue) {
    $scope.$watch("vm.filters.priceGroups", function(newvalue) {
      if (!newvalue) return;
      vm.setFilteredResults();
    },true);

    $scope.$watch("vm.filters.accessibleAmenityMap", function(newvalue) {
      if (!newvalue) return;
      vm.setFilteredResults();
    },true);

    //populate accessible amenity filter options
    dataFactory.getCustomAmenityData().then(function(res) {
      vm.accessibleAmenityData = res.data.Data;
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
            map[key] = { title: amenityObj.categoryGroup, checked: false, items: {} };
          }

          //add items if not exist
          var itemKey = amenityObj.name;
          if (itemKey in map[key].items) {
            //do nothing
          } else {
            map[key].items[itemKey] = { title: amenityObj.name, checked: false };
          }

          //vm.accessibilityAmenityGroups.push(group);
        }

        //vm.accessibilityAmenityGroups = map;
      }
    });
    
      

    vm.toggleAccAmenCategory = toggleAccAmenCategory;
    function toggleAccAmenCategory(category) {
      //adjust UI
      var map = vm.filters.accessibleAmenityMap;
      for (var key in map) {
        if (!map.hasOwnProperty(key)) continue;
        var groupObj = map[key];
        if (groupObj.title !== category) continue;
        for (var prop in groupObj.items) {
          //if(!groupObj.hasOwnProperty(groupObj.items[prop])) continue;
          groupObj.items[prop].checked = !groupObj.items[prop].checked;
        }
      }
      //apply
      vm.setFilteredResults();
    }

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

      // return $filter('filter')(
      //   vm.searchresults.hotel_data,
      //   resultsFilterFunc
      // );
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
    // function viewHotel(hotelId) {
    //   var searchParams = {
    //     hid: hotelId,
    //     checkin: utilities.getUrlSafeDate(vm.hotelDateCheckin),
    //     checkout: utilities.getUrlSafeDate(vm.hotelDateCheckout),
    //     rooms: vm.hotelSearchRooms,
    //     adults: vm.hotelSearchAdults,
    //     children: vm.hotelSearchChildren,
    //     destination: vm.destination.display
    //     //anchor: 'sectionAmenities'
    //   };
    //   $state.go('hotel', searchParams);
    // }

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
    vm.includeFilterAccessible = includeFilterAccessible;
    function includeFilterAccessible() {
      vm.setFilteredResults();
    }

    // vm.includeFilterClubGO = includeFilterClubGO;
    // function includeFilterClubGO() {
    //   vm.setFilteredResults();
    // }

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

      // //handle if cug filter specified
      if (vm.filters.isCugFilter && vm.filters.isCugFilter === true) {
        if (!item.accessiblego || item.accessiblego.cug === undefined) {
          return false;
        }
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


      //c. if specified: matches hotel name search text
      var isHotelNameFilterSpecified = false;
      var isHotelNameMatch = false;
      isHotelNameFilterSpecified = (vm.filterText && vm.filterText !== '');
      if (!isHotelNameFilterSpecified || (isHotelNameFilterSpecified && (item.name.toLowerCase().indexOf(vm.filterText.toLowerCase()) !== -1))) {
        isHotelNameMatch = true;
      }
      //verdict
      if (!isHotelNameMatch) {
        return false;
      }

      //d. if specified: within price range
      var isPriceRangeMatch = false;
      var isPriceMatchSelected = false;
      var isPriceMatch = false;
      var price = item.rate_data.price_details.display_price;
      if (price) {  //guard against undefined
        for (var p = 0; p < vm.filters.priceGroups.length; p++) {
          var priceRange = vm.filters.priceGroups[p];
          if (priceRange.checked) {
            isPriceMatchSelected = true;
            if (price >= priceRange.min && price <= priceRange.max) {
              isPriceMatch = true;
              break;
            }
          }
        }
      }
      if (!isPriceMatchSelected || isPriceMatch) {
        isPriceRangeMatch = true;
      }
      //verdict
      if (!isPriceRangeMatch) {
        return false;
      }

      //e. if specified: star rating
      // var isStarRatingMatch = false;
      // var isStarRatingSpecified = false;
      // var isStarMatch = false;
      // var star = item.star_rating;
      // if (star) {  //guard against undefined
      //   for (var s = 0; s < vm.filters.starGroups.length; s++) {
      //     var starObj = vm.filters.starGroups[s];
      //     if (starObj.checked) {
      //       isStarRatingSpecified = true;
      //       if (parseInt(star) === starObj.numStars) {
      //         isStarMatch = true;
      //         break;
      //       }
      //     }
      //   }
      // }
      // if (!isStarRatingSpecified || isStarMatch) {
      //   isStarRatingMatch = true;
      // }
      // //verdict
      // if (!isStarRatingMatch) {
      //   return false;
      // }

      //f. if specified: club go
      // var isClubGOFilterSpecified = false;
      // var isClubGOMatch = false;
      // isClubGOFilterSpecified = (vm.isClubGOFilter && vm.isClubGOFilter === true);
      // if (!isClubGOFilterSpecified || (isClubGOFilterSpecified && item.accessiblego) !== -1) {
      //   isClubGOMatch = true;
      // }
      // //verdict
      // if (!isClubGOMatch) {
      //   return false;
      // }

      //g. accessibility amenity data
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
                if (groupObj2.items[prop2].title === hotelAugmentedData[x].name && hotelAugmentedData[x].value === 'Y') {
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

      //must be a and b and c and d and e and f and g
      return true;  //hasRates && isAccessibleMatch && isHotelNameMatch && isPriceRangeMatch && isStarRatingMatch && isAugmentedAmenitiesMatch;
    }


    function setFilteredResults() {
      vm.filteredResults = $filter('filter')(
        vm.allResults,
        vm.resultsFilterFunc
      );

      vm.setSortedResultsTopPicks();
      vm.addBadge();
    }

    function addBadge() {
      vm.filterPriceBadge = [];
      vm.filterAmenityMapBadge = [];
      vm.filterStarBadge = [];


      vm.filters.priceGroups.forEach( function(p) {
        if (p.checked) {
          vm.filterPriceBadge.push(p);
        }
      });

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

      if (badgeName === 'price') {
         vm.filters.priceGroups.forEach( function(price) {
          if(price.title===obj.title){
            obj.checked=false;
          }
        });
      }

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
      //clubGO, Reviews, Data
        function(hotel) {
          return hotel.accessiblego!==undefined && hotel.accessiblego.cug===true && hotel.accessiblego.reviews && hotel.hasAugmentedData===true;
        },
      //clubGO, Reviews
        function(hotel) {
          return hotel.accessiblego!==undefined && hotel.accessiblego.cug===true && hotel.accessiblego.reviews;
        },
      //clubGO, Data
        function(hotel) {
          return hotel.accessiblego!==undefined && hotel.accessiblego.cug===true && hotel.hasAugmentedData===true;
        },
      //clubGO
        function(hotel) {
          return hotel.accessiblego!==undefined && hotel.accessiblego.cug===true;
        },
      //Reviews, Data
        function(hotel) {
          return hotel.accessiblego!==undefined && hotel.accessiblego.reviews && hotel.hasAugmentedData===true;
        },
      //Reviews
        function(hotel) {
          return hotel.accessiblego!==undefined && hotel.accessiblego.reviews;
        },
      //Data
        function(hotel) {
          return hotel.hasAugmentedData===true;
        },
      //Accessible (but no data)
      //Not Accessible
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
        'rate_data.price_details.display_price',
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
      //if (!hotel) return;
      // var isHotelNameFilterSpecified = (vm.filterText && vm.filterText !== '');

      // if (!isHotelNameFilterSpecified) {
      //   return;
      // }

      vm.setFilteredResults();

      //var filtered = $filter('filter')(vm.filteredResults, phrase);
      //return filtered;

    }


    //----------- MAP
    function setMapVisibility() {

      //show map only in production
      if (vm.env.name !== 'production') {
        vm.showMap = false;
        return;
      }

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
      if (vm.showMap) {
        $timeout(function () {
          NgMap.getMap({ id: 'googleMap' }).then(function (response) {
            google.maps.event.trigger(response, 'resize');
          });
        }, 500);
      }
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




  };

  hotelsController.$inject = ['$rootScope', '$scope', '$state', '$timeout', '$filter', 'dataFactory', '$stateParams', 'hotelSearchService', 'sessionService', 'hotelUtilities', 'NgMap', 'utilities', 'localStorageService', 'joinModalService', 'redirectionService', 'environmentService', 'hotelLookupService', 'hotelSearchFilterService'];
  app.controller('hotelsController', hotelsController);
};
