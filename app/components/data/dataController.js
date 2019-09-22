module.exports = function(app) {
    var dataController = function ($window) {

        $window.open('https://hotels.accessibilitydata.com', '_self');

    };

    dataController.$inject = ['$window'];
    app.controller('dataController', dataController);
};
