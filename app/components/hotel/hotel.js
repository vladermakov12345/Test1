module.exports = function(app){
	//var app = angular.module('app');
    require('./ratesController.js')(app);
    require('./hotelController.js')(app);
};
