module.exports = function(mod){
    var joinModalService = function ($rootScope,$uibModal) {

        var vm = this;
        vm.cb = undefined;

        //handles: explicit dismissal
        var registerSuccessFunc = function(a,b,c) {
            if (vm.cb) {
                vm.cb();
            }
        };

        //handles: when dismissed by clicking outside modal
        var registerFailureFunc = function(a,b,c) {

        };

        //handles: when closed
        var registerErrorFunc = function(a,b,c) {
        };

        return function(params) {

            // Parse the resolve object
            // function parseResolve(data) {
            //     if (typeof data === 'string') {
            //         return {
            //             data: function() {
            //                 return data;
            //             }
            //         };
            //     }
            //     else if (typeof data === 'object') {
            //         var resolve = {};
            //         angular.forEach(data, function(value, key) {
            //             resolve[key] = function() {
            //                 return value;
            //             };
            //         });
            //         return resolve;
            //     }
            // }

            var modalParams = {    //angular bootstrap modal
                
                template: require("../components/account/join/joinModal.html"),
                    controller: 'joinModalController',
                    controllerAs: 'vm',
                    bindToController: true,
                backdrop:'static',
                keyboard: true,
                animation: true,
                size: 'md',
                // resolve: function() {
                //     $scope.emailAddress = 'test123#';
                //     // items: function() {
                //     //     return s;
                //     // }
                // }
                resolve: {
                    text: function() {
                        return {};
                    }
                }
            };

            //custom overrides
            if (params) {

                //custom success cb
                if (params.onSuccess) {
                    vm.cb = params.onSuccess
                }

                //custom text
                if (params.text) {
                    modalParams.resolve = {
                        text: function() {
                            return {
                                heading: params.text.heading,
                                subHeadingJoin: params.text.subHeadingJoin,
                                subHeadingLogin: params.text.subHeadingLogin
                            };
                        }
                    };
                }
            }

            var modalInstance = $uibModal.open(modalParams);

            

            return modalInstance
                 .result
                 .then(registerSuccessFunc,registerFailureFunc)
                 .catch(registerErrorFunc);
        };

    };

    joinModalService.$inject = ['$rootScope','$uibModal'];
    mod.service('joinModalService', joinModalService);
};
