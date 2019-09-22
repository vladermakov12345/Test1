module.exports = function(mod){
    var userPersistenceService = function (localStorageService) {
    	var ppntrackingid = "";
    	var PPNTRACKINGID_COOKIE = "PPNTRACKINGID";

		return {
			setPPNTrackingId: function(domain, ppnTrackingId) {
				this.checkDomain(domain);
				ppntrackingid = ppnTrackingId;
				//$cookies.put(this.getDomainCookie(domain), ppnTrackingId);
				localStorageService.setPPNTrackingId(domain,ppnTrackingId);
			},
			getPPNTrackingId: function(domain) {
				this.checkDomain(domain);
				//ppntrackingid = $cookies.get(this.getDomainCookie(domain));
				ppntrackingid = localStorageService.getPPNTrackingId(domain);
				return ppntrackingid;
			},
			clearPPNTrackingId: function(domain) {
				this.checkDomain(domain);
				ppntrackingid = "";
				//$cookies.remove(this.getDomainCookie(domain));
				localStorageService.clearPPNTrackingId(domain);
			},
			checkDomain: function(domain) {
				var validDomains = ['hotel','car','flight'];
				if (validDomains.indexOf(domain) === -1) throw "invalid userPersistenceService domain specified";
			},
			getDomainCookie: function(domain) {
				return PPNTRACKINGID_COOKIE+'_'+domain;
			}
		};
	};

    userPersistenceService.$inject = ['localStorageService'];
    mod.factory('userPersistenceService', userPersistenceService);
};