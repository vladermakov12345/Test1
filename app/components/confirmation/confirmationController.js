module.exports = function(app) {
    var confirmationController = function (url,environmentService) {

        var vm = this;

        //var env = environmentService();
        //vm.BASEURL_CONTENT = env.BASEURL_CONTENT;
        //vm.getMainImage = getMainImage;

        // require("file-loader?name=Miriam_and_her_mom.jpg!../../../resources/img/about/Miriam_and_her_mom.jpg");

        // function getMainImage() {
        //     return url.content + '/assets/cities/main/NewYork_main.jpg';
        // }
    };

    confirmationController.$inject = ['url','environmentService'];
    app.controller('confirmationController', confirmationController);
};
