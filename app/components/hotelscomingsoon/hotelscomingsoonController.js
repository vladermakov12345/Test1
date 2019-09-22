module.exports = function(app) {
    var hotelscomingsoonController = function ($scope) {

  		var vm = this;

		//TODO: create stub for hotel service
        //hotelService.search()

		//example of how you could inject in function
		// $scope.join = function(email) {
		// 	console.log('same difference');
		// };
		//in template you would have this attribute: process="join(email)"
    };

    hotelscomingsoonController.$inject = ['$scope'];
    app.controller('hotelscomingsoonController', hotelscomingsoonController);
};
