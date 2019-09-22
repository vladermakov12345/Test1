(function () {
    require("./favoriteDirective.less");

    var favoriteDirectiveController = function ($rootScope, $scope, $state, environmentService, dataFactory, userFavoriteService, AUTH_EVENTS, loginModalService) {
        var vm = this;
        vm.env = environmentService();
        vm.resetIsFavorite = resetIsFavorite;
        vm.toggleData = toggleData;
        vm.addFavorite = addFavorite;
        vm.removeFavorite = removeFavorite;
        //vm.isAuthenticated = $rootScope.isAuthenticated;
        vm.isfavorite = false;  

        $scope.$watch('favoriteDirective.isfavorite', function (newVal) {
            //vm.isfavorite = newVal;
        });

        //binding of reference id may occur after directive link is complete, so watch for it here  
        $scope.$watch('favoriteDirective.referenceid', function (newVal) {
            vm.referenceid = newVal;
            vm.resetIsFavorite();
        });

        //subscribe to changes from localStorageService (ex login)
        $rootScope.$on('userFavorites:updated', function(event, data) {
            if (!data) return;
            vm.resetIsFavorite();
        });

        function resetIsFavorite() {
            vm.isfavorite = false;
            var fav = userFavoriteService.getFavorite(vm.type, vm.referenceid);
            if (fav) {
                vm.isfavorite = true;
                vm.userFavoriteId = fav.userFavoriteId;
            }
            // vm.isfavorite = false;
            // $.each(data, function (key, val) {
            //     if (val.type===vm.type && val.referenceId===vm.referenceid) {
            //         vm.isfavorite = true;
            //         return;
            //     }
            // });
        }

        function toggleData() {

            var toggleFavorite = function() {
                if (!vm.isfavorite) {
                    vm.addFavorite();
                    return;
                }
                
                vm.removeFavorite();
            };

            if (!$rootScope.isAuthenticated) {
                var params = {
                    onSuccessFunc: toggleFavorite,
                    text: {
                        heading: 'Saving this for later?',
                        subHeadingJoin: 'Smart move!<br/>Create an account to add this to your favorites',
                        subHeadingLogin: 'Smart move!<br/>Log in to add this to your favorites'
                    }
                };
                loginModalService(params);
                return;
            }

            toggleFavorite();
        }

        function addFavorite() {
            var successCB = function(obj) {
                //vm.isfavorite = !vm.isfavorite;
                if (!obj.success) return;
                vm.userFavoriteId = obj.favorite.userFavoriteId;
            };
            var result = userFavoriteService.addFavorite(vm.type, vm.referenceid).then(successCB);
        }

        function removeFavorite() {
            var successCB = function(obj) {
                if (!obj.success) return;
                //vm.isfavorite = !vm.isfavorite;
            };
            var result = userFavoriteService.removeFavorite(vm.userFavoriteId).then(successCB);
        }
    };

    favoriteDirectiveController.$inject = ['$rootScope', '$scope', '$state', 'environmentService', 'dataFactory','userFavoriteService', 'AUTH_EVENTS', 'loginModalService'];

    var favoriteDirectiveFunc = function ($rootScope, dataFactory, $state, userFavoriteService, AUTH_EVENTS) {
        return {
            restrict: 'E',
            controller: favoriteDirectiveController,
            controllerAs: 'favoriteDirective',
            bindToController: true,
            template: require("./favoriteDirective.html"),
            scope: {
                //userFavoriteId: '=',
                type: '@',   
                referenceid: '@'//,
                //isfavorite: '='
            },
            link: function (scope, element, attrs) {

                //default false
                scope.favoriteDirective.isfavorite = false;

                //is a favorite?
                var fav = userFavoriteService.getFavorite(attrs.type, attrs.referenceid);
                if (fav) {
                    scope.favoriteDirective.isfavorite = true;
                    scope.favoriteDirective.userFavoriteId = fav.userFavoriteId;
                }

                //subscribe to a login
                // $rootScope.$on('userFavorites:updated', function(event, data) {
                //     console.log('processing login for favorite ' + scope.favoriteDirective.userFavoriteId);
                // });

                // scope.favoriteDirective.id = attrs.id;
                // scope.favoriteDirective.type = attrs.type;
                // scope.favoriteDirective.isFavorite=attrs.isfavorite;
            }
        };
    };

    favoriteDirectiveFunc.$inject = ['$rootScope', 'dataFactory', '$state', 'userFavoriteService', 'AUTH_EVENTS'];
    angular.module('app').directive('favoriteDirective', favoriteDirectiveFunc);
})();

