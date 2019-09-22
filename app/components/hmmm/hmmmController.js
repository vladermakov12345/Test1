module.exports = function(app) {
    var hmmmController = function () {

        var vm = this;
        vm.message = $stateParams.message;

    };

    hmmmController.$inject = [];
    app.controller('hmmmController', hmmmController);
};
