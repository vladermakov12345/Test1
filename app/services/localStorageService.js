//facade for node module store
module.exports = function(mod){
    var localStorageService = function ($rootScope,AUTH_EVENTS) {

    	var store = require('store');
    	var maxHoursLocalPersist = 24*60*60*1000;	//24 hours

    	//keys
    	var keySetupTimestamp = 'setupTimestamp';
    	var keyIsAuthenticated = 'isAuthenticated';
    	var keyAuthConnection = 'userAuthConnection';
    	var keyAccessToken = 'accessToken';
    	var keyIdToken = "idToken";
        var keyExpiresAt = "expiresAt";
    	var keyNonce = "nonce";
        var keyAuthState = "auth_state";
    	var keyUserProfile = 'userProfile';
        var keyUserLocation = 'userLocation';
        var keyUserFavorites = 'userFavorites';
        var keyUserReviews = 'userReviews';
        var keyUserPreferences = 'userPreferences';
        var keyUserBio = 'userBio';
        var keyUserBookings = 'userBookings';
    	var keyPreLoginState = 'preLoginState';
        var keyUserCUGDetails = 'userCUGDetails';
        var keyPPNTrackingIdBase = 'ppnTrackingId_';
        var keyTempReview = 'temp_review_';
        var keyAllAirports = 'allAirports';
        var keyUserDiscourseSession = 'userDiscourseSession'

    	//tracking for expiration
    	var _getSetupTimestamp = function() {
    		return store.get(keySetupTimestamp);
    	};

    	//private removals
		var _removeAccessToken = function() {
			store.remove(keyAccessToken);
		};
		var _removeIdToken = function() {
			store.remove(keyIdToken);
		};
        var _removeExpiresAt = function() {
            store.remove(keyExpiresAt);
        };
		var _removeUserProfile = function() {
			store.remove(keyUserProfile);
		};
        var _removeUserCugDetails = function() {
            store.remove(keyUserCUGDetails);
        };
        var _removeUserLocation = function() {
            store.remove(keyUserLocation);
        };
        var _removeUserPreferences = function() {
            store.remove(keyUserPreferences);
        };
        var _removeUserBio = function() {
            store.remove(keyUserBio);
        };
        var _removeUserBookings = function() {
            store.remove(keyUserBookings);
        };
        var _removeUserFavorites = function() {
            store.remove(keyUserFavorites);
        };
        var _removeUserReviews = function() {
            store.remove(keyUserReviews);
        };
        var _removeAirports = function() {
            store.remove(keyAllAirports);
        };
        //var _removePreLoginState = function() {
        //    store.remove(keyPreLoginState);
        //};
        var _removeUserDiscourseSession = function() {
            store.remove(keyUserDiscourseSession);
        };
		var _removeSetupTimestamp = function() {
			store.remove(keySetupTimestamp);
		};
        var _setAuthenticationState = function(authenticationState) {
            store.set(keyIsAuthenticated, authenticationState);
        };
        var _clearUserData = function() {
            _setAuthenticationState(false);

            _removeAccessToken();
            _removeIdToken();
            _removeExpiresAt();
            _removeUserProfile();
            _removeUserCugDetails();
            _removeUserLocation();
            _removeUserPreferences();
            _removeUserBio();
            _removeUserBookings();
            _removeUserFavorites();
            _removeUserReviews();
            _removeAirports();
            //_removePreLoginState();
            _removeUserDiscourseSession();

            $rootScope.isAuthenticated = undefined;
            $rootScope.authConnection = undefined;
            $rootScope.accessToken = undefined;
            $rootScope.idToken = undefined;
            $rootScope.expiresAt = undefined;
            $rootScope.userProfile = undefined;
            $rootScope.userCUGDetails = undefined;
            $rootScope.userLocation = undefined;
            $rootScope.userPreferences = undefined;
            $rootScope.userBio = undefined;
            $rootScope.userBookings = undefined;
            $rootScope.userFavorites = undefined;
            $rootScope.userDiscourseSession = undefined;

            _removeSetupTimestamp();

            $rootScope.$broadcast('user-data-cleared');
        };

        $rootScope.$on(AUTH_EVENTS.logoutSuccess, function(event, data) {
            _clearUserData();
        });

        return {
        	resetSetupTimestamp: function() {
	    		var now = new Date().getTime();
	    		return store.set(keySetupTimestamp, now);
	    	},

        	setAuthenticationState: function(authenticationState) {
                _setAuthenticationState(authenticationState);
        	},
        	getAuthenticationState: function() {
        		return store.get(keyIsAuthenticated);
        	},

        	setAuthConnection: function(authConnection) {
        		store.set(keyAuthConnection, authConnection);
        	},
        	getAuthConnection: function() {
        		return store.get(keyAuthConnection);
        	},

        	setAccessToken: function(accessToken) {
        		store.set(keyAccessToken, accessToken);
        	},
        	getAccessToken: function() {
        		return store.get(keyAccessToken);
        	},

        	setIdToken: function(idToken) {
        		store.set(keyIdToken, idToken);
        	},
        	getIdToken: function() {
        		return store.get(keyIdToken);
        	},

            setExpiresAt: function(expiresAt) {
                store.set(keyExpiresAt,expiresAt);
            },
            getExpiresAt: function() {
                return store.get(keyExpiresAt);
            },

        	setNonce: function(nonce) {
        		store.set(keyNonce, nonce);
        	},
        	getNonce: function() {
        		return store.get(keyNonce);
        	},

            setAuthState: function(state) {
                store.set(keyAuthState, state);
            },
            getAuthState: function() {
                return store.get(keyAuthState);
            },

        	setUserProfile: function(userProfile) {
        		if (userProfile.picture) {
        			userProfile.picture = userProfile.picture.replace('s=480','s=120');
        		}

                //hack to handle discrepancy between social and non-social 
                if (userProfile['https://accessiblego/app_metadata']) {
                    userProfile.customerId = userProfile['https://accessiblego/app_metadata'].customerId;
                }
                
        		store.set(keyUserProfile, userProfile);
        	},
        	getUserProfile: function() {
        		return store.get(keyUserProfile);
        	},

            setUserName: function(name) {
                var profile = store.get(keyUserProfile);
                profile.given_name = name.given_name;
                profile.family_name = name.family_name;
                store.set(keyUserProfile,profile);
            },

            setUserLocation: function(userLocation) {
                store.set(keyUserLocation, userLocation);
                $rootScope.$broadcast('userLocation:updated');
            },
            getUserLocation: function() {
                return store.get(keyUserLocation);
            },

            //--- user favorites ---//
            setUserFavorites: function(userFavorites) {
                store.set(keyUserFavorites, userFavorites);
                $rootScope.$broadcast('userFavorites:updated', userFavorites);
            },
            getUserFavorites: function() {
                return store.get(keyUserFavorites) || [];
            },

            //--- user reviews ---//
            setUserReviews: function(userReviews) {
                store.set(keyUserReviews, userReviews);
                $rootScope.$broadcast('userReviews:updated', userReviews);
            },
            getUserReviews: function() {
                return store.get(keyUserReviews) || [];
            },

            //-- discourse --//
            setDiscourseSession: function(state) {
                store.set(keyUserDiscourseSession, state || false);
            },
            getDiscourseSession: function() {
                return store.get(keyUserDiscourseSession) || false;
            },

            //--- user preferences ---//
            setUserPreferences: function(userPreferences) {
                var prefs = {};
                angular.forEach(userPreferences,function(pref,idx) {
                    var key = pref.category+'_'+pref.type;
                    if (!prefs[key]) {
                        prefs[key] = { active: true };
                    }
                });
                store.set(keyUserPreferences, prefs);

                $rootScope.$broadcast('userPreferences:updated');
            },
            getUserPreferences: function() {
                return store.get(keyUserPreferences);
            },
            userPreferenceExists: function(key) {
                var userPreferences = this.getUserPreferences();
                if (userPreferences === undefined)
                    return false;
                return userPreferences[key] !== undefined;
            },
            insertUserPreference: function(userPreference) {
                var key = userPreference.category+'_'+userPreference.type;
                var userPreferences = this.getUserPreferences();
                if (!userPreferences) {
                    userPreferences = {};
                }
                if (!userPreferences[key]) {
                    userPreferences[key] = { active: true };
                }
                store.set(keyUserPreferences, userPreferences);
            },
            removeUserPreference: function(userPreference) {
                var key = userPreference.category+'_'+userPreference.type;
                var userPreferences = this.getUserPreferences();
                if (userPreferences[key]) {
                    delete userPreferences[key];
                }
                store.set(keyUserPreferences, userPreferences);
            },

            //-- user bio --//
            setUserBio: function(userBio) {
                store.set(keyUserBio,userBio);
                $rootScope.$broadcast('userBio:updated');
            },
            getUserBio: function() {
                var bio = store.get(keyUserBio);

                //user may not yet have a bio record
                if (!bio) {
                    bio = {};
                }
                //adjust if firstname/lastname still originates from auth0
                var userProfile = this.getUserProfile();
                if (userProfile) {
                    if (!bio.givenName || bio.givenName === null) {
                        bio.givenName = userProfile.given_name;
                    }
                    if (!bio.familyName || bio.familyName === null) {
                        bio.familyName = userProfile.family_name;
                    }
                }

                return bio;
            },

            //-- user bookings --//
            setUserBookings: function(userBookings) {
                store.set(keyUserBookings,userBookings);
                $rootScope.$broadcast('userBookings:updated');
            },
            getUserBookings: function() {
                return store.get(keyUserBookings);
            },

        	getCustomerId: function() {
        		var u = this.getUserProfile();

                if (!u) {
                    return '';
                }

                if (u['https://accessiblego/app_metadata']) {
                    return u['https://accessiblego/app_metadata'].customerId;
                }

                if (u.customerId) {
                    return u.customerId;
                }
                
                return '';
        	},

        	setPreLoginState: function(preLoginState) {
        		store.set(keyPreLoginState, preLoginState);
        	},
        	getPreLoginState: function() {
        		return store.get(keyPreLoginState);
        	},

            setUserCUGDetails: function(details) {
                store.set(keyUserCUGDetails, details);
                $rootScope.userCUGDetails = details;
            },
            getUserCUGDetails: function() {
                return store.get(keyUserCUGDetails);
            },

        	clearUserData: function() {
                _clearUserData();
        	},

        	//reset $rootScope with data pesisted in localStorage
        	resetRootScope: function(fromRefresh) {

        		if (fromRefresh) {
					var setupTime = _getSetupTimestamp();
					var now = new Date().getTime();

					//expired?
					if (setupTime !== undefined && now-setupTime > maxHoursLocalPersist) {
						_clearUserData();
					}
				}

        		$rootScope.isAuthenticated = this.getAuthenticationState();
        		$rootScope.authConnection = this.setAuthConnection();
        		$rootScope.accessToken = this.getAccessToken();
        		$rootScope.idToken = this.getIdToken();
                $rootScope.expiresAt = this.getExpiresAt();
        		$rootScope.userProfile = this.getUserProfile();
                $rootScope.userCUGDetails = this.getUserCUGDetails();
                $rootScope.userPreferences = this.getUserPreferences();
                $rootScope.userBio = this.getUserBio();
                $rootScope.userFavorites = this.getUserFavorites();

        		if ($rootScope.isAuthenticated) {
        			this.resetSetupTimestamp();
        		}

        		$rootScope.$broadcast('user-data-reset');
        	},

            //retrieve the name of the identify provider (auth, facebook, google)
        	getIdentityService: function() {
        		if (!this.getAuthenticationState()) {
        			return '';
        		}

				var profile = this.getUserProfile();
				var pipeIndex = profile.sub.indexOf('|');
				return profile.sub.substring(0,pipeIndex);
        	},
        	
            //retrieve the customer's user id defined by identify provider
        	getUserId: function() {
        		if (!this.getAuthenticationState()) {
        			return '';
        		}

				var profile = this.getUserProfile();
				var pipeIndex = profile.sub.indexOf('|')+1;
				return profile.sub.substring(pipeIndex);
        	},

            //used by userPersistenceService, but is trackingId really needed :)
            setPPNTrackingId: function(context, trackingId) {
                store.set(keyPPNTrackingIdBase+context,trackingId);
            },
            getPPNTrackingId: function(context) {
                store.get(keyPPNTrackingIdBase+context);
            },
            clearPPNTrackingId: function(context) {
                store.remove(keyPPNTrackingIdBase+context);
            },

            //persisting a user's review while they login/signin
            //context is needed for post-login db-check so that we submit ONLY if user has not already submitted a review
            setTemporaryReview: function(context,review) {
                store.set(keyTempReview+context,review);
            },
            getTemporaryReview: function() {
                store.get(keyTempReview+context);
            },
            clearTemporaryReview: function() {
                store.remove(keyTempReview+context);
            },
        };
    };

    localStorageService.$inject = ['$rootScope','AUTH_EVENTS'];
    mod.factory('localStorageService', localStorageService);
};