module.exports = function(app) {
    var reviewEntryController = function ($scope,$rootScope,$state,$stateParams,dataFactory,$window,$location,$anchorScroll, localStorageService, loginModalService, redirectionService) {
    	var vm = this;
    	vm.id = $stateParams.id;
		vm.subjectInfo = {};
		vm.existingReview = undefined;
		vm.rating = 0;
		vm.scrollValue = false;

    	//page state & messageing
    	vm.reviewState = 'pending';

		//todo: good idea to do this instead:
		// vm.newReview = {
		// 	rating: 0,
		// 	title: '',
		// 	description: '',
		// 	accWheelchairUsers: false,
		// 	accLowVision: false,
		// 	accLowHearing: false,
		// 	accLowMobility: false
		// };

    	//state
    	vm.errs = [];

    	//functions
    	vm.init = init;
    	vm.GetSubjectInfo = GetSubjectInfo;
    	vm.isvalid = isvalid;
    	vm.submit = submit;
    	vm.isAlreadyReviewed = isAlreadyReviewed;
    	vm.SetLocalStorageReview = SetLocalStorageReview;
    	vm.CompleteSubmission = CompleteSubmission;
    	vm.errorCheck = errorCheck;
    	vm.login = login;

		vm.image_together_icon= require("../../../../resources/img/review/together_icon.png");

    	vm.init();

		function GetSubjectInfo() {
			var successFunc = function (response) {
				var d = response.data;
				vm.subjectInfo = {
					directoryid: d.directoryid,
					type: d.Type,
    				cityid: d.CityId,
					category: d.Category,
					name: d.Name,
					website: d.Website,
					email: d.Email,
					phone: d.Phone,
					address: d.Address,
					facebook: d.facebook,
					description: d.Description,
					created: d.created,
					isActive: d.isActive,
					isNational: d.IsNational,
					cityname: d.CityName,
					cityregion: d.CityRegion
				};
			};
			var errFunc = function(response) {
	          console.log('entry data not found: '+response);
	        };
			dataFactory.getDirectoryEntryById(vm.id).then(successFunc,errFunc);
    	}

    	function init() {

			//setup meta tags
			var title = 'Review a business'
            var desc = 'Review a business';
            $rootScope.metaTagService.setup({
            	metaTitle: title,
                ogTitle: title,
                twitterTitle: title,
                ogDescription: desc,
                twitterDescription: desc,
            });

	    	//must have id
	    	if (!vm.id) {
	    		vm.reviewState = 'missing_business_id';
	    		return;
	    	}

			//lookup info
			vm.GetSubjectInfo();

    		//stop here if not authenticated
    		if (!$rootScope.isAuthenticated) {
    			vm.reviewState = 'unauthenticated';
	    		return;
	    	}

	    	//get customer id
	    	// var userProfile = JSON.parse(localStorage.getItem('profile')) || null;
      //       if (userProfile !== null) {
      //           vm.custId = userProfile.app_metadata.customerId;
      //       }

			//determine if customer has reviewed this entry before
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
				var reviewSubmitParams = JSON.parse($window.localStorage.getItem('review_'+vm.id));
				if (reviewSubmitParams !== undefined && reviewSubmitParams !== null) {
					//todo: compare customer ids (could be a different account logging in!)
			  		reviewSubmitParams.customerId = localStorageService.getCustomerId();
			  		//todo: check ppnId - could be a different one!
			  		//reviewSubmitParams.id = vm.id;

					vm.CompleteSubmission(reviewSubmitParams);

					//make sure we don't automatically add this again!
					vm.SetLocalStorageReview(reviewSubmitParams.id, "");
				}
			};
			var getReviewErrFunc = function(response) {
				console.log('unable to check for existing review');
			};
			var custId = localStorageService.getCustomerId();
			dataFactory.getDirectoryEntryReview(vm.id,custId).then(getReviewSuccessFunc,getReviewErrFunc);
    	}

		function errorCheck() {
    	    vm.errs = [];

    	    //must have a directory entry id
    	    if (vm.id === undefined || vm.id === '') {
    	        vm.errs.push('Directory id not found');
    	    }

    	    //must have a rating
    	    if (vm.rating === 0) {
    	        vm.errs.push('Please specify a rating');
    	    }

    	    //must have a title
    	    if (!vm.title || vm.title === '') {
    	        vm.errs.push('Please specify a title');
    	    }

    	    //must have a description
    	    if (!vm.description || vm.description === '') {
    	        vm.errs.push('Please specify a description');
    	    }
    	}

    	function isvalid() {
    		vm.errs = [];
			vm.scrollValue = false;
    		//must have cust id
    		// if (vm.custId === '') {
    		// 	vm.errs.push('Please log in');
    		// }

			//must have a directory entry id
    		if (vm.id === undefined || vm.id === '') {
	    		vm.errs.push('Directory id not found');
	    		$location.hash('scrollDirectoryID');
    		    $anchorScroll();
    		    vm.scrollValue = true;
	    	}

    		//must have a rating
    		if (vm.rating === 0) {
	    		vm.errs.push('Please specify a rating');
	    		if (!vm.scrollValue) {
    		        $location.hash('scrollDirectoryID');
    		        $anchorScroll();
    		        vm.scrollValue = true;
    		    }
	    	}

	    	//must have a title
	    	if (!vm.title || vm.title ==='') {
	    		vm.errs.push('Please specify a title');
	    		if (!vm.scrollValue) {
	    	        $location.hash('scrollRating');
	    	        $anchorScroll();
	    	        vm.scrollValue = true;
	    	    }
	    	}

	    	//must have a description
	    	if (!vm.description || vm.description ==='') {
	    		vm.errs.push('Please specify a description');
	    		if (!vm.scrollValue) {
	    	        $location.hash('scrollTitle');
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

    	function login() {
    		if (!$rootScope.isAuthenticated) {
    			
    			//set post login review text
    			redirectionService.setRedirect({ to: 'reviewEntry', params: { id: vm.id }});

    			//show login modal with relative text
    			var commonText = 'We want to give you proper credit for your accessibility review.';
    			var params = {
    				text: {
    					heading: 'You\'re almost there...',
    					subHeadingJoin: commonText+'  Please create an account to add a review.',
    					subHeadingLogin: commonText+'  Please log in to add a review.'
    				}
    			};
    			loginModalService();
    		}
    	}

    	function submit() {

			//TODO: implement reviewService.submit(params, validationCB, submissionCB);

    		//valid?
    		if (!vm.isvalid()) {
    			return;
    		}

	    	//todo: create a directory entry type
	    	var reviewDirectoryEntryParams = {
	    		rtype: 'd',
	    		directoryEntryid: vm.id,
				rating: vm.rating,
	    		title: vm.title,
				description: vm.description,
				accWheelchairUsers: vm.accWheelchairUsers,
				accLowVision: vm.accLowVision,
				accLowHearing: vm.accLowHearing,
				accLowMobility: vm.accLowMobility,
				reviewDate: new Date()
	    	};

	    	if (vm.travelDate) {
	    		var d = new Date(vm.travelDate);
	    		reviewDirectoryEntryParams.travelDate = (d.getMonth()+1)+'/'+d.getFullYear();
	    	}

	    	//authorized?
    		if (!$rootScope.isAuthenticated) {
    			//persist review data locally
    			//vm.SetLocalStorageReview(vm.id, reviewDirectoryEntryParams);

    			//show login
    			loginModalService();

	    		return;
	    	}

	    	//submit
	    	reviewDirectoryEntryParams.customerId = localStorageService.getCustomerId();
	    	vm.CompleteSubmission(reviewDirectoryEntryParams);

	    	$anchorScroll();
	    }

	    function SetLocalStorageReview(directoryId, reviewDirectoryEntryParams) {
	    	$window.localStorage.setItem('review_'+directoryId, JSON.stringify(reviewDirectoryEntryParams));
	    }

	    function CompleteSubmission(reviewDirectoryEntryParams) {
	    	var successFunc = function (response) {
	    		var data = response.data;
	    		if (data.Status === 0) {
	    			console.warn('business review not submitted: ' + data.Errors);
	    			vm.errs = data.Errors;
	    			return;
	    		}

	    		var newReview = response.data.Data;

	    		//success!
	    		vm.reviewState = 'submitted';

				//remove local storage reference
				$window.localStorage.removeItem('review_'+vm.id);

	    		//update local storage
                var userReviews = localStorageService.getUserReviews();
                userReviews.push(newReview);
                localStorageService.setUserReviews(userReviews);
	    	};

	    	var errFunc = function(response) {
	    		console.log('review not submitted: '+response);
	        };

	    	dataFactory.submitDirectoryEntryReview(reviewDirectoryEntryParams).then(successFunc,errFunc);
	    }

	    function isAlreadyReviewed() {
	    	return vm.review !== undefined;
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

    reviewEntryController.$inject = ['$scope','$rootScope','$state','$stateParams','dataFactory','$window','$location', '$anchorScroll','localStorageService', 'loginModalService', 'redirectionService'];
    app.controller('reviewEntryController', reviewEntryController);
};