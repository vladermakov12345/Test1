module.exports = function(app){
	require('./testController.js')(app);
    require('./modals/testModalController.js')(app);
};
