module.exports = function(app){
    require('./categoriesController.js')(app);
    require('./subCategoriesController.js')(app);
    require('./topicsController.js')(app);
    require('./forumAuthController.js')(app);
    require('./askController.js')(app);
    require('./postsController.js')(app);
};
