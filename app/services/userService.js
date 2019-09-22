//interface for managing backend user data
module.exports = function(mod){
    var userService = function ($q,dataFactory,localStorageService,$rootScope,AUTH_EVENTS) {

        var vm = this;

        vm.init = init;
        vm.clearProfile = clearProfile;
        vm.resetUserLocation = resetUserLocation;
        vm.resetUserFavorites = resetUserFavorites;
        vm.resetUserReviews = resetUserReviews;
        vm.resetUserPreferences = resetUserPreferences;
        vm.resetUserBio = resetUserBio;
        vm.resetUserBookings = resetUserBookings;

        var _userProfile = {};

        vm.init();

        function init() {
            vm.resetUserBio();
            vm.resetUserLocation();
            vm.resetUserFavorites();
            vm.resetUserReviews();
            vm.resetUserPreferences();
            vm.resetUserBookings();
        }

        //-- EVENTS --//
        $rootScope.$on(AUTH_EVENTS.logoutSuccess, function(event, data) {
            vm.clearProfile();
        });

        $rootScope.$on('userBio:updated', function(event, data) {
            vm.resetUserBio();
        });
        $rootScope.$on('userLocation:updated', function(event, data) {
            vm.resetUserLocation();
        });
        $rootScope.$on('userFavorites:updated', function(event, data) {
            vm.resetUserFavorites();
        });
        $rootScope.$on('userReviews:updated', function(event, data) {
            vm.resetUserReviews();
        });
        $rootScope.$on('userPreferences:updated', function(event, data) {
            vm.resetUserPreferences();
        });

//TODO: resetUserBookings event

        function resetUserBio() {
            _userProfile.bio = localStorageService.getUserBio();
            userBio = _userProfile.bio;
        }
        function resetUserLocation() {
            _userProfile.location = localStorageService.getUserLocation();
            userLocation = _userProfile.location;
        }
        function resetUserPreferences() {
            _userProfile.preferences = localStorageService.getUserPreferences();
        }
        function resetUserFavorites() {
            _userProfile.userFavorites = localStorageService.getUserFavorites();
        }
        function resetUserReviews() {
            _userProfile.userReviews = localStorageService.getUserReviews();
        }
        function resetUserBookings() {
            _userProfile.userBookings = localStorageService.getUserBookings();
        }

        function clearProfile() {
            _userProfile.location = undefined;
            _userProfile.preferences = undefined;
            _userProfile.bio = undefined;
            _userProfile.userBookings = undefined;
            _userProfile.userFavorites = undefined;
            _userProfile.userReviews = undefined;
        }

        return {
            userLocation: _userProfile.location,
            userPreferences: _userProfile.preferences,
            userBio: _userProfile.bio,
            userBookings: _userProfile.userBookings,
            userFavorites: _userProfile.userFavorites,
            userReviews: _userProfile.userReviews,
        	clearProfile: function() {
                vm.clearProfile();
	    	},
            getProfile: function() {
                return _userProfile;
            },

            //-- userLocation 
            getFormattedLocation: function() {
                _userProfile.location = localStorageService.getUserLocation();
                var userLocation = _userProfile.location;
                
                if (userLocation === undefined)
                    return;

                var loc = '';
                if (userLocation.city) {
                    loc += userLocation.city;
                }
                if (userLocation.stateProv) {
                    loc += ', '+userLocation.stateProv;
                }
                if (userLocation.country) {
                    loc += ', '+userLocation.country;
                }
                return loc;
            },
            saveLocation: function(userLocation) {

                var deferred = $q.defer();
                var res = { errors: [] };

                //success cb
                var successCB = function(response) {
                    //handle failure
                    if (response.data.status === 'fail') {
                        res.errors = response.data.errors;
                        deferred.reject(res);
                        return;
                    }

                    //handle success
                    var newUserLocation = response.data.data;
                    localStorageService.setUserLocation(newUserLocation);
                    vm.resetUserLocation();
                    deferred.resolve(response.data);
                };     
                var errorCB = function(errObj) {
                    //TODO: how are we going to track of this? sentry?
                    console.log('ERROR: ' + errObj.data.message);
                    res.errors.push('Error occurred while saving location.  We apologize for the inconvenience.');
                    deferred.reject(res);
                };

                dataFactory.saveUserLocation({
                    city: userLocation.city,
                    stateProv: userLocation.stateProv,
                    country: userLocation.country
                }).then(successCB,errorCB);

                return deferred.promise;
            },
            getFormattedName: function() {
                _userProfile.bio = localStorageService.getUserBio();
                var bio = _userProfile.bio;
                var n = '';

                if (bio !== undefined) {
                    if (bio.givenName) {
                        n += bio.givenName;
                    }
                    if (bio.familyName) {
                        n += ' '+bio.familyName;
                    }
                }

                //use original userProfile data
                // if (n.trim() === '' && _userProfile) {
                //     var userProfile = localStorageService.getUserProfile();
                //     if (userProfile.given_name) {
                //         n += userProfile.given_name;
                //     }
                //     if (userProfile.family_name) {
                //         n += ' '+userProfile.family_name;
                //     }
                // }

                return n;
            },

            // getName: function() {
            //     var formattedName = this.getFormattedName();
            //     if (formattedName === '')
            //         return '';

            //     var spl = formattedName.split(' ');
            //     var f = spl.length>0?spl[0]:'';
            //     var l = spl.length>0?spl[1]:'';

            //     return {
            //         first: f,
            //         last: l
            //     };
            // },

            //-- user preferences --//
            userPreferenceExists: function(key) {
                return localStorageService.userPreferenceExists(key);
            },
            savePreference: function(userPreference) {

                var deferred = $q.defer();
                var res = { errors: [] };

                //success cb
                var successCB = function(response) {
                    //handle failure
                    if (response.data.status === 'fail') {
                        res.errors = response.data.errors;
                        deferred.reject(res);
                        return;
                    }

                    var newUserPreference = response.data.data;

                    //update local storage
                    localStorageService.insertUserPreference(newUserPreference);

                    // var prefs = localStorageService.getUserPreferences();
                    // if (!prefs[userPreference.category]) {
                    //     prefs[userPreference.category] = [];
                    // }
                    // if (!prefs[userPreference.category][userPreference.type]) {
                    //     prefs[userPreference.category][userPreference.type] = true;
                    // }

                    // angular.forEach(prefs,function(pref,idx) {
                    //     if (pref.category==userPreference.category && pref.type==userPreference.type) {
                    //         prefs.splice(i,1);
                    //         return;
                    //     }
                    // });
                    //prefs.push(newUserPreference);
                    //localStorageService.setUserPreferences(prefs);

                    //update this service
                    //vm.resetUserPreferences();

                    deferred.resolve(response.data);
                };     
                var errorCB = function(errObj) {
                    //TODO: how are we going to track of this? sentry?
                    console.log('ERROR: ' + errObj.data.Message);
                    res.errors.push('Error occurred while saving a user preference.  We apologize for the inconvenience.');
                    deferred.reject(res);
                };

                dataFactory.saveUserPreference({
                    category: userPreference.category,
                    type: userPreference.type,
                }).then(successCB,errorCB);

                return deferred.promise;
            },
            removePreference: function(userPreference) {

                var deferred = $q.defer();
                var res = { errors: [] };

                //success cb
                var successCB = function(response) {
                    //handle failure
                    if (response.data.status === 'fail') {
                        res.errors = response.data.errors;
                        deferred.reject(res);
                        return;
                    }

                    var removedPreference = response.data.data;

                    //update local storage
                    localStorageService.removeUserPreference(removedPreference);

                    // var prefs = localStorageService.getUserPreferences();
                    // if (prefs[userPreference.category] && prefs[userPreference.category][userPreference.type]) {
                    //     delete prefs[userPreference.category][userPreference.type];
                    // }

                    // angular.forEach(prefs,function(pref,idx) {
                    //     if (pref.category==userPreference.category && pref.type==userPreference.type) {
                    //         prefs.splice(idx,1);
                    //         return;
                    //     }
                    // });
                    //localStorageService.setUserPreferences(prefs);

                    //update this service
                    //vm.resetUserPreferences();

                    deferred.resolve(response.data);
                };     
                var errorCB = function(errObj) {
                    //TODO: how are we going to track of this? sentry?
                    console.log('ERROR: ' + errObj.data.Message);
                    res.errors.push('Error occurred while removing a user preference.  We apologize for the inconvenience.');
                    deferred.reject(res);
                };

                dataFactory.removeUserPreference({
                    category: userPreference.category,
                    type: userPreference.type,
                }).then(successCB,errorCB);

                return deferred.promise;
            },

            //-- user bio --//
            getBio: function() {
                return localStorageService.getUserBio();
            },
            // resetUserBio: function() {
            //     vm.resetUserBio();
            // },
            saveBio: function(userBio) {
                var deferred = $q.defer();
                var res = { errors: [] };

                //success cb
                var successCB = function(response) {
                    //handle failure
                    if (response.data.status === 'fail') {
                        res.errors = response.data.errors;
                        deferred.reject(res);
                        return;
                    }

                    //handle success
                    var newUserBio = response.data.data;
                    localStorageService.setUserBio(newUserBio);
                    vm.resetUserBio();
                    deferred.resolve(response.data);
                };     
                var errorCB = function(errObj) {
                    //TODO: how are we going to track of this? sentry?
                    console.log('ERROR: ' + errObj.data.Message);
                    res.errors.push('Error occurred while saving location.  We apologize for the inconvenience.');
                    deferred.reject(res);
                };

                dataFactory.saveUserBio({
                    givenName: userBio.givenName,
                    familyName: userBio.familyName,
                    ageRange: userBio.ageRange,
                    gender: userBio.gender,
                    travelFrequency: userBio.travelFrequency,
                    travelPurpose: userBio.travelPurpose,
                    bio: userBio.bio
                }).then(successCB,errorCB);

                return deferred.promise;
            },

            //-- user bookings --//
            getBookings: function() {
                return localStorageService.getUserBookings();
            }
        };
    };

    userService.$inject = ['$q','dataFactory','localStorageService','$rootScope','AUTH_EVENTS'];
    mod.factory('userService', userService);
};