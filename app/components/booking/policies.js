module.exports = function(app){
    require('./privacypolicyController.js')(app);
    require('./termsofuseController.js')(app);
};
