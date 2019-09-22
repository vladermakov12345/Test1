module.exports = function(mod){
    var redirectionService = function ($q,$state,localStorageService,$rootScope,AUTH_EVENTS,$window) {

        var vm = this;

        var _redirectionTarget;

        var _getPreLoginState = function() {
        	return localStorageService.getPreLoginState();
        };
        var _resetRedirectionTarget = function() {
            _redirectionTarget = undefined;
        };

        return {
            hasRedirPending: function() {
                return _redirectionTarget !== undefined;
            },
            setRedirect: function(target) {
                _redirectionTarget = target;
            },
            removeRedirect: function() {
                _redirectionTarget = undefined;
            },
            applyRedirect: function() {
                if (!_redirectionTarget) {
                    //console.log('no redirection target found');
                    return false;
                }

                $state.go(_redirectionTarget.to, _redirectionTarget.params, {reload: true});
                _resetRedirectionTarget();
                return true;
            },
        	afterLoginSuccess: function() {
        		
                //redirection target specified?
                if (this.applyRedirect()) {
                    return;
                }

                var preloginstate = _getPreLoginState();

                //prelogin exist?
                if (!preloginstate) {
                    return;
                }

                //handle special case for forum
                //this is a hack b/c it cannot be accessed via $state
                if (preloginstate === 'discourse') {
                    $window.open('https://community.accessiblego.com/session/sso?return_path=/', '_self');
                }

        		//from homepage :: go to welcome
            	if (preloginstate.path === 'home') {
              		$state.go('start');
              		return;
            	}

            	$state.go(preloginstate.path, preloginstate.params);
        	}
        };

    };

    redirectionService.$inject = ['$q','$state','localStorageService','$rootScope','AUTH_EVENTS','$window'];
    mod.factory('redirectionService', redirectionService);
};


/*
        function redir() {

            //TODO: create redirection service (this is copied in registerController, et al?)

            //TODO: use case: from ActiveCampaign
            if (false) {
                $state.go('accountPageUi', {'t': 'settings' }, {reload:true});
                return;
            }

            //TODO: use case?
            if ($stateParams.r) {
                var rep = $stateParams.r.replace('/','');
                $state.go(rep);
                return;
            }

            //TODO: use case?
            //do we still need this if we have preloginstate below???
            if ($rootScope.state_redirect) {

                //TODO: create a redirection service (so we have a singleton managing this intead of on $rootScope)
                $state.go($rootScope.state_redirect.to, $rootScope.state_redirect.params);
                
                //state_redirect should only be used once!
                $rootScope.state_redirect = undefined;

                return;
            }

            //TODO: use case?
            var preloginstate = localStorageService.getPreLoginState();
            if (preloginstate) {
              $state.go(preloginstate.path, preloginstate.params);
              return;
            }

            //TODO: use case?
            $state.go('start');
        }
*/