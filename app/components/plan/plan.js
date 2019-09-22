module.exports = function(app){
    require('./byCityController.js')(app);
    require('./travelIdeasController.js')(app);
};
