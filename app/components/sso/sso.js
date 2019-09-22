module.exports = function(app){
    require('./discourseController.js')(app);
    require('./ssoController.js')(app);
    require('./ssoCBController.js')(app);
};
