/*
    This service centralizes logic for
    a. intermediation between localStorageService and favorite directive implementations
    b. consumption by account - user favorites tab
    c. fetching lists of favorites for in-page use (future function)
*/
module.exports = function(mod){
    var userFavoriteService = function ($rootScope, localStorageService, dataFactory, $q) {

        var _createDefaultFavoriteResponse = function() {
            return {
                success: false,
                message: '',
                favorite: undefined
            };
        };

        var s4 = function() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        };

        return {
            isFavorite: function(type, referenceId) {
                localStorageService.getUserFavorites();
                return true;
            },
            getFavorite: function(type, referenceId) {
                //must be signed in
                if (!$rootScope.isAuthenticated) {
                    return undefined;
                }

                //favorites exist?
                var userFavs = localStorageService.getUserFavorites();
                if (!userFavs) {
                    return undefined;
                }

                //return favorite
                for(var f=0;f< userFavs.length;f++) {
                    var favorite = userFavs[f];
                    if (type===favorite.type && referenceId===favorite.referenceId) {
                        return favorite;
                    }
                }
            },
            addFavorite: function(type, referenceId) {

                var favDeferred = $q.defer();

                var retObj = _createDefaultFavoriteResponse();

                if (type === undefined || type === '') {
                    retObj.success = false;
                    retObj.message = 'No type passed to favorite directive';
                    favDeferred.resolve(retObj);
                    return;
                }

                if (referenceId === undefined || referenceId === '') {
                    retObj.success = false;
                    retObj.message = 'No referenceid passed to favorite directive';
                    favDeferred.resolve(retObj);
                    return;
                }

                var successFunc = function (response) {
                    if (response.data.status === 'fail') {
                        retObj.success = false;
                        retObj.message = 'Unable to add user favorite';
                        favDeferred.resolve(retObj);
                        return;
                    }

                    //reference to new favorite
                    var newFav = response.data.data;

                    //update local storage
                    var userFavs = localStorageService.getUserFavorites();
                    userFavs.push(newFav);
                    localStorageService.setUserFavorites(userFavs);

                    //return success
                    retObj.success = true;
                    retObj.message = 'Favorite has been added';
                    retObj.favorite = newFav;
                    favDeferred.resolve(retObj);
                    return;
                };

                var errFunc = function (response) {
                    console.log('error');
                    console.log(response);
                    retObj.success = false;
                    retObj.message = 'Unable to add user favorite at this time.';
                    favDeferred.resolve(retObj);
                    return;
                };

                var params = {
                    referenceId:referenceId,
                    type:type
                };

                dataFactory.addUserFavorite(params).then(successFunc, errFunc);

                return favDeferred.promise;
            },
            removeFavorite: function(userFavoriteId) {

                var favDeferred = $q.defer();

                var retObj = _createDefaultFavoriteResponse();

                if (userFavoriteId === undefined || userFavoriteId === '') {
                    retObj.success = false;
                    retObj.message = 'No user Favorite id provided';
                    favDeferred.resolve(retObj);
                    return;
                }

                var successFunc = function (response) {
                    if (response.data.status === 'fail') {
                        retObj.success = false;
                        retObj.message = 'Unable to remove user favorite';
                        favDeferred.resolve(retObj);
                        return;
                    }

                    //update local storage
                    var userFavs = localStorageService.getUserFavorites();
                    for(var f=0;f< userFavs.length;f++) {
                        var favorite = userFavs[f];
                        if (userFavoriteId===favorite.userFavoriteId) {
                          userFavs.splice(f, 1);
                          break;
                        }
                    }
                    localStorageService.setUserFavorites(userFavs);

                    //return success
                    retObj.success = true;
                    retObj.message = 'Favorite has been removed';
                    favDeferred.resolve(retObj);
                    return;
                };

                var errFunc = function (response) {
                    console.log('error');
                    console.log(response);
                    retObj.success = false;
                    retObj.message = 'Unable to remove user favorite at this time.';
                    favDeferred.resolve(retObj);
                    return;
                };

                var params = {
                    userFavoriteId: userFavoriteId
                };
                dataFactory.removeUserFavorite(params).then(successFunc, errFunc);

                return favDeferred.promise;
            }

        };
	};

    userFavoriteService.$inject = ['$rootScope','localStorageService', 'dataFactory', '$q'];
    mod.factory('userFavoriteService', userFavoriteService);
};