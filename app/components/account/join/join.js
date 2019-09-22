module.exports = function(app){
    require('./joinController.js')(app);
    require('./joinModalController.js')(app);
    require('./travelersClubController.js')(app);
};
