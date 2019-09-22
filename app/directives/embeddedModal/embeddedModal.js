(function() {
    require("./embeddedModal.less");

    var embeddedModalFunc = function (a,b,c) {
        return {
            restrict: 'E',
            scope: {
                //consider a callback function instead of redirect
                redirect: '=redirect',
                embedded: '=embedded',
                modal: '=modal'
            },
            template: function(tElement, tAttrs) {
                switch(tAttrs.modal){
                    case 'login':
                        return require('./../../components/account/login/login.html');
                }
            },
            controller: 'loginController',
            controllerAs: 'vm',
            bindToController: true,
            resolve: {
                text: function() {
                    return {
                        heading: 'Come on in!',
                        subHeadingJoin: 'Create an account to join the travel forum',
                        subHeadingLogin: 'Log in to join the travel forum'
                    };
                }
            }

            //link: function(scope, element, attrs) {
            //     scope.vm.redirect = attrs.redirect;
            //     scope.vm.embedded = attrs.embedded;
            //    scope.vm.modal = attrs.modal;
            //}
        };
    };

    embeddedModalFunc.$inject = [];
    angular.module('app').directive('embeddedModal', embeddedModalFunc);
})();

