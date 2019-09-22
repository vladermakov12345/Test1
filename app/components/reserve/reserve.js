module.exports = function(app){
    require('./reserveController.js')(app);
    require('./reservecugController.js')(app);
};
