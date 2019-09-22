module.exports = function(mod){
    var syncServiceFunc = function (localStorageService, dataFactory) {

        return {
            upsertCustomer: function() {
                var profile = localStorageService.getUserProfile();
                var params = {
                    customerId: profile.customerId,
                    sub: profile.sub,
                    email: profile.email,
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    picture: profile.picture
                };
                //dataFactory.addCustomer(params);
                //removing as it poses security hole
            }
        };
	};

    syncServiceFunc.$inject = ['localStorageService','dataFactory'];
    mod.factory('syncService', syncServiceFunc);
};