module.exports = function(app) {
    var alreadyRegisteredController = function ($scope,loginModalService) {
		var vm = this;
        vm.login = login;
		vm.closeModal = closeModal;

        function login() {
            loginModalService();
            vm.closeModal();
        }
        function closeModal() {
            if ($scope.$close) {
                $scope.$close();
            }
        }
    };

    alreadyRegisteredController.$inject = ['$scope','loginModalService'];
    app.controller('alreadyRegisteredController', alreadyRegisteredController);
};


