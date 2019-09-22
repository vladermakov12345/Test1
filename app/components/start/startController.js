module.exports = function (app) {
    var startController = function ($rootScope) {
        require("./start.less");
        var vm = this;
        vm.init = init;
        vm.userProfile = {};
        vm.checkedActive = checkedActive;
        vm.activeDivId = 1;
        vm.cta_inspiration = require("../../../resources/img/welcome/cta-inspiration-original.png");
        vm.cta_book = require("../../../resources/img/welcome/cta-book-original.png");
        vm.cta_resources = require("../../../resources/img/welcome/cta-resources-original.png");
        vm.clubgo_banner = require("../../../resources/img/welcome/clubgo_banner.png");

        vm.heart_red_outline_white = require("../../../resources/img/welcome/heart_red_outline_white.png");
        vm.icon_review = require("../../../resources/img/welcome/icon-review.png");
        vm.icon_comment = require("../../../resources/img/welcome/icon-comment.png");
        vm.icon_forum = require("../../../resources/img/welcome/icon-forum.png");


        vm.init();

        function init() {
            vm.userProfile = $rootScope.userProfile;
        }

        function checkedActive(event) {
            var getNodeList = document.getElementsByClassName("listol_class")[0].children;
            angular.forEach(getNodeList, function (value, key, obj) {
                if (value.id == event.target.id) {
                    event.target.setAttribute('class', 'active');
                    if (event.target.id == "li_second") {
                        vm.activeDivId = 2;
                    }
                    else if (event.target.id == "li_third") {
                        vm.activeDivId = 3;
                    }
                    else if (event.target.id == "li_first") {
                        vm.activeDivId = 1;
                    }
                }
                else {
                    value.setAttribute('class', '');
                }
            });

        }
    };

    startController.$inject = ['$rootScope'];
    app.controller('startController', startController);
};
