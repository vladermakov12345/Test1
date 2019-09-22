module.exports = function(app) {
    var unsubscribeController = function () {
		var vm = this;
    };

    unsubscribeController.$inject = [];
    app.controller('unsubscribeController', unsubscribeController);
};