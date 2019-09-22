module.exports = function(app) {
    var homepageController = function ($rootScope,$scope,$location,$anchorScroll,$timeout,$interval,$window,$state,dataFactory,hotelSearchService,flightSearchService,carSearchService,$filter,$stateParams,environmentService,$document) {

        var vm = this;
        vm.env = environmentService();
        vm.init = init;
        vm.listenForEvents = listenForEvents;
        
        vm.selectedBookingSection = 'hotels';
        vm.setBookingSection = setBookingSection;
        vm.isHotelSectionSelected = isHotelSectionSelected;
        vm.isFlightSectionSelected = isFlightSectionSelected;
        vm.isCruiseSectionSelected = isCruiseSectionSelected;
        vm.isInsuranceSectionSelected = isInsuranceSectionSelected;
        vm.isCarSectionSelected = isCarSectionSelected;
        
        vm.selectedInspirationSection = '';
        vm.setInspirationSection = setInspirationSection;
        vm.isInspirationAllSelected = isInspirationAllSelected;
        vm.isInspirationWestSelected = isInspirationWestSelected;
        vm.isInspirationMidWestSelected = isInspirationMidWestSelected;
        vm.isInspirationSouthWestSelected = isInspirationSouthWestSelected;
        vm.isInspirationNorthEastSelected = isInspirationNorthEastSelected;
        vm.isInspirationSouthEastSelected = isInspirationSouthEastSelected;
        //vm.animateBookingTabOnLoad = animateBookingTabOnLoad;
        vm.inspirationBoxLimit = 12;

        vm.defaultPartnerCount = 8;
        vm.partnerCount = vm.defaultPartnerCount;
        vm.goToUrl = goToUrl;

        //local persistance of articles
        //vm.allArticles = [];
        vm.inspiration_boxes = [];
        vm.showcaseBoxes = [];

        vm.currentIdea = 0;

        vm.hasSignedUp = false;
        vm.hasAttemptedSignUp = false;
        //vm.emailSignUp = emailSignUp;


        //-- errors
        vm.errs = [];
        vm.resetErrs = resetErrs;

        vm.getSearchText = getSearchText;
        vm.setupSliderForTestimonials = setupSliderForTestimonials;


        //initialization
        vm.init();
        vm.listenForEvents();
        
        //required
        require("./home.less");
        //vm.image_hotelsBlack = require("../../../resources/img/home/hotels_black.png");
        //vm.image_hotelsWhite = require("../../../resources/img/home/hotels_white.png");
        //vm.image_flightsBlack = require("../../../resources/img/home/flights_black.png");
        //vm.image_flightsWhite = require("../../../resources/img/home/flights_white.png");
        //vm.image_cruisesBlack = require("../../../resources/img/home/cruises_black.png");
        //vm.image_cruisesWhite = require("../../../resources/img/home/cruises_white.png");
        //vm.image_insuranceBlack = require("../../../resources/img/home/insurance_black.png");
        //vm.image_insuranceWhite = require("../../../resources/img/home/insurance_white.png");
        //vm.image_carsBlack = require("../../../resources/img/home/cars_black.png");
        //vm.image_carsWhite = require("../../../resources/img/home/cars_white.png");

        //vm.image_brace = require("../../../resources/img/home/brace.png");
        
        //vm.image_commentDesk = require("../../../resources/img/home/comment-desk.png");
        //vm.image_commentMob = require("../../../resources/img/home/comment-mob.png");
        //vm.image_hotellistingDesk = require("../../../resources/img/home/hotel-listing-desk.png");
        //vm.image_hotellistingMob = require("../../../resources/img/home/hotel-listing-mob.png");
        //vm.image_hotelreviewDesk = require("../../../resources/img/home/hotel-review-desk.png");
        //vm.image_hotelreviewMob = require("../../../resources/img/home/hotel-review-mob.png");
        //vm.image_tophotelsMob = require("../../../resources/img/home/top-hotels-mob.png");

        // vm.image_attractions = require("../../../resources/img/home/attractions.png");
        // vm.image_caregivers = require("../../../resources/img/home/caregivers.png");
        // vm.image_equipmentRental = require("../../../resources/img/home/equipment_rental.png");
        // vm.image_itineraries = require("../../../resources/img/home/itineraries.png");
        // vm.image_tourCompanies = require("../../../resources/img/home/tour_companies.png");
        // vm.image_transportation = require("../../../resources/img/home/transportation.png");

        // vm.image_booking = require("../../../resources/img/home/icons/booking.png");
        // vm.image_bookingw = require("../../../resources/img/home/icons/bookingw.png");
        // vm.image_reviews = require("../../../resources/img/home/icons/reviews.png");
        // vm.image_reviewsw = require("../../../resources/img/home/icons/reviewsw.png");
        // vm.image_travel = require("../../../resources/img/home/icons/travel.png");
        // vm.image_travelw = require("../../../resources/img/home/icons/travelw.png");
        // vm.image_idea = require("../../../resources/img/home/icons/idea.png");
        // vm.image_ideaw = require("../../../resources/img/home/icons/ideaw.png");
        // vm.image_community = require("../../../resources/img/home/icons/community.png");
        // vm.image_communityw = require("../../../resources/img/home/icons/communityw.png");

        //vm.image_iconi = require("../../../resources/img/home/icons/i-icon.png");

        /* Partner Logos */
        dataFactory.getPartnerData().then(function(res) {
            vm.partnerLogos = res.data.partners;
        });

        /* testimonials */
        vm.testimonialData = dataFactory.getTestimonialData();

        //planner dropdown options
        //$scope.homePlannerCityOptions = null;

        //function definitions

        function setupSliderForTestimonials() {
            angular.element(document).ready(function () {
                vm.testimonials = angular.element('.testimonials');
                vm.testimonialsArgs = {
                    dots: true,
                    slidesToShow: 1,
                    appendArrows: '.testimonials-nav',
                    appendDots: '.testimonials-nav',
                    adaptiveHeight: true
                };
                vm.testimonials.not('.slick-initialized').slick(vm.testimonialsArgs);
            });
        }

        function init() {

            //setup meta tags
            var title = 'Accessible Travel Made Smart';
            var desc = 'Get accessibility details and community reviews for hotels, flights and more.';
            $rootScope.metaTagService.setup({
                metaTitle: title,
                ogTitle: title,
                twitterTitle: title,
                metaDescription: desc,
                ogDescription: desc,
                twitterDescription: desc           
            });

            //contrast toggle
            var contrastButton = angular.element('.switcher input[type="button"]');
                contrastButton.click(function(){
                    contrastButton.parents('.switcher').find('label').removeClass('focus');
                    contrastButton.parents('.switcher').find('label').removeClass('active');
            });

            //contrast toggle

            /*
            var contrastButton = angular.element('.switcher input[type="button"]');
            contrastButton.click(function(){
                contrastButton.parents('.switcher').find('label').removeClass('focus');
                contrastButton.parents('.switcher').find('label').removeClass('active');
            });*/

            //???
            angular.element(document).on('click', '.search .dropdown-menu', function (e) {
                e.stopPropagation();
            });

            //setup sliders
            vm.setupSliderForTestimonials();


            angular.element('.switcher').on('change', function() {

                if( angular.element('.on input').is(':checked') ) {

                    angular.element(this).addClass('selected');

                } else {

                    angular.element(this).removeClass('selected');

                }

            });

            //get articles - not needed in new design homepage 
            // var successFunc = function success(response) {

            //     //persist all articles locally
            //     vm.allArticles = response.data;

            //     //articles marked for homepage carousel rotation
            //     vm.showcaseBoxes = $filter('filter')(vm.allArticles, vm.hasHomepageSeq);

            //     //filter for travel inspiration by location
            //     vm.inspiration_boxes = $filter('filter')(vm.allArticles, function(val,index,array) {
            //         return val.City.Id !== '6afc63d5-93f3-435d-b7de-4867129ffe66';
            //     });

                
            // };
            // var errFunc = function error(response) {
            //     console.log('getAllArticles error: ' + response); 
            // };
            // dataFactory.getAllArticles(true).then(successFunc, errFunc);
            // vm.animateBookingTabOnLoad();



        }

        // function animateBookingTabOnLoad(){
            
        //     setTimeout(function() {
        //         var mainDiv = document.getElementById('home');
        //         if (mainDiv) {
        //             mainDiv.firstElementChild.children[3].className = "showcase-sec up-animation";
        //         }
        //     }, 1000);
            
        // }

        //below is for old home
        function setBookingSection(section) {
            vm.selectedBookingSection = section;
            vm.resetErrs();
        }
        function isHotelSectionSelected() {
            return vm.selectedBookingSection === 'hotels';
        }
        function isFlightSectionSelected() {
            return vm.selectedBookingSection === 'flights';
        }
        function isCruiseSectionSelected() {
            return vm.selectedBookingSection === 'cruises';
        }
        function isInsuranceSectionSelected() {
            return vm.selectedBookingSection === 'insurance';
        }
        function isCarSectionSelected() {
            return vm.selectedBookingSection === 'cars';
        }
        //listen for rootscope emitted event 'tabEventFired'
        function listenForEvents() {
            $scope.$on('tabEventFired', function(event, args) {
                console.log(event);
                $timeout(function() {
                    var element = $window.document.getElementById("home-book-hotel-button");
                    if(element)
                      element.focus();
                  });
            });
        }
        function resetErrs() {
            vm.errs = [];
            hotelSearchService.errs = [];
            flightSearchService.errs = [];
            carSearchService.errs = [];
            $scope.$apply();
        }
            
        
        function getSearchText(city) {
            vm.hotelDestination = city;
        }

        //-- travel inspiration by location
        function setInspirationSection(section) {
            vm.selectedInspirationSection = section;
        }
        function isInspirationAllSelected() {
            return vm.selectedInspirationSection === '';
        }
        function isInspirationWestSelected() {
            return vm.selectedInspirationSection === 'West';
        }
        function isInspirationMidWestSelected() {
            return vm.selectedInspirationSection === 'Midwest';
        }
        function isInspirationSouthWestSelected() {
            return vm.selectedInspirationSection === 'Southwest';
        }
        function isInspirationNorthEastSelected() {
            return vm.selectedInspirationSection === 'Northeast';
        }
        function isInspirationSouthEastSelected() {
            return vm.selectedInspirationSection === 'Southeast';
        }

        $scope.goToLearnMore = function() {
          // set the location.hash to the id of the element you wish to scroll to.
          $location.hash('learnmore');

          // call $anchorScroll()
          $anchorScroll();
        };



        //email signup form
        // function emailSignUp() {

        //     var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

        //     //validate an email
        //     if (!vm.emailForJoining || vm.emailForJoining === '' || !re.test(vm.emailForJoining.toLowerCase()))
        //     {
        //         vm.hasAttemptedSignUp = true;
        //         return;
        //     }

        //     var successFunc = function (data) {
        //         vm.hasSignedUp = true;
        //         //(not sure how to do this) ensure user is aware of response message
        //         // setTimeout( function() { alert( 'Hello, '+name ) }, 1000 );
        //         // $('#signupConfirmationMessage').attr("tabIndex",-1).focus();
        //     };
        //     var errFunc = function (data, status, headers, config) {
        //         console.log('newsletter signup: failed');
        //     };
        //     dataFactory.signUp(vm.emailForJoining).then(successFunc,errFunc);
        // }




        //-- for new homepage
        vm.firstParagraph = firstParagraph;
        function firstParagraph(text) {
            var fp = 110;    //text.indexOf("</p>");
            text = text.replace('<p>','');
            text = decodeHtml(text);
            if (!fp || fp < 0) fp = text.length;
            return text.substring(0,fp);
        }
        function decodeHtml(html) {
            var txt = document.createElement("textarea");
            txt.innerHTML = html;
            return txt.value;
        }
        vm.shiftCurrentIdeaLeft = shiftCurrentIdeaLeft;
        function shiftCurrentIdeaLeft() {
            if (vm.currentIdea === 0) return;
            vm.currentIdea--;
        }
        vm.shiftCurrentIdeaRight = shiftCurrentIdeaRight;
        function shiftCurrentIdeaRight() {
            if (vm.currentIdea === vm.showcaseBoxes.length-1) return;
            vm.currentIdea = vm.currentIdea+1;
        }
        vm.getImage = getImage;
        function getImage(asset) {
            if (!asset) return "";
            return vm.env.BASEURL_CONTENT + '/Image/GetImage?assetId=' + asset.Id + '&size.Name=medium';           
        }
        vm.hasHomepageSeq = hasHomepageSeq;
        function hasHomepageSeq(v) {
            return v.homepageSeq>0; 
        }



        

        //show all partners
        
        vm.loadAllPartners = function() {
            vm.partnerCount = 1000; //arbitrary 1000 is to ensyure all are shown
        }

        function goToUrl(partnerUrl, id) {
            if (!partnerUrl || !id) {
                console.log('no url or id found');
                return;
            }

            $window.open(partnerUrl,'win_'+id);
        };



        


    };

    homepageController.$inject = ['$rootScope','$scope','$location','$anchorScroll','$timeout','$interval','$window','$state','dataFactory','hotelSearchService','flightSearchService','carSearchService','$filter','$stateParams','environmentService','$document'];
    app.controller('homepageController', homepageController);
};

        //for testing image loader
        //$(function() {
        //    var img = document.createElement('img');
        //    //img.style.height = "100%";
        //    //img.style.width = "100%";
        //    document.getElementById('logoContainer').appendChild(img);
        //});