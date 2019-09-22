module.exports = function(app){
    require('./flightSearchController.js')(app);
    require('./flightSelectReturnController.js')(app);
};
