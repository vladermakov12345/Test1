module.exports = function(app){
    require('./loginController.js')(app);
    require('./loginModalController.js')(app);
    require('./socialLoginRedirController.js')(app);
};