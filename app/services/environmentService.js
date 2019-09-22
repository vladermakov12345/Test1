module.exports = function(mod){
    var environmentService = function ($location) {

        var host = $location.host();

        var path = require('path');
        var outputPath = path.resolve(__dirname, 'web');

        var devSettings = {
            name: 'development',
            outputPath: outputPath,
            SPA_URL: 'http://localhost:'+3000,
            BASEURL_CONTENT: 'http://localhost:90', //prev: BASEURL_CONTENT, url.content
            BASEURL_CRM: 'http://localhost:82', //prev: BASEURL_CRM
            BASEURL_PRICELINE: 'http://localhost:82/api/',   //prev: BASEURL_PRICELINE, url.priceline + '/api/';
            auth0_spa_clientId: 'iFjq163SsuN6FJkCtILb2jzADF8TBK4b',
            auth0_spa_audience: 'https://accessiblego-dev.com/api/',
            auth0_spa_domain: 'accessiblego-dev.auth0.com',
            auth0_redir_base: 'http://localhost:'+3000,
            blog: 'https://public-api.wordpress.com/rest/v1.1/sites/accessiblego.wordpress.com',
            fb_app_id: '304208490167034',
            authCheckSessionMilliseconds: 60000,   //1 min
            FORUM_URL: 'https://community.accessiblego.com',
            google_maps_api_key: 'AIzaSyBibkwsrpmNkF3O-cXPHO0tkS-F4ATFbRc',
            cdn: 'https://accessiblego.azureedge.net',
            cdn_static: 'https://accessiblego.z20.web.core.windows.net',

            //still needed?
            redirectUri: 'http://localhost:9090/sl'
        };

        //case frontonly
        var frontonlySettings = {
            name: 'development',
            outputPath: outputPath, //outputPath: '/web';
            SPA_URL: 'http://localhost:'+8080,
            BASEURL_CONTENT: 'https://accessiblego-admin.azurewebsites.net',
            BASEURL_CRM: 'https://accessiblego-staging.azurewebsites.net',
            BASEURL_PRICELINE: 'https://accessiblego-staging.azurewebsites.net/api/',
            auth0_spa_clientId: 'iFjq163SsuN6FJkCtILb2jzADF8TBK4b',
            auth0_spa_audience: 'https://accessiblego-dev.com/api/',
            auth0_spa_domain: 'accessiblego-dev.auth0.com',
            auth0_redir_base: 'http://localhost:'+8080,
            blog: 'https://public-api.wordpress.com/rest/v1.1/sites/accessiblego.wordpress.com',
            fb_app_id: '304208490167034',
            authCheckSessionMilliseconds: 60000,   //1 min
            FORUM_URL: 'https://community.accessiblego.com',
            google_maps_api_key: 'AIzaSyBibkwsrpmNkF3O-cXPHO0tkS-F4ATFbRc',
            cdn: 'https://accessiblego.azureedge.net',
            cdn_static: 'https://accessiblego.z20.web.core.windows.net'
        };

        var stageSettings = {
            name: 'staging',
            outputPath: path.resolve(__dirname, 'web'),
            SPA_URL: 'https://accessiblego-staging.azurewebsites.net',
            BASEURL_CONTENT: 'https://accessiblego-admin.azurewebsites.net',
            BASEURL_CRM: 'https://accessiblego-staging.azurewebsites.net',
            BASEURL_PRICELINE: 'https://accessiblego-staging.azurewebsites.net/api/',
            auth0_spa_clientId: 'iFjq163SsuN6FJkCtILb2jzADF8TBK4b',
            auth0_spa_audience: 'https://accessiblego-dev.com/api/',
            auth0_spa_domain: 'accessiblego-dev.auth0.com',
            auth0_redir_base: 'https://accessiblego-staging.azurewebsites.net',
            blog: 'https://public-api.wordpress.com/rest/v1.1/sites/accessiblego.wordpress.com',
            fb_app_id: '304208490167034',
            authCheckSessionMilliseconds: 60000,   //1 min
            FORUM_URL: 'https://community.accessiblego.com',
            google_maps_api_key: 'AIzaSyDYOQbgX4h1ZYXmgfBa32rBMoFjaSOOtVY',
            cdn: 'https://accessiblego.azureedge.net',
            cdn_static: 'https://accessiblego.z20.web.core.windows.net',

            //still needed?
            redirectUri: 'https://accessiblego-staging.azurewebsites.net/sl'
        };

        //case build
        /*
            outputPath = '../../build/web/';
            BASEURL_CONTENT = 'http://localhost:90';
            BASEURL_CRM = 'http://localhost:9090';
            BASEURL_PRICELINE = 'http://localhost:9090/api/';
            auth0_spa_clientId = 'iFjq163SsuN6FJkCtILb2jzADF8TBK4b';
            auth0_spa_audience: 'https://accessiblego-dev.com/api/',
            auth0_spa_domain: 'accessiblego-dev.auth0.com',
            auth0_redir_base = 'http://localhost:9090';
        */

        //case test
        /*
            auth0_spa_clientId = 'iFjq163SsuN6FJkCtILb2jzADF8TBK4b';
            auth0_spa_audience: 'https://accessiblego-dev.com/api/',
            auth0_spa_domain: 'accessiblego-dev.auth0.com',
            auth0_redir_base = 'TBD';
        */

        var prodSettings = {
            name: 'production',
            outputPath: path.resolve(__dirname, 'web'),
            SPA_URL: 'https://accessibleGO.com',
            BASEURL_CONTENT: 'https://accessiblego-admin.azurewebsites.net',
            BASEURL_CRM: 'https://accessiblego.com',
            BASEURL_PRICELINE: 'https://accessiblego.com/api/',
            auth0_spa_clientId: 'sDGCDcLc9KyeJXJRLnu3Oirj868nznCn',
            auth0_spa_audience: 'https://accessiblego.com/api/',
            auth0_spa_domain: 'auth.accessiblego.com', //'accessiblego.auth0.com',
            auth0_redir_base: 'https://accessiblego.com',
            blog: 'https://public-api.wordpress.com/rest/v1.1/sites/accessiblego.wordpress.com',
            fb_app_id: '276779086068509',
            authCheckSessionMilliseconds: 900000,   //15 min
            FORUM_URL: 'https://community.accessiblego.com',
            google_maps_api_key: 'AIzaSyDkitKzViB8jnu4qsvYhqH_27lj404rrAA',
            cdn: 'https://accessiblego.azureedge.net',
            cdn_static: 'https://accessiblego.z20.web.core.windows.net',
            
            //still needed?
            redirectUri: 'https://accessiblego.com/sl'
        };

        return function () {
            switch(host) {
                case 'accessiblego.com': return prodSettings;
                case 'accessiblego-staging.azurewebsites.net': return stageSettings;
                case 'localhost': {
                    //frontonly?
                    if ($location.port() === 8080) return frontonlySettings;
                    
                    //default
                    return devSettings;
                }
                default:
                    console.log('switch failed to identify environment');
            }
        };
    };

    environmentService.$inject = ['$location'];
    mod.service('environmentService', environmentService);
};
