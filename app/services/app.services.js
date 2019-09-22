//module.exports = function(servicesModule){
	var servicesModule = angular.module('agoServices',[]);
	require('./guid.js')(servicesModule);
	require('./localStorageService.js')(servicesModule);
	require('./utilities.js')(servicesModule);
	require('./dataLayerService.js')(servicesModule);
	require('./transformRequestAsFormPostFunc.js')(servicesModule);
	require('./dataFactory.js')(servicesModule);
	require('./diagnostic/errorService.js')(servicesModule);
	require('./clubgo/clubgoService.js')(servicesModule);
	require('./clubgo/showQualifiedOrganizationsModalService.js')(servicesModule);
	require('./sentences.js')(servicesModule);
	require('./email.js')(servicesModule);
	//TBD: require('./askService.js');
	require('./accountService.js')(servicesModule);
	require('./loginModalService.js')(servicesModule);
	require('./joinModalService.js')(servicesModule);
	require('./resetPassModalService.js')(servicesModule);
	require('./alreadyRegisteredModalService.js')(servicesModule);
	require('./currentlyLoggedInModalService.js')(servicesModule);
	require('./travelersClubModalService.js')(servicesModule);
	require('./sessionService.js')(servicesModule);
	require('./authService.js')(servicesModule);
	require('./addPhotosModalService.js')(servicesModule);
	require('./imageService.js')(servicesModule);
	require('./cacheService.js')(servicesModule);
	require('./metaTagService.js')(servicesModule);
	require('./userPersistenceService.js')(servicesModule);
	require('./userService.js')(servicesModule);
	require('./redirectionService.js')(servicesModule);
	require('./environmentService.js')(servicesModule);
	require('./userFavoriteService.js')(servicesModule);
	require('./syncService.js')(servicesModule);
	require('./reviewService.js')(servicesModule);
	require('./forumService.js')(servicesModule);

	//-- hotel services
	require('./hotel/hotelUtilities.js')(servicesModule);
	require('./hotel/hotelSearchService.js')(servicesModule);
	require('./hotel/hotelLookupService.js')(servicesModule);
	require('./hotel/hotelBookService.js')(servicesModule);
	require('./hotel/hotelPolicyService.js')(servicesModule);
	require('./hotel/hotelSearchFilterService.js')(servicesModule);

	//-- flights services
	require('./air/flightSearchService.js')(servicesModule);
	require('./air/flightSelectReturnService.js')(servicesModule);
	require('./air/flightUtilities.js')(servicesModule);

	//-- cars  services
	require('./cars/carSearchService.js')(servicesModule);
	require('./cars/carBookService.js')(servicesModule);
	require('./cars/carUtilities.js')(servicesModule);

	//-- discourse
	require('./data/data.discourse.js')(servicesModule);
//};
