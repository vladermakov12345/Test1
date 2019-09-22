(function() {

    var hotelReviewController = function($scope) {
        
        var vm = this;
        vm.reviewData = {};
        vm.init = init;
        vm.initialize = initialize;
        vm.getFormattedReviewDate = getFormattedReviewDate;
        vm.LookupDisplay = LookupDisplay;
        vm.getIndicatorHtml = getIndicatorHtml;
        vm.hasPhotos = false;

        vm.init();

        function init() {
            
        }

        function initialize() {
            vm.reviewData =  JSON.parse(vm.review);

            //determine if we actually have photos
            if (vm.reviewData.photos && vm.reviewData.photos.length>0) {
                $.each(vm.reviewData.photos,function(a,b) {
                    if (b.isActive === true) vm.hasPhotos = true;
                });
            }
        }

        function getFormattedReviewDate(date) {
            if (!date) return "";
            return dateFns.format(date, 'MMMM YYYY');
        }

        function LookupDisplay(a) {
            if (a==='accWheelchairUsers') return "Visitors who are wheelchair users";
            if (a==='accLowVision') return "Visitors who are blind or have low vision";
            if (a==='accLowHearing') return "Visitors who are deaf or hard of hearing";
            if (a==='accLowMobility') return "Visitors with mobility disabilities";
            return "";
        }

        function getIndicatorHtml(v) {
            if (v === null) return 'unsure';
            if (v) return '<i class=\'fa fa-check-circle\' aria-hidden=\'true\'></i>';
            if (!v) return '<i class=\'fa fa-times-circle\' aria-hidden=\'true\'></i>';
        }

        vm.registerCollapsible = function(c) {
            $(document).ready(function() {
                $('#'+c).on('click',function () {
                    var x = $('#'+c+' #registerCollapsibleText')[0].innerText;
                    var n = (x === 'Open full review'?'Close review':'Open full review');
                    $('#'+c+' #registerCollapsibleText')[0].innerText = n;
                });
            });
        };
    };

    hotelReviewController.$inject = ['$scope'];

    var hotelReviewFunc = function ($state) {
        return {
        	restrict: 'E',
            controller: hotelReviewController,
            controllerAs: 'vm',
            bindToController: true,
		    template: require("./hotelReview.html"),
            scope: {
                review: '@'
            }
        };
    };

    hotelReviewFunc.$inject = ['$state'];
    angular.module('app').directive('hotelReview', hotelReviewFunc);
})();
    