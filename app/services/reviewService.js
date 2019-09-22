// services reviewEntry, in-article directory review
// 1. encapsulate validation
// 2. handle the login and temporary local storage when not logged in
// 3. handle submission, with a callback

module.exports = function(mod){
    var reviewService = function ($rootScope,dataFactory,localStorageService, loginModalService, redirectionService) {

        var vm = this;
        vm.errs = [];

        vm.validate = validate;
		vm.submit = submit;

        function validate(params) {
        	vm.errs = [];

        	//-- all --//
        	if (['d','h'].indexOf(params.rtype) === -1) {
        		vm.errs.push("Invalid review type specified.");
        		return;
        	}

        	// if (!params.custId || params.custId === '') {
        	// 	vm.errs.push("No  customer Id specified");
        	// 	return;
        	// }

        	if (!params.rating || params.rating === '') {
        		vm.errs.push("Please specify a rating");
        		return;
        	}

        	if (!params.title || params.title === '') {
        		vm.errs.push("Please specify a title");
        		return;
        	}

            if (params.title && params.title.length<5) {
                vm.errs.push("Title must contain at least 5 characters");
                return;
            }

        	if (!params.description || params.description === '') {
        		vm.errs.push("Please specify a description");
        		return;
        	}

            if (params.description && params.description.length<50) {
                vm.errs.push("Description must contain at least 50 characters");
                return;
            }

            if (!params.travelDate) {
                vm.errs.push("Please specify a travel date");
                return;
            }

        	//-- directory specific --//
        	if (params.rtype === 'd') {

	        	if (!params.directoryEntryId || params.directoryEntryId === '') {
	        		vm.errs.push("Invalid directory entry specified.");
	        		return;	
	        	}
	        }
        }

        function submit(params, validationCB, submissionCB, postAuthRedirectParams) {

            //valid?
            vm.validate(params);
            if (vm.errs.length>0) {
                validationCB({ errors: vm.errs});
                return;
            }

            //define submission CB
            var submitReviewFunc = function() {

                //submit
                var successFunc = function (response) {

                    if (response.data.Errors) {
                        submissionCB({success: false, data: response.data.Errors});
                        return;
                    }

                    //reference to new review
                    var newReview = response.data.Data;

                    //caller signal
                    submissionCB({ success: true, data: newReview});

                    //update local storage
                    var userReviews = localStorageService.getUserReviews();
                    params.numUserReviews = params.numUserReviews+1 || 1;
                    userReviews.push(newReview);
                    localStorageService.setUserReviews(userReviews);

                };
                var errFunc = function(response) {
                    submissionCB({ success: false, data: response});
                };

                if (params.rtype === 'h') {
                    dataFactory.submitHotelReview(params).then(successFunc,errFunc);
                }
                if (params.rtype === 'd') {
                    dataFactory.submitDirectoryEntryReview(params).then(successFunc,errFunc);
                }
            };

        	//not authenticated? show login, pass success CB
            if (!localStorageService.getAuthenticationState()) {

                //temporarily persist review locally
                localStorageService.setTemporaryReview(vm.id, params);

                //setup post login/join redirect
                if (postAuthRedirectParams) {
		    		redirectionService.setRedirect(postAuthRedirectParams);
		    	}

    			//show login
                var params = {
                    onSuccessFunc: submitReviewFunc,
                    text: {
                        heading: 'Your thoughts are important',
                        subHeadingJoin: 'Create an account to create a review.',
                        subHeadingLogin: 'Log in to create a review.'
                    }
                };
    			loginModalService(params);

	    		return;
            }

            //authenticated?
        	submitReviewFunc();
        }

    };

    reviewService.$inject = ['$rootScope','dataFactory','localStorageService','loginModalService','redirectionService'];
    mod.service('reviewService', reviewService);
};