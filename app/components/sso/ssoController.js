module.exports = function(app) {
    var ssoController = function ($stateParams,$window,$location,localStorageService,angularAuth0,loginModalService,guid,environmentService) {

        var vm = this;
        vm.env = environmentService();
        
        vm.destination = $stateParams.destination;

        vm.init = init;
        vm.displayStatus = displayStatus;
        vm.saveAuthResult = saveAuthResult;
        vm.renew = renew;
        vm.reauthorize = reauthorize;

        vm.init();

        function init() {
            vm.displayStatus();
            return;

        	//ensure we have a post forum auth location
        	if (!vm.destination || vm.destination==='') {
        		vm.destination = $location.absUrl();
        	}

            //check if we are already signed in
            //checkSession

        	//initiate forum auth
//todo: adjust based on environment
			var url = 'https://community.accessiblego.com/session/sso?return_path='+vm.destination;
        	$window.open(url, '_self');
            //authorize?client_id=IgHu6fqiEEEbbOtY5wMqkHp0LrgnF6Ex&response_type=token&redirect_uri=https://community.accessiblego.com/session/sso
        }


        function displayStatus() {
            var status = '';
            var token = localStorageService.getAccessToken();
            debugger;
            var eDate = localStorageService.getExpiresAt();
            var expirationDate = new Date(Number.parseInt(eDate));
            var isExpired = expirationDate < new Date();

            if (!token) {
                status = 'There is no access token present in local storage, meaning that you are not logged in. Click renew to attempt an SSO login.';
            } else if (isExpired) {
                status = 'There is an expired access token in local storage. <a href="#" onclick="renew()">Click here to renew it</a>';
                //document.getElementById('logout').style.visibility = 'visible';
            } else {
                status = 'There is an access token in local storage, and it expires on ${expirationDate}. <a href="#" onclick="renew()">Click here to renew it</a>';
                //document.getElementById('logout').style.visibility = 'visible';
            }
            vm.message = status;
        }

        function saveAuthResult (result) {
            localStorageService.setAccessToken(result.accessToken);
            debugger;
            localStorageService.setExpiresAt(result.expiresIn);
            //localStorage.setItem('expirationDate', Date.now() + Number.parseInt(result.expiresIn) * 1000);
            vm.displayStatus();
        }

        function renew () {
            var state = setupAuthState();

            var nonce = guid.get();
            localStorageService.setNonce(nonce);

            var redirectUri = vm.env.auth0_redir_base+'/forum/pending';

            var options = {
                audience: vm.env.auth0_spa_audience,
                responseType: 'token code id_token', //code for server, token for app side flows
                redirectUri: redirectUri,
                state: state,
                nonce: nonce,
                scope: 'openid name email picture profile edit:favorite',
                domain: vm.env.auth0_spa_domain,
                timeout: 10000,     //milliseconds used to timeout when the `/authorize` call is failing as part of the silent authentication with postmessage enabled due to a configuration.
            };

            angularAuth0.checkSession(options, function (err, result) {
                if (err) {
                    alert('Could not get a new token using silent authentication (${err.error}). Redirecting to login page...');
                    loginModalService();
                } else {
                    vm.saveAuthResult(result);
                }
            });
        }
        function setupAuthState() {
            var state = guid.get();
//TODO: var stateEncoded = base64.fromByteArray(state);
            localStorageService.setAuthState(state);
            return state;
        }
        function reauthorize(cb) {

            
        }

        //overwriting the parse hash???
        angularAuth0.parseHash(window.location.hash, function (err, result) {
            debugger;
            if (err) {
                console.error(err);
            } else if (result) {
                vm.saveAuthResult(result);
            }
        });

        
    };

    ssoController.$inject = ['$stateParams','$window','$location','localStorageService','angularAuth0','loginModalService','guid','environmentService'];
    app.controller('ssoController', ssoController);
};
