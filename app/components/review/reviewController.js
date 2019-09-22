module.exports = function(app) {
    var reviewController = function ($scope,$rootScope,$state,dataFactory,$stateParams) {
    	var vm = this;
   
    	vm.type = 'Unspecified';
    	vm.hotelSelection = {};
    	vm.directoryEntrySelection = {};
        vm.samples = [];
        vm.setupMetaTags = setupMetaTags;
        vm.placeholderText = 'Select the Hotel or Attraction to review';
        vm.togglePlaceholderText = togglePlaceholderText;
    	
        vm.sliderImg = [];
      
    	vm.init = init;

        require("../../../resources/img/review/granny.jpg"); 
        require("./review.less");
      
        vm.image_bluegreen= require("../../../resources/img/review/bluegreen.png");
        vm.image_ameristar= require("../../../resources/img/review/ameristar.png");
        vm.image_homewood= require("../../../resources/img/review/homewood.png");
        //vm.image_family_with_granny= require("../../../resources/img/review/family_with_granny.png");    
        vm.image_review= require("../../../resources/img/review/review.png");
        vm.image_strength_icon= require("../../../resources/img/review/strength_icon.png");
        vm.image_together_icon= require("../../../resources/img/review/together_icon.png");
        vm.image_star= require("../../../resources/img/review/star.png");
        vm.image_starr= require("../../../resources/img/review/starr.png");
        vm.image_mobReview= require("../../../resources/img/review/mobReview.png");
        
        vm.init();
    	function init() {
            vm.sliderImg = [
                { "Id": "0", "ImgUrl": vm.image_bluegreen, "alt": "image_bluegreen","title": "Bluegreen Vacations Club 36", "neighborhood": "Neighborhood", "address": "las Vegas Strip South 372 East Tropicana Ave., Las Vegas, Nevada, 89169, United States","imgstar":vm.image_star,"commentHeading":"Bluegreen Vacations Club 36","commentDate":"January2018", "commentDescription":"Great Place that accommodates wheelchair bound guests. The rooms are large and arranged so that a wheelchair can easily navigate the entire suite. Roll-in shower and large bathrooms. Handicap accessible mini bus that runs to strip several timea a day and night. Pleasant employees that want to make your visit a pleasant experience." },

                { "Id": "1", "ImgUrl": vm.image_ameristar, "alt": "image_ameristar" ,"title": "Ameristar Casino Black Hawk","neighborhood": "Neighborhood","address":"CentralCity-black-Hawk 111 Richman Street, Black hawk, Colorado, 80422, United States", "imgstar":vm.image_starr,"commentHeading":"Not equipment friendly","commentDate":"March2016","commentDescription":"I went to stay at the ameristar in an accessible suite. It had platform beds which didn't allow me to use my hoyer lift for tranfer to and from my bed into the chair. I asked to see a regular accessible room and it was same platform beds. They said it is easier for cleaning people to keep the rooms clean. They said they have had to call EMT services to help tranfer guests to bed. like really? I contacted Corporate, still nothing was done. I do not recommend staying there unless you have someone that can physically do all your transfers."},

                { "Id": "2", "ImgUrl": vm.image_homewood, "alt": "image_homewood", "title": "Homewood Suites By Hilton Austin-south/airport","neighborhood": "Neighborhood","address":"South-Airport (AUS) 4143 Govemors Row, Austin, Texas, 78744, United States","imgstar":vm.image_star,"commentHeading":"Best Place to stay in Austin","commentDate":"July 2017","commentDescription":"We travel from Germantown TN to Austin TX to visit our oldest son and granddaughter. Our youngest son is in a wheelchair and sometimes travelling long distance can be a challange, especially at bathroom breaks. Once we arrived at Homewood suites, we knew we had made a great choice for wheelchair accessibility. The rooms were huge, bedrooms were very accessible, and bathrooms were great with a big roll-in shower. The entire hotel was very accessible and easy to move around inside, love this place." },
            ];
          


    		if ($stateParams.i === 'h') {
    			vm.type ='hotel';
    		}
    		if ($stateParams.i === 'o') {
    			vm.type ='organization';
    		}

            //setup meta tags
            vm.setupMetaTags();

            //get sample - the ritz-carlton half moon bay
            dataFactory.getHotelReviews("700110777").then(function (reviews) {
                if (reviews.data && reviews.data[0]) {
                    vm.samples.push(reviews.data[0]);
                }
            });

            //get sample - monterey plaza hotel and spa
            dataFactory.getHotelReviews("700033609").then(function (reviews) {
                if (reviews.data && reviews.data[0]) {
                    vm.samples.push(reviews.data[0]);
                }
            });
    	}

    	vm.gotoreviewhotel = function() {
            if (!vm.hotelSelection) return;
            $state.go('reviewHotel',{hid: vm.hotelSelection.ppnid});
    	};

    	vm.gotoreviewEntry = function() {
            //todo: figure out whether to send user to reviewHotel or reviewEntry
            if (!vm.directoryEntrySelection) return;
            $state.go('reviewEntry',{id: vm.directoryEntrySelection.ppnid});
    	};

		vm.filterFunc = function(a,b) {
			console.log('filtering');
		};

		vm.gotoreviewForm = function() {
		  if (!vm.listing) return;

		  if (vm.listing.type === 'directory') {
            $state.go('reviewEntry',{id: vm.listing.ppnid});
		  }

		  if (vm.listing.type === 'hotel') {
            $state.go('reviewHotel',{hid: vm.listing.ppnid});
		  }
		};

        function setupMetaTags() {

            var title = 'Write an accessibility review today!';
            var desc = 'Write an accessibility review of a hotel, attraction, tour company & more.  We\'re improving accessible travel, one review at a time.';
            var img = '//q-xx.bstatic.com/images/hotel/max500/218/21828528.jpg;';

            $rootScope.metaTagService.setup({
                metaTitle: title,
                metaDescription: desc,
                ogTitle: title,
                ogDescription: desc,
                ogImage: img,
                twitterTitle: title,
                twitterDescription: desc,
                twitterImage: img,
                twitterImageAlt: title
            });
            
        }

        function togglePlaceholderText() {
            vm.placeholderText = 'Type the name of the Hotel or Attraction';
        }

// Slider moving icons
$(".carousel-indicatorss li:first-child").click(function(){
    $(".power_review_sec .mobile-icon").addClass("hideIcon");
    $(".power_review_sec .container .mobile-icon:first-child").removeClass("hideIcon");
    $(".power_review_sec .container .second-img .mobile-icon").addClass("hideIcon");
});
$(".carousel-indicatorss li:nth-child(2)").click(function(){
    $(".power_review_sec .mobile-icon").addClass("hideIcon");
    $(".power_review_sec .container .second-img .mobile-icon:first-child").removeClass("hideIcon");
    
    
});
$(".carousel-indicatorss li:last-child").click(function(){
    $(".power_review_sec .mobile-icon").addClass("hideIcon");
    $(".power_review_sec .container .second-img .mobile-icon:last-child").removeClass("hideIcon");    
});

//  $('#carousel125').carousel({ interval: false });
    
$(".carousel2").click(function(){
   // $('#carousel125').carousel({ interval: false });
    $(".carousel-indicatorss li").removeClass("active");
 $(this).addClass("active");
});

    };

    reviewController.$inject = ['$scope','$rootScope','$state','dataFactory','$stateParams'];
    app.controller('reviewController', reviewController);
};
