module.exports = function(app) {
    var hotelController = function ($rootScope,$scope,$state,$stateParams,$filter,dataFactory,$uibModal, hotelLookupService, hotelUtilities,utilities,hotelSearchService, loginModalService, $sce, environmentService,dataLayerService) {

  		var vm = this;
      vm.env = environmentService();

  		vm.init = init;
      vm.errs = [];
      vm.displayState = 'unlock';
      vm.setCUGDisplayState = setCUGDisplayState;
      vm.bindNearbyHotelName = bindNearbyHotelName;

      //-- amenities
      vm.accessibleAmenityData = undefined;
      vm.popularAmenities = [];
      vm.popularAccessibilityFeatures = [];


      vm.hotelSearchAdults = 1;
      vm.hotelSearchAdultsMax = 14;
      vm.hotelSearchChildren = 0;
      vm.hotelSearchChildrenMax = 6;
      vm.hotelSearchRadius = 10;
      vm.hotelSearchRooms = 1;
      vm.hotelSearchRoomsMax = 9;

      //hotel details
      vm.pendingHotelDetails = true;
  		vm.hoteldetails = {};
      vm.decodeDescription= decodeDescription;
      vm.getHotelDetail = getHotelDetail;
      vm.getAddress = getAddress;
      vm.stopStatusCue = stopStatusCue;
      vm.chunk = chunk;

      vm.hotelLookupService = hotelLookupService; //adding this so we can access params in html
      vm.destination = {};

      //hotel rates
      vm.pendingRoomRates = true;
      vm.pendingCUGRates = false;
      vm.getRoomRates = getRoomRates;
      vm.setRoomRateMessage = setRoomRateMessage;
      vm.getRoomRatesCUG = getRoomRatesCUG;
      vm.roomOptions = [];
      vm.roomOptionsCUG = [];
      vm.noRoomsAvailMessage = '';

      //cug
      //vm.showCUG = false;
      vm.cugSearchResultsBundle = '';
      vm.noCUGRoomsAvailMessage = '';
      vm.unlockCUG = unlockCUG;

      //??? do we need these
      vm.getArray = getArray;
      
      vm.goToSearchResults = goToSearchResults;

      //search info
      vm.setupHotelSearchService = setupHotelSearchService;
      vm.getDestination = getDestination;
      vm.getNumRooms = getNumRooms;
      vm.getCheckin = getCheckin;
      vm.getCheckout = getCheckout;
      vm.getLongDate = getLongDate;

      //navigation
      vm.requestContract = requestContract;
      vm.requestContractCUG = requestContractCUG;
      vm.goBackToSearchResults = goBackToSearchResults;
      vm.initCheckInPopupOpen = false;

      vm.pushToGA = pushToGA;

  		vm.init();

		  require("./hotel.less");
      require("../../../resources/css/circle.css");
      require("file-loader?name=Star_Orange.png!../../../resources/img/common/Star_Orange.png");
      require("file-loader?name=Star_White.png!../../../resources/img/common/Star_White.png");
      require("file-loader?name=specialdiscount.png!../../../resources/img/hotels/specialdiscount.png");
      vm.image_clubgo = require("../../../resources/img/clubGO/clubGO-teal-299b7c.png");
      vm.image_accIcons = require("../../../resources/img_new/hotels/not-determined.png");

  		function init() {

        //defaults
        if ($stateParams.checkin === undefined) {
          vm.initCheckInPopupOpen=true;   //to distinguish a person selecting from a default checkin applied (from app.routes.js) we'll need to pass in a newparam
          $stateParams.checkin = new Date(Date.now()).toString();   //today
          $stateParams.checkout = new Date(Date.now()+86400000).toString(); //tomorrow
        }

        //persist hotel lookup params
        hotelLookupService.setParams($stateParams);

        //cug display state :: handle change in CUG state ['none'|'unlock'|'club']
        $rootScope.$watch('userCUGDetails', function (newVal,oldVal) {
          vm.setCUGDisplayState();
        });

        if (!hotelLookupService.hasValidParams(false)) {
          //todo: do we need vm.errs or can we just use hotelLookupService.errs???
          vm.errs = hotelLookupService.errs;
          return;
        }

			
        vm.getRoomRates();
        vm.getRoomRatesCUG();

        vm.pendingReviews = true;
        dataFactory.getHotelReviews($stateParams.hid).then(function (reviews) {

            vm.reviews = reviews.data;

            //add photos property to each review
            $.each(vm.reviews,function(idx, r) {
              var getPhotosSuccessFunc = function(response) {
                vm.reviews[idx].photos = response.data; //_map(response.data,'url'); //response.data;
              };
              dataFactory.getHotelReviewPhotos(r.reviewId).then(getPhotosSuccessFunc);
            });

            //determine average ratings
            var ratings = _map(vm.reviews, 'rating');
            vm.averageRatings = (_.sum(ratings) / ratings.length).toFixed(1);

            vm.pendingReviews = false;
        });

        vm.hotelSearchService = hotelSearchService;
        
        //for search bar on hotel top
        vm.destination = {
          ppnid: hotelSearchService.params.ppnid,
          type: hotelSearchService.params.type,
          display: hotelSearchService.params.display// $stateParams.destination
        };

        //popular amenities
        vm.popularAmenities.push({ caption: 'Swimming Pool', fa: 'fas fa-swimmer fa-2x', enabled: false, ppnAmenityLabels: ['swimming pool','pool'] });
        vm.popularAmenities.push({ caption: 'Fitness Center', fa: 'fas fa-dumbbell fa-2x', enabled: false, ppnAmenityLabels: ['fitness center'] });
        vm.popularAmenities.push({ caption: 'Non-Smoking', fa: 'fas fa-smoking-ban fa-2x', enabled: false, ppnAmenityLabels: ['non-smoking rooms','no smoking rooms/facilities'] });
        vm.popularAmenities.push({ caption: 'Business Center', fa: 'fas fa-briefcase fa-2x', enabled: false, ppnAmenityLabels: ['business center'] });
        vm.popularAmenities.push({ caption: 'Free Breakfast', fa: 'fas fa-coffee fa-2x', enabled: false,  ppnAmenityLabels: ['free breakfast'] });
        vm.popularAmenities.push({ caption: 'Shuttle Service', fa: 'fas fa-bus-alt fa-2x', enabled: false,  ppnAmenityLabels: ['shuttle service','airport shuttle (free)'] });
        vm.popularAmenities.push({ caption: 'Free Parking', fa: 'fas fa-parking fa-2x', enabled: false,  ppnAmenityLabels: ['free parking'] });
        vm.popularAmenities.push({ caption: 'Free Internet', fa: 'fas fa-wifi fa-2x', enabled: false,  ppnAmenityLabels: ['free internet','free high speed internet'] });
        vm.popularAmenities.push({ caption: 'Pets Allowed', fa: 'fas fa-paw fa-2x', enabled: false,  ppnAmenityLabels: ['pets allowed'] });


        //setup popular accessibility features
        vm.popularAccessibilityFeatures.push({ caption: 'Step-free entrance', cdnEnabled: 'hotel-entrance.png', cdnDisabled: 'hotel-entrance-bbb.png', enabled: false,  label: 'Step free entrance' });
        vm.popularAccessibilityFeatures.push({ caption: 'Roll-in shower', cdnEnabled: 'bath-shower-wheelchair.png', cdnDisabled: 'bath-shower-wheelchair-bbb.png', enabled: false,  label: 'Roll-in shower' });
        vm.popularAccessibilityFeatures.push({ caption: 'Bathroom grab bars', cdnEnabled: 'bath-grab-bars.png', cdnDisabled: 'bath-grab-bars-bbb.png', enabled: false,  label: 'Bathroom grab bars' });
        vm.popularAccessibilityFeatures.push({ caption: 'Lever door handles', cdnEnabled: 'room-door-handle.png', cdnDisabled: 'room-door-handle-bbb.png', enabled: false,  label: 'Lever door handles' });
        vm.popularAccessibilityFeatures.push({ caption: 'Service Animal', cdnEnabled: 'hotel-service-animals.png', cdnDisabled: 'hotel-service-animals-bbb.png', enabled: false,  label: 'Service animals permitted' });
        vm.popularAccessibilityFeatures.push({ caption: 'Braille indicators', cdnEnabled: 'room-braille-indicators.png', cdnDisabled: 'room-braille-indicators-bbb.png', enabled: false,  label: 'Braille indicators' });
        vm.popularAccessibilityFeatures.push({ caption: 'Hearing system (TTY, TDD)', cdnEnabled: 'room-tty-ttd.png', cdnDisabled: 'room-tty-ttd-bbb.png', enabled: false,  label: 'Hearing system (TTY, TDD)' });
        vm.popularAccessibilityFeatures.push({ caption: 'Accessible parking', cdnEnabled: 'hotel-parking.png', cdnDisabled: 'hotel-parking-bbb.png', enabled: false,  label: 'Designated accessible parking areas' });
        vm.popularAccessibilityFeatures.push({ caption: 'Accessible restaurant', cdnEnabled: 'hotel-restaurant.png', cdnDisabled: 'hotel-restaurant-bbb.png', enabled: false,  label: 'Accessible restaurant on site' });
  		}

      //get accessibility data
      dataFactory.getCustomAmenityData().then(function(res) {
        vm.accessibleAmenityData = res.data.Data;
        vm.getHotelDetail();
      });


  		function getHotelDetail() {
        var successFunc = function (response) {
          if (!response || !response.data || !response.data.data) {
            vm.errs.push("Hotel not found");
            vm.pendingHotelDetails = false;
            return;
          }

          vm.hoteldetails = response.data.data.results.hotel_data[0];

          //make sure we have a display (ex no display param)
          if (!vm.destination.display) {
            vm.destination.display = vm.hoteldetails.name;
          }
          

          if (vm.hoteldetails.amenity_data) {

            vm.chunkedData = vm.chunk(vm.hoteldetails.amenity_data, 1);

            //general amenities
            $.each(vm.hoteldetails.amenity_data,function(idx,ppnAmenity) {
              var v = ppnAmenity.name.toLowerCase().trim();
              $.each(vm.popularAmenities,function(idx,popularAmenity) {
                if (popularAmenity.ppnAmenityLabels.indexOf(v) > -1) {
                  popularAmenity.enabled = true;
                  return false;
                }
              });
            });

            //get list of possible labels that PPN uses for amenities
            var ppnAmenityLabelList = [];
            $.each(vm.popularAmenities, function(idx,pa) {
              ppnAmenityLabelList = ppnAmenityLabelList.concat(pa.ppnAmenityLabels);
            });

            //populate other general amenities list
            vm.otherGeneralAmenities = vm.hoteldetails.amenity_data.filter(function(amenity) {
              return ppnAmenityLabelList.indexOf(amenity.name.toLowerCase()) === -1;
            });
          }



          //todo: abstract into a service (and popular amenities above)
          vm.hasAugmentedData = false;
          if (vm.accessibleAmenityData) {
            for (var a = 0;a<vm.accessibleAmenityData.length;a++) {
              var amenityObj = vm.accessibleAmenityData[a];
              if (amenityObj.PPNId=== hotelLookupService.params.hotelid) {
                vm.hasAugmentedData = true;
                if (!vm.augmentedData) {
                  vm.augmentedData = [];
                }
                if (amenityObj.name !== 'Notes') {
                  vm.augmentedData.push(amenityObj);
                }
              }
            }
          }
          //vm.chunkedAccessibilityData = vm.augmentedData; //chunk(vm.augmentedData, 1);


          
          if (vm.augmentedData) {
            //populate popular accessibility features
            $.each(vm.augmentedData,function(idx,augmentedDataItem) {
              $.each(vm.popularAccessibilityFeatures,function(idx,popularAccessibilityFeature) {
                if (popularAccessibilityFeature.label === augmentedDataItem.name) {
                  popularAccessibilityFeature.enabled = true;
                  return false;
                }
              });
            });

            //populate general/room accessibility features (that excludes popular accessibility features)
            var plist = vm.popularAccessibilityFeatures.map(function(r) {
              return r.label;
            });
            vm.otherAccessibilityFeatures = vm.augmentedData.filter(function(a) {
              return plist.indexOf(a.name) === -1;
            });
          }


          //filter out any blank images
          var blankImageIndicies = [];
          var idx = vm.hoteldetails.photo_data.indexOf('');
          while (idx != -1) {
            blankImageIndicies.push(idx);
            idx = vm.hoteldetails.photo_data.indexOf('', idx + 1);
          }
          
          for (var i = blankImageIndicies.length -1; i >= 0; i--) {
            vm.hoteldetails.photo_data.splice(blankImageIndicies[i],1);         
          }

          //prepare photo_data for carousel
          vm.hoteldetails.photo_data = _map(vm.hoteldetails.photo_data,function(n) { return { url: n, description: '' }; });

          //scroll if an anchor id was passed in
          if ($stateParams.anchor) {
            $scope.scrollTo($stateParams.anchor);
          }

          //done
          vm.pendingHotelDetails = false;

          //setup meta tags
          var title = vm.hoteldetails.name;
          var desc = vm.hoteldetails.name + ' Stayed here? Contribute an accessibility review!';
          if (vm.hasAugmentedData) {
            title='accessible hotels ' + utilities.getEndash() + ' ' + title;
            //prefix (from Miriam's spreadsheet)
            desc+='View accessibility info for ';
            //show all amenities
            angular.forEach(vm.augmentedData, function(value,key,obj) {
              if (desc!=='') {
                desc+=', ';
              }
              desc+=value.name;
            });
          }
          $rootScope.metaTagService.setup({
            metaTitle: title,
            ogTitle: title,
            twitterTitle: title,
            metaDescription: desc,
            ogDescription: desc,
            twitterDescription: desc,
            ogImage: vm.currentImage,
            twitterImage: vm.currentImage
          });

          vm.pushToGA();
        };

        var errFunc = function(response) {
          vm.pendingHotelDetails = false;
        };

  			dataFactory.getHotelDetail(hotelLookupService.params).then(successFunc,errFunc);
  		}

      function pushToGA() {
          if (!vm.hoteldetails) return;

          var eventData = {
              content_type: 'hotel',  //must be set to viewcontent for hotel ads
              content_ids: vm.hoteldetails.id,
              city: vm.hoteldetails.address.city_name,
              region: vm.hoteldetails.address.state_name,
              country: vm.hoteldetails.address.country_name,
              checkin_date: dateFns.format(hotelLookupService.params.checkin, 'YYYY-MM-DD'),
              checkout_date: dateFns.format(hotelLookupService.params.checkout, 'YYYY-MM-DD')
          }
          dataLayerService.pushEvent({event: 'ViewContent', data: eventData});
      }

      //set customer facing message when no results are returned
      //*** considering only the first error message returned
      function setRoomRateMessage(errors) {

        //default
        if (!errors || errors.length===0 || !errors[0].message) {
          vm.noRoomsAvailMessage = 'No rooms available at this hotel for the specified dates!';
          return;
        }

        //specific error
        var msg = errors[0].message.replace('Hotel.Rates.Live.Multi: ','') ;
        vm.noRoomsAvailMessage = 'Unable to retrieve room rates: ' + msg;

        //vm.noRoomsAvailMessage = 'Unable to retrieve room rates at this time.';
        // var errCode = errors[0].code;
        
        // if (errors[0].code === '1.5806.37') {
        //   vm.noRoomsAvailMessage = 'Total number of adults and children are required instead of occupancy per room.';
        // }

        // if (errors[0].code === '1.5806.464') {
        //   vm.noRoomsAvailMessage = 'No rooms available at this hotel for the specified dates.';
        // }
      }

      function getRoomRates() {

        //todo: validate case where user typed into the url bad criteria (ex old dates)
        //if not valid set vm.noRoomsAvailMessage and return
        //people should still be able to get to this page to view the hotel information even
        //if they do not have search criteria

        var successFunc = function (response) {
          vm.pendingRoomRates = false;

          //handle fail cases
          if (response.data.status === 'fail') {
            vm.setRoomRateMessage(response.data.errors);
            return;
          }
          if (!response.data.data.results.hotel_data) {
            vm.noRoomsAvailMessage = 'Unable to obtain hotel information at this time.';
            return;
          }

          //handle success case
          vm.roomOptions = response.data.data.results.hotel_data[0].rate_data;
        };

        var errFunc = function (response) {
          vm.pendingRoomRates = false;        
          vm.setRoomRateMessage(response.data);
        };

        dataFactory.getHotelRates(hotelLookupService.params).then(successFunc,errFunc);
      }

      //CUG
      function getRoomRatesCUG() {

        //TODO: determine if/when to make CUG calls - currently this is always but we have a 5000/hour limit
        
        vm.pendingCUGRates = true;

        //get cug ppn bundle for this hotel
        var getBundleSuccessFunc = function(response) {
          if (!response || !response.data || !response.data.data || !response.data.data.results || !response.data.data.results.hotel_data || response.data.data.results.hotel_data.length===0) {
            vm.noCUGRoomsAvailMessage = 'No Traveler\'s Club rooms available at this hotel for the specified dates.';
            vm.stopStatusCue();
            return;
          }
          //problem is here b/c you are arbitrarily taking the first ppn_bundle instead of the one matchnig the ?
          vm.cugSearchResultsBundle = response.data.data.results.hotel_data[0].ppn_bundle;
          vm.overlayCUGRates();
        };
        var getBundleErrFunc = function(response) {
          console.log('failed to retrieve cug ppn bundle id');
          vm.noCUGRoomsAvailMessage = 'Unable to access Traveler\'s Club rooms at this time.  We are looking into the issue and apologize for the inconvenience';
          vm.stopStatusCue();
          return;
        };

        vm.destination.ppnid = hotelLookupService.params.hotelid;
        vm.destination.type = 'hotel';
        vm.destination.display = hotelLookupService.params.destination;
        vm.setupHotelSearchService();
        dataFactory.searchCUGHotels(hotelSearchService.params).then(getBundleSuccessFunc, getBundleErrFunc);
      }


//ui status cue
function stopStatusCue() {
  vm.pendingCUGRates = false;
}

      //CUG RATES
      vm.overlayCUGRates = overlayCUGRates;
      function overlayCUGRates() {

        

        //get cug room rates for this hotel
        var getRatesSuccessFunc = function(response) {

          vm.stopStatusCue();

          if (!response.data) {
            vm.noCUGRoomsAvailMessage = 'No Traveler\'s Club rooms available at this hotel for the specified dates.';
            console.log('no cug data found');
            return;
          }
          if (response.data.errors) {
            vm.noCUGRoomsAvailMessage = 'No Traveler\'s Club rooms available at this hotel for the specified dates.';
            console.log(response.data.errors);
            return;
          }

          vm.roomOptionsCUG = response.data.data.results.room_data;


          //DO WE STILL NEED ANY OF BELOW?
          /*

          var cugHotelData = response.data.data.results.room_data;

          //extend results with cug info
          for(var c=0;c<cugHotelData.length;c++) {
            var h = cugHotelData[c];
            var ratePlan = h.rate_plan.substring(h.rate_plan.length-3);

            var isMatch = function(a) {
              return (a.rate_plan_code.substring(a.rate_plan_code.length-3) === ratePlan);
            };

            var n = $filter('filter')(vm.roomOptions, isMatch);

            if (!n || n.length===0) {
              console.log('rate plan not found: ' + ratePlan);
              continue;
            }

            if (!n[0].accessiblego) n[0].accessiblego = {};

            var cug = {
              state: displayState,
              room: h
              // saving_percentage: h.saving_percentage,
              // price_details: h.price_details
            };

            n[0].accessiblego.cug = cug;            

            console.log(cug);
          

          //   if (n && n.length>0) {
          //     if (!n[0].accessiblego) n[0].accessiblego = {};
          //     var cug = {
          //       state: displayState,  
          //       saving_percentage: h.room_data[0].saving_percentage,
          //       price_details: h.room_data[0].price_details
          //     }
          //     n[0].accessiblego.cug = cug;
          //   }
          }
          */
        };
        var getRatesErrFunc = function(response) {
          vm.noCUGRoomsAvailMessage = 'Unable to access Traveler\'s Club rooms at this time.  We are looking into the issue and apologize for the inconvenience';
          console.log('failed to retrieve cug room/rates');
          console.log(response);
          vm.stopStatusCue();
          return;
        };

        var params = {
          cug_ppn_bundle: vm.cugSearchResultsBundle
        };
        dataFactory.getCUGHotelRates(params).then(getRatesSuccessFunc, getRatesErrFunc);
      }

      

      
      function requestContract(bundle) {

        //var bundle = selectedRate.ppn_bundle;

        //sanity check
        if (bundle === '') {
          console.log('ppn bundle not found');
          return;
        }

        var contractRequestParams = {
          ppn_bundle: bundle
        };

        $state.go('reserve', contractRequestParams);
      }

      function requestContractCUG(cugRate) {
        var bundle = cugRate.ppn_book_bundle;
        var ratePlan = cugRate.rate_plan;

        //sanity check
        if (bundle === '') {
          console.log('ppn bundle not found');
          return;
        }
        if (ratePlan === '') {
          console.log('rate plan not found');
          return;
        }

        var contractRequestParams = {
          cug_ppn_bundle: vm.cugSearchResultsBundle,
          rate_plan: ratePlan
        };

        $state.go('reservecug', contractRequestParams);
      }

      function getArray(num) {
          if (!num) return new Array(0);
          return new Array(parseInt(num));   
      }
      function getAddress() {
        return hotelUtilities.getAddress(vm.hoteldetails.address);
      }
      function goToSearchResults() {
        $state.go('hotels', { c: 'y' });
      }
      function decodeDescription(input) {
        if (!input) return '';
        
        var descSplit = input.split('.');
        descSplit.pop();  //last item in array is just a .
        var ret = '';
        $.each(descSplit, function (key, val) {
          if ([3,6,9,12,15].indexOf(key)>-1) {
            ret+='</p>';
          }

          if ([0,3,6,9,12,15].indexOf(key)>-1) {
            ret+='<p>';
          }
          ret+=val+'. ';
        });
        if (!ret.endsWith('</p>')) {
          ret+='</p>';
        }
        return ret;
        // var e = document.createElement('div');
        // e.innerHTML = input;
        // var k = e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
        // var idxAtEndOfThirdSentence = utilities.getNthIndex(vm.article.IntroText,'.',3);
        // return k;
      }


      function getDestination() {
        return hotelLookupService.params.destination;
      }
      function getNumRooms() {
        return hotelLookupService.params.rooms;
      }
      function getCheckin() {
        return getLongDate(hotelLookupService.params.checkin);
      }
      function getCheckout() {
        return getLongDate(hotelLookupService.params.checkout);
      }
      function getLongDate(date) {
        var monthNames = [
          "Jan", "Feb", "Mar",
          "Apr", "May", "Jun", "Jul",
          "Aug", "Sep", "Oct",
          "Nov", "Dec"
        ];

        var weekday = new Array(7);
        weekday[0] = "Sun";
        weekday[1] = "Mon";
        weekday[2] = "Tue";
        weekday[3] = "Wed";
        weekday[4] = "Thu";
        weekday[5] = "Fri";
        weekday[6] = "Sat";

        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        return weekday[date.getDay()] + ', ' + monthNames[monthIndex] + ' ' + day + ' ' + year;
      }

      //-- rooms/rates modal
      vm.openRatesModal = openRatesModal;
      function openRatesModal(rate) {
          var instance = $uibModal.open({
            template: require("./rates.html"), //'/web/dist/login.html',   //'/Template/RenderLoginTemplate'
            controller: 'ratesController',
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            backdrop:'static',
            controllerAs: 'vm',
            keyboard: true,
            size: 'lg',
            resolve: {
              items: function () {
                return { rate: rate, checkin: hotelLookupService.params.checkin, checkout: hotelLookupService.params.checkout };
              }
            }
          });
          return instance.result.then(vm.notyetsure);
      }
      vm.notyetsure = notyetsure;
      function notyetsure() {
      }


      
      function chunk(arr, size) {
        var newArr = [];
        for (var i=0; i<arr.length; i+=size) {
          if (arr[i].name==='Accessible') continue;
          newArr.push(arr.slice(i, i+size));
        }
        return newArr;
      }

      vm.accessibleAmenities = [
      'Entire unit located on ground floor',
      'Toilet with grab rails',
      'Adapted bath',
      'Lowered sink',
      'Raised toilet',
      'Shower chair'
      ];

      vm.getFontAwesomeIcon = function(roomAmenity) {
        var fa = 'fa fa-check';
        var color = '#299b7c';

        if (vm.accessibleAmenities.indexOf(roomAmenity) >-1) {
          fa = 'fa fa-wheelchair';
        }

        if (roomAmenity === 'Upper floors accessible by stairs only') {
          fa = 'fa fa-exclamation-circle';
          color = '#9e0303';
        }

        return $sce.trustAsHtml('<i class="'+fa+'" style="color:'+color+';" aria-hidden="true"></i>');
      }

      vm.review = review;
      function review(hid) {
        $state.go('reviewHotel',{ hid:hotelLookupService.params.hotelid });
      }

      // vm.ok = ok;
      // function ok() {
      //   vm.showModal = false;
      // }

      // vm.cancel = cancel;
      // function cancel() {
      //   vm.showModal = false;
      // }

      //-- NAVIGATION --//
      function goBackToSearchResults() {
        $state.go('hotels', hotelSearchService.lastSearchCriteria);
        //$state.go('hotels', hotelSearchService.getUrlSafeParams());
      }

      //duplicate from hotels, consider refactoring
      //gathers the params, validates them, and goes to state
      vm.submitSearch = submitSearch;
      function submitSearch() {

        //reset errors
        vm.errs = [];
        vm.showErrors = true;

        //reset results cache

        //todo: can't we just setParams once, cache it, and thereafter we can call a function to 
        //validateAndGo anytime we need (w/o having to pass in criteria again?) - we don't need this in session service
        //sessionService.resetLastHotelSearch();

        vm.setupHotelSearchService();

        //valid?
        if (vm.errs.length>0) return;

        hotelSearchService.validateAndGo();
      }

      
      function setupHotelSearchService() {
        hotelSearchService.setParams(
            vm.destination,
            vm.getLongDate(hotelLookupService.params.checkin),
            vm.getLongDate(hotelLookupService.params.checkout),
            vm.hotelLookupService.params.rooms,
            vm.hotelLookupService.params.adults,
            vm.hotelLookupService.params.children,
            vm.hotelSearchRadius);
      }

      //-- CUG --//
      function setCUGDisplayState() {
        if (!$rootScope.isAuthenticated || !$rootScope.userCUGDetails) {
          vm.displayState = 'unlock';
          return;
        }

        //allow user to access cug details if eligibility is pending (p) or accepted (a)
        if (['a','p'].indexOf($rootScope.userCUGDetails.statusCode) > -1) {
          vm.displayState = 'club';
        }
      }

      function unlockCUG() {
        if (vm.displayState === 'unlock') {
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
          loginModalService(params);
        }
      }

      vm.getNumberNightsStay = function() {
        return utilities.getNumberDaysBetween(hotelLookupService.params.checkin, hotelLookupService.params.checkout)
      }

      vm.goToHotel = function(nearby) {
        var params = {
            hid: nearby.id,
            //checkin: utilities.getUrlSafeDate(new Date(reservation.CheckinDate)),
            //checkout: utilities.getUrlSafeDate(new Date(reservation.CheckoutDate)),
            //rooms: reservation.Rooms,
            //guests: reservation.Guests,
            destination: nearby.name
        };
        $state.go('hotel', params);
      }

      function bindNearbyHotelName(name) {
        if (!name) return;
        if (name.length>30) {
          return name.substring(0,28) + "...";
        }
        return name;
      }

      vm.getHotelAccessibilityData = function(ppnid) {
        if (!vm.accessibleAmenityData) {
          return [];
        }

        var augData = [];
        for (var a = 0;a<vm.accessibleAmenityData.length;a++) {
          var amenityObj = vm.accessibleAmenityData[a];
          if (amenityObj.PPNId=== ppnid) {
            if (amenityObj.name !== 'Notes') {
              augData.push(amenityObj);
            }
          }
        }

        return augData;
          
      }

    };

    hotelController.$inject = ['$rootScope','$scope','$state','$stateParams','$filter','dataFactory','$uibModal','hotelLookupService','hotelUtilities','utilities','hotelSearchService','loginModalService','$sce','environmentService','dataLayerService'];
    app.controller('hotelController', hotelController);
};
