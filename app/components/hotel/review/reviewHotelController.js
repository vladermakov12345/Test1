module.exports = function(app) {
    var reviewHotelController = function ($scope, $rootScope, $state, $stateParams, dataFactory, $window, uibButtonConfig, $location, $anchorScroll, utilities,localStorageService, addPhotosModalService, loginModalService, joinModalService, redirectionService) {
    	var vm = this;
		vm.errs = [];
    	vm.hid = $stateParams.hid;
    	vm.scrollValue = false;

    	//page state & messageing
    	vm.reviewState = 'pending';

    	//hotel detail
    	vm.hotelDetail = {};

    	//existing review
    	vm.review = undefined;

    	//photo data
    	vm.addPhotos = addPhotos;
    	vm.photos = [];

		//review responses
		vm.rating = 0;
		vm.title = '';
		vm.description = '';
		vm.accWheelchairUsers = false;
		vm.accLowVision = false;
		vm.accLowHearing = false;
		vm.accLowMobility = false;
		vm.travelDate = '';
		vm.acc = {
			entranceandmainareas: '',
			parking: '',
			elevator: '',
			restaurant: '',
			room: '',
			pool: '',
			fitnesscenter: '',
			businesscenter: ''
		};

		vm.CompleteSubmission = CompleteSubmission;

    	//functions
    	vm.init = init;
    	vm.LookupHotelInfo = LookupHotelInfo;
    	vm.isvalid = isvalid;
    	vm.submit = submit;
    	vm.errorCheck = errorCheck;
    	vm.isAlreadyReviewed = isAlreadyReviewed;
    	vm.SetLocalStorageReview = SetLocalStorageReview;    
    	vm.login = login;    	
    	vm.join = join;

    	vm.getCustomerId = getCustomerId;
    	
    	vm.image_together_icon= require("../../../../resources/img/review/together_icon.png");

    	vm.init();

    	function getCustomerId() {
    		return localStorageService.getCustomerId();
    	}

    	function init() {

			uibButtonConfig.activeClass = 'accessibilityChoice';

			//setup meta tags
            var desc = 'Review Hotel';
            $rootScope.metaTagService.setup({
                ogDescription: desc,
                twitterDescription: desc,
            });

	    	//must have hotel id
	    	if (!vm.hid) {
	    		vm.reviewState = 'missing_hotel_id';
	    		return;
	    	}

			//lookup hotel info
			vm.LookupHotelInfo();

    		//stop here if not authenticated
    		if (!$rootScope.isAuthenticated) {
    			vm.reviewState = 'unauthenticated';
	    		return;
	    	}

	    	//get customer id
			// var userProfile = JSON.parse(localStorage.getItem('profile')) || null;
			// if (userProfile !== null) {
			//     vm.custId = userProfile.app_metadata.customerId;
			// }
			vm.custId = vm.getCustomerId();

			//determine if customer has reviewed this hotel before
			var getReviewSuccessFunc = function(response) {
				var d = response.data;

				//have we reviewed already?
				if (d !== null) {
					vm.review = d;
					vm.reviewState = 'reviewed_already';
					return;
				}

				vm.reviewState = 'show_review_form';

				//if review exists in localstorage (from before auth) then submit!
				var reviewHotelParams = JSON.parse($window.localStorage.getItem('review_'+vm.hid));
				if (reviewHotelParams !== undefined && reviewHotelParams !== null) {
					//todo: compare customer ids (could be a different account logging in!)
			  		reviewHotelParams.custId = vm.getCustomerId();
			  		//todo: check ppnId - could be a different one!
			  		reviewHotelParams.ppnId = vm.hid;

					vm.CompleteSubmission(reviewHotelParams);
				}
			};
			var getReviewErrFunc = function(response) {
				console.log('unable to check for existing review');
			};
			var custId = vm.getCustomerId();
			dataFactory.getHotelReview(vm.hid,custId).then(getReviewSuccessFunc,getReviewErrFunc);
    	}

    	function LookupHotelInfo() {
			var successFunc = function (response) {
				var d = response.data;
				vm.hotelDetail = {
					hotel_ppn: d.hotelid_ppn,
					hotel_name: d.hotel_name,
    				hotel_address: d.hotel_address,
					city: d.city,
					state: d.state,
					postal_code: d.postal_code,
					thumbnail: d.thumbnail
				};
			};
			var errFunc = function(response) {
	          console.log('hotel data not found: '+response);
	        };
			dataFactory.getHotelDetails(vm.hid).then(successFunc,errFunc);
    	}

    	function login() {
    		if (!$rootScope.isAuthenticated) {
    			redirectionService.setRedirect({ to: 'reviewHotel', params: { hid: vm.hid }});
    			loginModalService(getModalText());
    		}
    	}

    	function join() {
    		if (!$rootScope.isAuthenticated) {
    			redirectionService.setRedirect({ to: 'reviewHotel', params: { hid: vm.hid }});
	    		joinModalService(getModalText());
	    	}
    	}

    	function getModalText() {
    		var commonText = 'We want to give you proper credit for your accessibility review.';
    		return {
				text: {
					heading: 'You\'re almost there...',
					subHeadingJoin: commonText+'  Please create an account to add a review.',
					subHeadingLogin: commonText+'  Please log in to add a review.'
				}
			};
    	}

    	function errorCheck() {    	   
    	    vm.errs = [];
    	    
    	    ////must have a hotel id
    	    if (vm.hotelDetail.hotel_ppn === undefined || vm.hotelDetail.hotel_ppn === '') {
    	        vm.errs.push({message:'Hotel id not found'});
    	    }
    	    //must have a rating
    	    if (vm.rating === 0) {
    	        vm.errs.push({message:'Please specify a rating'});
    	    }
    	    //must have a title
    	    if (vm.title === '') {
    	        vm.errs.push({message:'Please specify a title'});
    	    }
    	    //must have a description
    	    if (vm.description.length<50) {
    	        vm.errs.push({message:'Please specify a more detailed description (>= 50 characters)'});
    	    }
    	    //must have a travel date
    	    if (vm.travelDate === '') {
    	        vm.errs.push({message:'Please specify a travel date'});
    	    }
    	}

    	function isvalid() {
    		vm.errs = [];
    		vm.scrollValue = false;
    		//must have cust id
    		// if (vm.custId === '') {
    		// 	vm.errs.push('Please log in');
    		// }

			////must have a hotel id
    		if (vm.hotelDetail.hotel_ppn === undefined || vm.hotelDetail.hotel_ppn === '') {
    		    vm.errs.push({message:'Hotel id not found'});
    		    $location.hash('scrollHotelID');
    		    $anchorScroll();
    		    vm.scrollValue = true;
	    	}

    		//must have a rating
    		if (vm.rating === 0) {
    		    vm.errs.push({message:'Please specify a rating'});
    		    if (!vm.scrollValue) {
    		        $location.hash('scrollRating');
    		        $anchorScroll();
    		        vm.scrollValue = true;
    		    }
	    	}

	    	//must have a title
	    	if (vm.title ==='') {
	    	    vm.errs.push({message:'Please specify a title'});
	    	    if (!vm.scrollValue) {
	    	        $location.hash('scrollTitle');
	    	        $anchorScroll();
	    	        vm.scrollValue = true;
	    	    }
	    	}

	    	//must have a description
	    	if (vm.description.length<50) {
	    	    vm.errs.push({message:'Please specify a more detailed description (>= 50 characters)'});
	    	    if (!vm.scrollValue) {
	    	        $location.hash('scrollDescription');
	    	        $anchorScroll();
	    	        vm.scrollValue = true;
	    	    }
	    	}

	    	//must have a travel date
	    	if (vm.travelDate ==='') {
	    	    vm.errs.push({message:'Please specify a travel date'});
	    	    if (!vm.scrollValue) {
	    	        $location.hash('scrollTravelDate');
	    	        $anchorScroll();
	    	        vm.scrollValue = true;
	    	    }
             
	    	}

	    	//user has errs to correct?
	    	if (vm.errs.length>0) {
	    		return false;
	    	}

	    	return true;
    	}
        
    	function submit() {   	 
    	    
    	    //TODO: implement reviewService.submit(params, validationCB, submissionCB);

    		//valid?
    		if (!vm.isvalid()) {
    			return;
    		}    	
    		
	    	//prep
	    	//todo: create a hotel review type
	    	var reviewHotelParams = {
	    		ppnId: vm.hotelDetail.hotel_ppn,
	    		custId: vm.getCustomerId(),
				rating: vm.rating,
	    		title: vm.title,
				description: vm.description,
				accWheelchairUsers: vm.accWheelchairUsers,
				accLowVision: vm.accLowVision,
				accLowHearing: vm.accLowHearing,
				accLowMobility: vm.accLowMobility,
				entranceandmainareas: vm.acc.entranceandmainareas,
				parking: vm.acc.parking,
				elevator: vm.acc.elevator,
				restaurant: vm.acc.restaurant,
				room: vm.acc.room,
				pool: vm.acc.pool,
				fitnesscenter: vm.acc.fitnesscenter,
				businesscenter: vm.acc.businesscenter,
				tip: vm.tip,
				accomodationEffort: vm.accomodationEffort,
				photos: vm.photos
	    	};

	    	if (vm.travelDate) {
	    		var d = new Date(vm.travelDate);
	    		reviewHotelParams.travelDate = (d.getMonth()+1)+'/'+d.getFullYear();
	    	}

	    	//authorized?
    		if (!$rootScope.isAuthenticated) {
    			
    			//TODO: use the applyRedirect pattern
    			//$rootScope.state_redirect = { to: 'reserve', params: $stateParams };

    			//persist review data locally
    			//vm.SetLocalStorageReview(reviewHotelParams.ppnId, reviewHotelParams);

            	loginModalService();

	    		return;
	    	}

	    	//submit
	    	vm.CompleteSubmission(reviewHotelParams);
	    	
	    	$anchorScroll();
	    }

	    function addPhotos() {
	    	//vm.photos = [];

	        //handles: explicit dismissal
	        var successFunc = function(a,b,c) {
	        	vm.photos = a;
	        };

	        //handles: when dismissed by clicking outside modal
	        var resetPasswordFailureFunc = function(a,b,c) {
	            console.log('resetPasswordFailureFunc called');
	        };

	        var resetPasswordErrorFunc = function(a,b,c) {
	            console.log('resetPasswordErrorFunc called');
	        };

	    	addPhotosModalService(vm.photos)
				.then(successFunc,resetPasswordFailureFunc)
				.catch(resetPasswordErrorFunc);
	    }

        vm.removeFile = removeFile;
        function removeFile(name) {
            $.each(vm.photos,function(idx,file) {
                if (file.name === name) {
                    vm.photos.splice(idx,1);
                    return false;
                }
            });
        }

	    function SetLocalStorageReview(ppnId, reviewHotelParams) {
	    	$window.localStorage.setItem('review_'+ppnId, JSON.stringify(reviewHotelParams));
	    }

	    function CompleteSubmission(rHotelparams) {
	    	var successFunc = function (response) {
	    		var data = response.data;
	    		if (data.status === 'fail') {
	    			console.log('hotel review not submitted');
	    			vm.errs = data.errors;
	    			return;
	    		}

	    		var newReview = response.data.data;

	    		//success!
	    		vm.reviewState = 'submitted';
				
				//remove local storage reference
				$window.localStorage.removeItem('review_'+vm.hid);

                //update local storage
                var userReviews = localStorageService.getUserReviews();
                userReviews.push(newReview);
                localStorageService.setUserReviews(userReviews);
	    	};
	    	
	    	var errFunc = function(response) {
	    		console.log('review not submitted: '+response);
	        };

	    	dataFactory.submitHotelReview(rHotelparams).then(successFunc,errFunc);
	    }

	    function isAlreadyReviewed() {
	    	return vm.review !== undefined;
	    }

	    vm.getDefaultCheckinDate = getDefaultCheckinDate;
	    function getDefaultCheckinDate() {
	    	var d = new Date();
 			d.setDate(d.getDate()+14);
	    	return utilities.getUrlSafeDate(d);
	    }

	    vm.getDefaultCheckoutDate = getDefaultCheckoutDate;
	    function getDefaultCheckoutDate() {
	    	var d = new Date();
 			d.setDate(d.getDate()+21);
	    	return utilities.getUrlSafeDate(d);
	    }

    	//star rating directive
	    $scope.hoverRating1 = 0;
	    $scope.click1 = function (param) {
	        console.log('Click(' + param + ')');
	    };
	    $scope.mouseHover1 = function (param) {
	        console.log('mouseHover(' + param + ')');
	        $scope.hoverRating1 = param;
	    };
	    $scope.mouseLeave1 = function (param) {
	        console.log('mouseLeave(' + param + ')');
	        $scope.hoverRating1 = param + '*';
	    };

    };

    reviewHotelController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'dataFactory', '$window', 'uibButtonConfig', '$location', '$anchorScroll','utilities','localStorageService','addPhotosModalService','loginModalService', 'joinModalService','redirectionService'];
    app.controller('reviewHotelController', reviewHotelController);
};