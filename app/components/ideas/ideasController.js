module.exports = function(app) {
    var ideasController = function ($rootScope,$scope,$state,dataFactory,$filter,$location, $window,environmentService) {
        var vm = this;
        vm.env = environmentService();
        $scope.Math = window.Math;
        vm.init = init;
        vm.articleBoxes = [];
        vm.cityBoxes = [];
        vm.allCities = [];
        vm.cityBoxesToShow = [];
        vm.isInCityBoxesToShow = isInCityBoxesToShow;
        vm.shiftCityBoxesRight = shiftCityBoxesRight;
        vm.shiftCityBoxesLeft = shiftCityBoxesLeft;
        vm.getCityBoxColor = getCityBoxColor;
        vm.onChangeCity = onChangeCity;
        vm.inspirationOptions = [];

        vm.shiftRight = shiftRight;
        vm.shiftLeft = shiftLeft;

         
        vm.width = $window.innerWidth;
        vm.selectedCity = '';
        
        vm.selectedInspirationSection = '';
        vm.setInspirationSection = setInspirationSection;
        vm.isInspirationAllSelected = isInspirationAllSelected;
        vm.isInspirationWestSelected = isInspirationWestSelected;
        vm.isInspirationMidWestSelected = isInspirationMidWestSelected;
        vm.isInspirationSouthWestSelected = isInspirationSouthWestSelected;
        vm.isInspirationNorthEastSelected = isInspirationNorthEastSelected;
        vm.isInspirationSouthEastSelected = isInspirationSouthEastSelected;

        //paging
        vm.resetCurrentBoxSetPage = resetCurrentBoxSetPage;
        vm.currentBoxSetPage = vm.resetCurrentBoxSetPage();
        // vm.boxSetPageSize = 12;
        // vm.inspirationBoxLimit = 12;
        vm.getArticleBoxesToShow = getArticleBoxesToShow;
        vm.getNumberOfPages = getNumberOfPages;
        vm.ShowPrevBoxSet = ShowPrevBoxSet;
        vm.ShowNextBoxSet = ShowNextBoxSet;

         //// Resize window 
        if(vm.width <= 767)
        {
            vm.cityBoxesToShow = [0];

            vm.boxSetPageSize = 4;
            vm.inspirationBoxLimit = 4;
        }else{
            vm.cityBoxesToShow = [0,1,2,3];

            vm.boxSetPageSize = 12;
            vm.inspirationBoxLimit = 12;
        }

        vm.currentIdea = 0;
        vm.shiftCurrentIdeaLeft = shiftCurrentIdeaLeft;
        vm.shiftCurrentIdeaRight = shiftCurrentIdeaRight;
        vm.getImage = getImage;
        vm.firstParagraph = firstParagraph;

        
        //initizalization
        vm.init();

        //required
        require("./ideas.less");
        require("file-loader?name=arrow_black_left.png!../../../resources/img/common/arrow_black_left.png");
        require("file-loader?name=arrow_black_right.png!../../../resources/img/common/arrow_black_right.png");
        require("file-loader?name=arrow_white_left.png!../../../resources/img/common/arrow_white_left.png");
        require("file-loader?name=arrow_white_right.png!../../../resources/img/common/arrow_white_right.png");

        require("file-loader?name=Website_Gray.png!../../../resources/img/tripPlanner/Website_Gray.png");

        
        //function definition
        function init() {

            //setup meta tags
            var title = 'Discover accessible travel ideas';
            var desc = 'Top accessible hotels, attractions and trip ideas for travelers with disabilities.';
            var img = 'https://accessiblego-admin.azurewebsites.net/Image/GetImage?assetId=b3dd1ce4-92e9-4fc6-a1ee-886d9e80814c&Size=medium';
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

            //get all articles
            var sFunc = function(response) {
                vm.articleBoxes = response.data;
            };
            var eFunc = function(response) {
                console.log('no article data found');
            };
            dataFactory.getAllArticles().then(sFunc,eFunc);

            //get top 5 cities (orlando, new york, chicago, LA, Miami)
            var successFunc = function success(response) {
                for(var i=0;i<response.data.length;i++) {
                    vm.allCities.push(response.data[i]);
                    vm.cityBoxes.push(response.data[i]);
                }
            };
            var errFunc = function error(response) {
                console.log('no city data found');
            };
            dataFactory.getAllCities().then(successFunc,errFunc);


            // inspirations options in xs dropdown
            vm.inspirationOptions = [
                { key: '', text: 'All'},
                { key: 'Northeast', text: 'Northeast'},
                { key: 'Midwest', text: 'Midwest'},
                { key: 'Southeast', text: 'Southeast'},
                { key: 'Southwest', text: 'Southwest'},
                { key: 'Northwest', text: 'Northwest'},
                {key:'West', text:'West'}
            ];

            vm.xsInspirationSelection=vm.inspirationOptions[0];
        }
      
     

         angular.element($window).bind('resize', function(){

             vm.width = $window.innerWidth;
             if(vm.width <= 767)
             {
                 vm.cityBoxesToShow = [0];

                 vm.boxSetPageSize = 4;
                 vm.inspirationBoxLimit = 4;
             }else{
                 vm.cityBoxesToShow = [0,1,2,3];

                 vm.boxSetPageSize = 12;
                 vm.inspirationBoxLimit = 12;
             }
    
             // manuall $digest required as resize event
             // is outside of angular
             $scope.$apply();
           });

        function onChangeCity() {
            //$location.path("/city/" + cityName.replace(' ','_'));
            if (!vm.selectedCity || !vm.selectedCity.Name) return;
            $state.go('city',{ name: vm.selectedCity.Name.replace(' ','_') });
        }

        function isInCityBoxesToShow(index) {
            return $.inArray(index, vm.cityBoxesToShow) !== -1;
        }
        function shiftCityBoxesRight() {
            vm.shiftRight(vm.cityBoxesToShow,vm.cityBoxes.length);
        }
        function shiftCityBoxesLeft() {
            vm.shiftLeft(vm.cityBoxesToShow);
        }
        function getCityBoxColor(index) {
            if (index%4 === 0) return 'ec5ca4';
            if (index%4 === 1) return 'ebd719';
            if (index%4 === 2) return '54b1db';
            if (index%4 === 3) return '80c23f';
            return 'ffffff';
                // 1,5,9,13,17 - ec5ca4
                // 2,6,10,14,18 - ebd719
                // 3,7,11,15,19 - 27799f
                // 4,8,12,16,20 - 80c23f
        }

        function shiftRight(numarr,numTotalBoxes) {
            var nextNum = numarr[numarr.length-1]+1;
            if (nextNum > numTotalBoxes-1)
                return;
            numarr.shift();
            numarr.push(nextNum);
        }
        function shiftLeft(numarr) {
            var prevNum = numarr[0]-1;
            if (prevNum < 0)
                return;
            numarr.unshift(prevNum);
            numarr.pop();
        }

        //-- travel inspiration by location
        function setInspirationSection(section) {
            vm.selectedInspirationSection = section;
            vm.currentIdea=0;
            vm.resetCurrentBoxSetPage();
            for(var i=0;i<vm.inspirationOptions.length;i++)
            {
                if(vm.inspirationOptions[i].key === section)
                {
                    vm.xsInspirationSelection=vm.inspirationOptions[i];
                }
            }
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
        $scope.$watch('vm.selectedInspirationSection',function() {
           vm.resetCurrentBoxSetPage();
        });
       

        //--> paging for this section
        function resetCurrentBoxSetPage() {
            vm.currentBoxSetPage = 0; 
        }
        function getArticleBoxesToShow() {
            return $filter('filter')(vm.articleBoxes, vm.selectedInspirationSection, (vm.selectedInspirationSection!==''));
        }
        function getNumberOfPages() {
            return Math.ceil(vm.getArticleBoxesToShow().length/vm.boxSetPageSize);
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
            vm.currentBoxSetPage=vm.currentBoxSetPage-1;
        }
        function ShowNextBoxSet() {
            vm.currentBoxSetPage=vm.currentBoxSetPage+1;
        }


        //current idea
        function shiftCurrentIdeaLeft() {
            if (vm.currentIdea === 0) return;
            vm.currentIdea--;
        }
        function shiftCurrentIdeaRight() {
            if (vm.currentIdea === vm.articleBoxes.length-1) return;
            vm.currentIdea = vm.currentIdea+1;
        }
        function getImage(asset) {
            if (!asset) return "";
            return vm.env.BASEURL_CONTENT + '/Image/GetImage?assetId=' + asset.Id + '&size.Name=medium';           
        }

        function firstParagraph(text) {
            var fp = text.indexOf("</p>");
            if (!fp || fp < 0) fp = text.length;
            return text.substring(0,fp);
        }


        function parseJsonDate(jsonDate) {
			var offset = new Date().getTimezoneOffset() * 60000;
			var parts = /\/Date\((-?\d+)([+-]\d{2})?(\d{2})?.*/.exec(jsonDate);
			if (parts[2] === undefined) parts[2] = 0;
			if (parts[3] === undefined) parts[3] = 0;
			d = new Date(+parts[1] + offset + parts[2] * 3600000 + parts[3] * 60000);
			date = d.getDate() + 1;
			date = date < 10 ? "0" + date : date;
			mon = d.getMonth() + 1;
			mon = mon < 10 ? "0" + mon : mon;
			year = d.getFullYear();
			return (date + "." + mon + "." + year);
		}
    };

    ideasController.$inject = ['$rootScope','$scope','$state','dataFactory','$filter','$location', '$window','environmentService'];
    app.controller('ideasController', ideasController);
};

