module.exports = function(app) {
    var contactController = function ($rootScope,dataFactory,environmentService) {

        var vm = this;

        var env = environmentService();

        vm.errs = [];
        vm.getMainImage = getMainImage;
        vm.sendMessage = sendMessage;
        vm.isMessageSent = false;
        vm.init = init;

        vm.init();

        function init() {

            //setup meta tags
            var title = 'Contact Us';
            var desc = 'Contact Us';
            $rootScope.metaTagService.setup({
                metaTitle: title,
                ogTitle: title,
                twitterTitle: title,
                twitterImageAlt: title,
                ogDescription: desc,
                ogImage: getMainImage(),
                twitterDescription: desc,
                twitterImage: getMainImage()
            });

        }

        function getMainImage() {
            return env.BASEURL_CONTENT + '/assets/cities/main/NewYork_main.jpg';
        }

        function sendMessage() {

            vm.errs = [];
            vm.isMessageSent = false;

            if (!vm.name || vm.name==='') {
                vm.errs.push({ message: 'Please enter your name.'});
                return;
            }

            if (!vm.email || vm.email==='') {
                vm.errs.push({ message: 'Please enter your email address.'});
                return;
            }

            if (!vm.message || vm.message==='') {
                vm.errs.push({ message: 'Please enter a message.'});
                return;
            }

            var successFunc = function (response) {

                if (!response.data.success) {
                    vm.errs = response.data.errors;
                    return;
                }

                vm.hasSignedUp = true;
                vm.isMessageSent = true;
                //(not sure how to do this) ensure user is aware of response message
                // setTimeout( function() { alert( 'Hello, '+name ) }, 1000 );
                // $('#signupConfirmationMessage').attr("tabIndex",-1).focus();
                console.log('message sent');
            };

            var errFunc = function (data, status, headers, config) {
                console.log('message not sent');
                console.log(data);
            };

            dataFactory.contact(vm.name, vm.email, vm.message).then(successFunc, errFunc);
        }
    };

    contactController.$inject = ['$rootScope','dataFactory','environmentService'];
    app.controller('contactController', contactController);
};
