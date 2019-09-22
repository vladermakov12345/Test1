module.exports = function(app) {
    var ideaSearchController = function ($stateParams,dataFactory,imageService) {

        var vm = this;

        vm.init = init;
        vm.results = [];
        vm.search_phrase = $stateParams.phrase;
        vm.viewtype = 'list';

        vm.search = search;
        vm.getImage = getImage;
        vm.limitText = limitText;
        vm.setViewtype = setViewtype;
        vm.getPreview = getPreview;

        vm.init();

        //required
        require("./ideaSearch.less");
        require("file-loader?name=menu_black.png!../../../resources/img/tripPlanner/menu_black.png");
        require("file-loader?name=menu_green.png!../../../resources/img/tripPlanner/menu_green.png");
        require("file-loader?name=list_black.png!../../../resources/img/tripPlanner/list_black.png");
        require("file-loader?name=list_green.png!../../../resources/img/tripPlanner/list_green.png");


        function init() {

            //set breadcrumbs
            vm.breadcrumbs = [
                { isActive: false, title: 'Travel Ideas', state: 'travel-ideas' },
                { isActive: true, title: 'search results for \'' + vm.search_phrase + '\'' }
            ];

            vm.search();
        }

        function search() {
            if (vm.search_phrase.trim() === '') return;

            var successFunc = function(response) {
        
                vm.results = response.data;
            };
            var errFunc = function(response) {
                console.log('article search error:'); 
                console.log(response);
            };
            dataFactory.searchArticles(vm.search_phrase).then(successFunc,errFunc);
        }

        function getImage(asset) {
            return imageService.getPathToImage(asset);
        }

        function limitText(text, numCharacters) {
            if (!text) return;
            if (text.length>numCharacters)
                return text.substring(1,numCharacters);
            return text;
        }

        function setViewtype(viewtype) {
            vm.viewtype = viewtype;
        }

        function getPreview(text) {
            if (!text) return "";
            var s = text.split(" ");
            var p = s.splice(0, 50);
            var j = p.join(" ");
            if (s.length>0) {
                j += '...';
            }
            return j;
        }
        
    };

    ideaSearchController.$inject = ['$stateParams','dataFactory','imageService'];
    app.controller('ideaSearchController', ideaSearchController);
};
