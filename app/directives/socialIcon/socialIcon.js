(function () {
    require("./socialIcon.less");

    var socialIconController = function ($scope, $window) {
        var vm = this;
        //vm.getSlugUrl = getSlugUrl;
        vm.getFacebookShareLink = getFacebookShareLink;
        vm.popupFacebookShareWindow = popupFacebookShareWindow;
        vm.getTwitterShareLink = getTwitterShareLink;
        vm.popupTwitterShareWindow = popupTwitterShareWindow;

        //-- FACEBOOK --//
        function popupFacebookShareWindow() {
            //var text = encodeURIComponent(vm.title).replace(/ /g,"_");
            var width = 575,
            height = 400,
            left = ($window.innerWidth - width) / 2,
            top = ($window.innerHeight - height) / 2,
            fullUrl = vm.getFacebookShareLink(),
            opts = 'status=1' +
            ',width=' + width +
            ',height=' + height +
            ',top=' + top +
            ',left=' + left;

            $window.open(fullUrl, 'facebook', opts);
        }
        function getFacebookShareLink() {
            if (!vm.slug) return;
            return 'https://www.facebook.com/sharer/sharer.php?' + 'u=' + encodeURIComponent(vm.url) + replaceSpacesWithUnderscores(vm.slug) + '&amp;src=sdkpreparse';
        }


        //-- TWITTER --//
        function popupTwitterShareWindow() {
            //var text = encodeURIComponent(vm.title).replace(/ /g,"_");
            var width = 575,
            height = 400,
            left = ($window.innerWidth - width) / 2,
            top = ($window.innerHeight - height) / 2,
            url = vm.getTwitterShareLink(vm.url, vm.slug),
            opts = 'status=1' +
            ',width=' + width +
            ',height=' + height +
            ',top=' + top +
            ',left=' + left;

            $window.open(url, 'twitter', opts);
        }

        function getTwitterShareLink() {
            if (!vm.slug) return;
            return 'https://twitter.com/share?text=' + encodeURIComponent(vm.title) +'&url=' + encodeURIComponent(vm.url) + replaceSpacesWithUnderscores(vm.slug);
        }

        function replaceSpacesWithUnderscores(txt) {
            if (!txt) return;
            return txt.replace(/ /g,"_");
        }

        // function getSlugUrl(slug) {
        //     if (!slug) return;
        //     return 'https://accessiblego.com/articles/' + replaceSpacesWithUnderscores(slug);
        // }
    };

    socialIconController.$inject = ['$scope', '$window'];

    var socialIconFunc = function () {
        return {
            restrict: 'E',
            controller: socialIconController,
            controllerAs: 'socialIcon',
            bindToController: true,
            template: require("./socialIcon.html"),
            scope: {
                url: '@url',
                slug: '@slug',   //todo: refactor this to slug
                title: '@title'
            }
        };
    };

    socialIconFunc.$inject = [];
    angular.module('app').directive('socialIcon', socialIconFunc);
})();

