module.exports = function(app){
    require('./resetpassController.js')(app);
	require('./resetpassModalController.js')(app);
};