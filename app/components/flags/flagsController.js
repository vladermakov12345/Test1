module.exports = function(app) {
    var flagsController = function (errorService) {

        var vm = this;
        vm.message = "TODO";

        vm.testFlag = function() {
	        var mockResponse = { stupid: 'thing', doesnt: ['WORK'] };
	        var msg = errorService.handle(mockResponse,'A problem occurred while booking.  We have recorded this error and are looking into it.  Please <a href="contact">contact us</a> if you would like to be notified when this error is resolved. We apologize for the inconvenience.');
        };

    };

    flagsController.$inject = ['errorService'];
    app.controller('flagsController', flagsController);
};
