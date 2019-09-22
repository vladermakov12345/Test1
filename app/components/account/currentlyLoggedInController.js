module.exports = function(app) {
    var currentlyLoggedInController = function ($scope) {
		var vm = this;
		vm.closeModal = closeModal;

        function closeModal() {
            if ($scope.$close) {
                $scope.$close();
            }
        }
    };

    currentlyLoggedInController.$inject = ['$scope'];
    app.controller('currentlyLoggedInController', currentlyLoggedInController);
};


