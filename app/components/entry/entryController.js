module.exports = function(app) {
    var entryController = function ($state) {
    	console.log('redirecting to home');
    	$state.go('home');
  	};

    entryController.$inject = ['$state'];
    app.controller('entryController', entryController);
};