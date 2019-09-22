/*
    purpose of error service is to handle 400 responses
    1. write to console for debugging (production has flag)
    2. broadcast to application when an error occurs
    3. track the error for debugging
*/
module.exports = function(mod){
    var errorService = function (dataFactory, $rootScope, guid) {

        var vm = this;

        vm.track = function(errObj) {
            try {
                var sfunc = function (response) {
                    console.info('error successfully tracked');
                };

                var efunc = function (error) {
                    console.error(error);
                };

                dataFactory.track(errObj).then(sfunc, efunc);
            }
            catch(err) {
              console.error(err);
            }
        };

        vm.broadcast = function(e) {
            try {
              $rootScope.$broadcast('error', errObj);
            }
            catch(err) {
              //vm.track(err,'Error while attempting to broadcast error.');
            }
        };

        this.handle = function(httpResponse, message) {

            var trackingId = guid.get();

            var errObj = {
                httpResponse: httpResponse,
                trackingId: trackingId,
                message: message
            };

            console.info(errObj);
            vm.broadcast(errObj);
            vm.track(errObj);

            return message + '(tracking id: '+trackingId+' )';
        };

    };

    errorService.$inject = ['dataFactory','$rootScope', 'guid'];
    mod.service('errorService', errorService);
};
