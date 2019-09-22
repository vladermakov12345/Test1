(function() {
    require("./articlebox.less");
    
    var articleboxController = function($scope,$state,environmentService) {
        var vm = this;
        vm.env = environmentService();
    };

    articleboxController.$inject = ['$scope','$state','environmentService'];

    var articleboxFunc = function (dataFactory,$state) {
        return {
        	restrict: 'E',
            controller: articleboxController,
            controllerAs: 'articlebox',
            bindToController: true,
		    template: require("./articlebox.html"),
		    link: function(scope, element, attrs) {
                scope.articlebox.articleid = attrs.articleid;
                scope.articlebox.introimageid = attrs.introimageid;
                scope.articlebox.title = attrs.title;
                scope.articlebox.urlsafetitle = attrs.urlsafetitle;
                scope.articlebox.IntroText=attrs.text;
                scope.expanded =  attrs.expanded;
		    }
        };
    };

    articleboxFunc.$inject = ['dataFactory','$state'];
    angular.module('app').directive('articlebox', articleboxFunc);
})();
    